import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Clock, CheckCircle, XCircle, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AccessRequest {
  id: string;
  university_id: string;
  status: string;
  message: string | null;
  admin_comment: string | null;
  created_at: string;
  universities: {
    name_ru: string;
    logo_url: string | null;
  };
}

interface University {
  id: string;
  name_ru: string;
}

export default function AccessRequestForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [message, setMessage] = useState('');

  // Fetch existing requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['access-requests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_requests')
        .select('id, university_id, status, message, admin_comment, created_at, universities(name_ru, logo_url)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as AccessRequest[];
    },
    enabled: !!user,
  });

  // Fetch universities for dropdown
  const { data: universities = [] } = useQuery({
    queryKey: ['universities-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name_ru')
        .order('name_ru');
      if (error) throw error;
      return data as University[];
    },
  });

  // Filter out universities that already have requests
  const requestedUniversityIds = requests.map(r => r.university_id);
  const availableUniversities = universities.filter(u => !requestedUniversityIds.includes(u.id));

  const createRequestMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('access_requests').insert({
        user_id: user!.id,
        university_id: selectedUniversity,
        message: message.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests', user?.id] });
      setSelectedUniversity('');
      setMessage('');
      toast.success('Заявка отправлена');
    },
    onError: () => {
      toast.error('Не удалось отправить заявку');
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('access_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests', user?.id] });
      toast.success('Заявка отменена');
    },
  });

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Запросить доступ к ВУЗу
          </CardTitle>
          <CardDescription>
            Подайте заявку на получение роли представителя университета для управления его карточкой
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Выберите университет</label>
            <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите ВУЗ" />
              </SelectTrigger>
              <SelectContent>
                {availableUniversities.map((uni) => (
                  <SelectItem key={uni.id} value={uni.id}>
                    {uni.name_ru}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Сообщение (необязательно)</label>
            <Textarea
              placeholder="Укажите вашу должность, контактные данные или причину запроса..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            onClick={() => createRequestMutation.mutate()}
            disabled={!selectedUniversity || createRequestMutation.isPending}
          >
            {createRequestMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Отправить заявку
          </Button>
        </CardContent>
      </Card>

      {/* Existing requests */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Мои заявки</h3>
        {requestsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              У вас пока нет заявок на доступ
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {request.universities.logo_url ? (
                        <img src={request.universities.logo_url} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{request.universities.name_ru}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  {request.message && (
                    <p className="text-sm mt-4 text-muted-foreground">
                      <span className="font-medium text-foreground">Ваше сообщение:</span> {request.message}
                    </p>
                  )}
                  
                  {request.admin_comment && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      <span className="font-medium text-foreground">Комментарий администратора:</span> {request.admin_comment}
                    </p>
                  )}

                  {request.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => cancelRequestMutation.mutate(request.id)}
                      disabled={cancelRequestMutation.isPending}
                    >
                      Отменить заявку
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
