import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Clock, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AccessRequest {
  id: string;
  user_id: string;
  university_id: string;
  status: string;
  message: string | null;
  admin_comment: string | null;
  created_at: string;
  universities: {
    name_ru: string;
    logo_url: string | null;
  };
  profiles: {
    full_name: string | null;
    phone: string | null;
  };
}

export default function AccessRequestsManager() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-access-requests'],
    queryFn: async () => {
      // Fetch requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('access_requests')
        .select('id, user_id, university_id, status, message, admin_comment, created_at, universities(name_ru, logo_url)')
        .order('created_at', { ascending: false });
      if (requestsError) throw requestsError;

      // Fetch profiles for each user
      const userIds = [...new Set(requestsData.map(r => r.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', userIds);
      if (profilesError) throw profilesError;

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      return requestsData.map(r => ({
        ...r,
        profiles: profilesMap.get(r.user_id) || { full_name: null, phone: null }
      })) as unknown as AccessRequest[];
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, comment }: { id: string; status: string; comment: string }) => {
      const { error } = await supabase
        .from('access_requests')
        .update({ status, admin_comment: comment || null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-requests'] });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, universityId }: { userId: string; universityId: string }) => {
      // Update user role to 'university'
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: 'university' })
        .eq('user_id', userId);
      if (roleError) throw roleError;

      // Update profile with university_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ university_id: universityId })
        .eq('id', userId);
      if (profileError) throw profileError;
    },
  });

  const handleAction = async (type: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    try {
      await updateRequestMutation.mutateAsync({
        id: selectedRequest.id,
        status: type === 'approve' ? 'approved' : 'rejected',
        comment: adminComment,
      });

      if (type === 'approve') {
        await updateUserRoleMutation.mutateAsync({
          userId: selectedRequest.user_id,
          universityId: selectedRequest.university_id,
        });
        toast.success('Заявка одобрена, роль пользователя обновлена');
      } else {
        toast.success('Заявка отклонена');
      }

      setSelectedRequest(null);
      setAdminComment('');
      setActionType(null);
    } catch {
      toast.error('Не удалось обработать заявку');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> На рассмотрении</Badge>;
      case 'approved':
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" /> Одобрено</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Отклонено</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending requests */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Ожидающие рассмотрения ({pendingRequests.length})
        </h3>
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Нет заявок на рассмотрение
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {request.universities.logo_url ? (
                        <img src={request.universities.logo_url} alt="" className="h-12 w-12 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{request.universities.name_ru}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <User className="h-4 w-4" />
                          <span>{request.profiles?.full_name || 'Без имени'}</span>
                          {request.profiles?.phone && <span>• {request.profiles.phone}</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType('approve');
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Одобрить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType('reject');
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Отклонить
                      </Button>
                    </div>
                  </div>
                  
                  {request.message && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Сообщение от пользователя:</p>
                      <p className="text-sm text-muted-foreground">{request.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processed requests */}
      {processedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">История заявок</h3>
          <div className="space-y-4">
            {processedRequests.map((request) => (
              <Card key={request.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{request.universities.name_ru}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.profiles?.full_name || 'Без имени'} • {new Date(request.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  {request.admin_comment && (
                    <p className="text-sm mt-3 text-muted-foreground">
                      <span className="font-medium text-foreground">Комментарий:</span> {request.admin_comment}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Action dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={(open) => {
        if (!open) {
          setSelectedRequest(null);
          setActionType(null);
          setAdminComment('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Одобрить заявку' : 'Отклонить заявку'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Пользователь получит роль представителя ВУЗа и сможет редактировать его данные.'
                : 'Пользователь получит уведомление об отклонении заявки.'}
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium mb-2 block">Комментарий (необязательно)</label>
            <Textarea
              placeholder="Добавьте комментарий..."
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedRequest(null);
              setActionType(null);
              setAdminComment('');
            }}>
              Отмена
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={() => handleAction(actionType!)}
              disabled={updateRequestMutation.isPending || updateUserRoleMutation.isPending}
            >
              {(updateRequestMutation.isPending || updateUserRoleMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {actionType === 'approve' ? 'Одобрить' : 'Отклонить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
