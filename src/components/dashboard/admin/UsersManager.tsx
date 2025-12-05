import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Shield, GraduationCap, Building2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { useUniversitiesList } from '@/hooks/useUniversities';

type AppRole = 'admin' | 'student' | 'university';

interface UserWithRole {
  id: string;
  full_name: string | null;
  university_id: string | null;
  role?: AppRole;
  universities?: { name_ru: string } | null;
}

interface UseUsersOptions {
  page: number;
  pageSize: number;
  search: string;
}

function useUsers({ page, pageSize, search }: UseUsersOptions) {
  return useQuery({
    queryKey: ['users', { page, pageSize, search }],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, full_name, university_id, universities(name_ru)', { count: 'exact' });

      if (search) {
        query = query.ilike('full_name', `%${search}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      // Fetch roles
      const userIds = data?.map(u => u.id) || [];
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const rolesMap = new Map(rolesData?.map(r => [r.user_id, r.role as AppRole]));
      const usersWithRoles = data?.map(u => ({ ...u, role: rolesMap.get(u.id) })) || [];

      return {
        data: usersWithRoles as UserWithRole[],
        totalCount: count || 0,
      };
    },
  });
}

export default function UsersManager() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>('student');
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>('');

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useUsers({ page, pageSize, search });
  const { data: universities } = useUniversitiesList();

  const updateMutation = useMutation({
    mutationFn: async ({ userId, role, universityId }: { userId: string; role: AppRole; universityId: string | null }) => {
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);
      if (roleError) throw roleError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ university_id: role === 'university' ? universityId : null })
        .eq('id', userId);
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Успешно', description: 'Пользователь обновлен' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const handleEdit = (user: UserWithRole) => {
    setEditingUser(user);
    setSelectedRole(user.role || 'student');
    setSelectedUniversityId(user.university_id || '');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    await updateMutation.mutateAsync({
      userId: editingUser.id,
      role: selectedRole,
      universityId: selectedUniversityId || null,
    });
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const getRoleBadge = (role: AppRole | undefined) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="gap-1"><Shield className="h-3 w-3" />Админ</Badge>;
      case 'university':
        return <Badge variant="secondary" className="gap-1"><Building2 className="h-3 w-3" />ВУЗ</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><GraduationCap className="h-3 w-3" />Студент</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление пользователями</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(value) => { setSearch(value); setPage(1); }}
            placeholder="Поиск по имени..."
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Привязанный ВУЗ</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!data?.data.length ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Пользователи не найдены
                      </TableCell>
                    </TableRow>
                  ) : data.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || 'Без имени'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.universities?.name_ru || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={data?.totalCount || 0}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            />
          </>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать пользователя</DialogTitle>
              <DialogDescription>Измените роль и привязку пользователя</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Имя</Label>
                  <Input value={editingUser.full_name || ''} disabled />
                </div>
                <div>
                  <Label>Роль</Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Студент</SelectItem>
                      <SelectItem value="university">ВУЗ</SelectItem>
                      <SelectItem value="admin">Админ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedRole === 'university' && (
                  <div>
                    <Label>Привязать к ВУЗу</Label>
                    <Select value={selectedUniversityId} onValueChange={setSelectedUniversityId}>
                      <SelectTrigger><SelectValue placeholder="Выберите ВУЗ" /></SelectTrigger>
                      <SelectContent>
                        {universities?.map((uni) => (
                          <SelectItem key={uni.id} value={uni.id}>{uni.name_ru}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
                  <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Сохранить
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
