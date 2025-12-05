import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Search, Shield, GraduationCap, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type AppRole = 'admin' | 'student' | 'university';

interface UserWithRole {
  id: string;
  full_name: string | null;
  university_id: string | null;
  role?: AppRole;
  universities?: { name_ru: string } | null;
}

interface University {
  id: string;
  name_ru: string;
}

export default function UsersManager() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>('student');
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [usersRes, universitiesRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, university_id, universities(name_ru)'),
      supabase.from('universities').select('id, name_ru').order('name_ru')
    ]);
    
    if (usersRes.data) {
      // Fetch roles separately
      const userIds = usersRes.data.map(u => u.id);
      const { data: rolesData } = await supabase.from('user_roles').select('user_id, role').in('user_id', userIds);
      const rolesMap = new Map(rolesData?.map(r => [r.user_id, r.role as AppRole]));
      const usersWithRoles = usersRes.data.map(u => ({ ...u, role: rolesMap.get(u.id) }));
      setUsers(usersWithRoles as UserWithRole[]);
    }
    if (universitiesRes.data) setUniversities(universitiesRes.data);
    setLoading(false);
  };

  const handleEdit = (user: UserWithRole) => {
    setEditingUser(user);
    setSelectedRole(user.role || 'student');
    setSelectedUniversityId(user.university_id || '');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    // Update role
    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ role: selectedRole })
      .eq('user_id', editingUser.id);

    if (roleError) {
      toast({ title: 'Ошибка', description: roleError.message, variant: 'destructive' });
      return;
    }

    // Update university_id in profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ university_id: selectedRole === 'university' ? selectedUniversityId || null : null })
      .eq('id', editingUser.id);

    if (profileError) {
      toast({ title: 'Ошибка', description: profileError.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Успешно', description: 'Пользователь обновлен' });
    setIsDialogOpen(false);
    setEditingUser(null);
    fetchData();
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: AppRole) => {
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
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Поиск по имени..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
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
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Пользователи не найдены
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || 'Без имени'}</TableCell>
                    <TableCell>{getRoleBadge(user.role || 'student')}</TableCell>
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
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать пользователя</DialogTitle>
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
                        {universities.map((uni) => (
                          <SelectItem key={uni.id} value={uni.id}>{uni.name_ru}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
                  <Button onClick={handleSave}>Сохранить</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
