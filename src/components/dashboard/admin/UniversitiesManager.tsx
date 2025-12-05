import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

type UniversityType = 'state' | 'private' | 'national' | 'international';

interface University {
  id: string;
  name_ru: string;
  name_kz: string | null;
  name_en: string | null;
  city: string;
  region: string;
  type: UniversityType;
  founded_year: number | null;
  students_count: number | null;
  teachers_count: number | null;
  has_dormitory: boolean | null;
  has_military_department: boolean | null;
  has_grants: boolean | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  description_ru: string | null;
}

const emptyUniversity: Partial<University> = {
  name_ru: '',
  name_kz: '',
  name_en: '',
  city: '',
  region: '',
  type: 'state',
  founded_year: null,
  students_count: null,
  teachers_count: null,
  has_dormitory: false,
  has_military_department: false,
  has_grants: false,
  website: '',
  email: '',
  phone: '',
  description_ru: ''
};

export default function UniversitiesManager() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<Partial<University> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('name_ru');
    
    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      setUniversities(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingUniversity?.name_ru || !editingUniversity?.city || !editingUniversity?.region) {
      toast({ title: 'Ошибка', description: 'Заполните обязательные поля', variant: 'destructive' });
      return;
    }

    const universityData = {
      name_ru: editingUniversity.name_ru,
      name_kz: editingUniversity.name_kz || null,
      name_en: editingUniversity.name_en || null,
      city: editingUniversity.city,
      region: editingUniversity.region,
      type: editingUniversity.type || 'state',
      founded_year: editingUniversity.founded_year || null,
      students_count: editingUniversity.students_count || null,
      teachers_count: editingUniversity.teachers_count || null,
      has_dormitory: editingUniversity.has_dormitory || false,
      has_military_department: editingUniversity.has_military_department || false,
      has_grants: editingUniversity.has_grants || false,
      website: editingUniversity.website || null,
      email: editingUniversity.email || null,
      phone: editingUniversity.phone || null,
      description_ru: editingUniversity.description_ru || null
    };

    let error;
    if (editingUniversity.id) {
      const result = await supabase
        .from('universities')
        .update(universityData)
        .eq('id', editingUniversity.id);
      error = result.error;
    } else {
      const result = await supabase.from('universities').insert(universityData);
      error = result.error;
    }

    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Успешно', description: editingUniversity.id ? 'ВУЗ обновлен' : 'ВУЗ создан' });
      setIsDialogOpen(false);
      setEditingUniversity(null);
      fetchUniversities();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот ВУЗ?')) return;
    
    const { error } = await supabase.from('universities').delete().eq('id', id);
    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Успешно', description: 'ВУЗ удален' });
      fetchUniversities();
    }
  };

  const filteredUniversities = universities.filter(u => 
    u.name_ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Управление ВУЗами</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingUniversity({ ...emptyUniversity })}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить ВУЗ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingUniversity?.id ? 'Редактировать ВУЗ' : 'Добавить ВУЗ'}</DialogTitle>
            </DialogHeader>
            {editingUniversity && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Название (RU) *</Label>
                    <Input 
                      value={editingUniversity.name_ru || ''} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, name_ru: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Название (KZ)</Label>
                    <Input 
                      value={editingUniversity.name_kz || ''} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, name_kz: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Название (EN)</Label>
                  <Input 
                    value={editingUniversity.name_en || ''} 
                    onChange={(e) => setEditingUniversity({...editingUniversity, name_en: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Город *</Label>
                    <Input 
                      value={editingUniversity.city || ''} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Регион *</Label>
                    <Input 
                      value={editingUniversity.region || ''} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, region: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Тип</Label>
                    <Select 
                      value={editingUniversity.type} 
                      onValueChange={(v) => setEditingUniversity({...editingUniversity, type: v as UniversityType})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="state">Государственный</SelectItem>
                        <SelectItem value="private">Частный</SelectItem>
                        <SelectItem value="national">Национальный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Год основания</Label>
                    <Input 
                      type="number"
                      value={editingUniversity.founded_year || ''} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, founded_year: parseInt(e.target.value) || null})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Студентов</Label>
                    <Input 
                      type="number"
                      value={editingUniversity.students_count || ''} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, students_count: parseInt(e.target.value) || null})}
                    />
                  </div>
                  <div>
                    <Label>Преподавателей</Label>
                    <Input 
                      type="number"
                      value={editingUniversity.teachers_count || ''} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, teachers_count: parseInt(e.target.value) || null})}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={editingUniversity.has_dormitory || false}
                      onCheckedChange={(v) => setEditingUniversity({...editingUniversity, has_dormitory: v})}
                    />
                    <Label>Общежитие</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={editingUniversity.has_military_department || false}
                      onCheckedChange={(v) => setEditingUniversity({...editingUniversity, has_military_department: v})}
                    />
                    <Label>Военная кафедра</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={editingUniversity.has_grants || false}
                      onCheckedChange={(v) => setEditingUniversity({...editingUniversity, has_grants: v})}
                    />
                    <Label>Гранты</Label>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Website</Label>
                    <Input 
                      value={editingUniversity.website || ''} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, website: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={editingUniversity.email || ''} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Телефон</Label>
                    <Input 
                      value={editingUniversity.phone || ''} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Описание</Label>
                  <Textarea 
                    value={editingUniversity.description_ru || ''} 
                    onChange={(e) => setEditingUniversity({...editingUniversity, description_ru: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
                  <Button onClick={handleSave}>Сохранить</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Поиск по названию или городу..."
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
                  <TableHead>Название</TableHead>
                  <TableHead>Город</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUniversities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      ВУЗы не найдены
                    </TableCell>
                  </TableRow>
                ) : filteredUniversities.map((uni) => (
                  <TableRow key={uni.id}>
                    <TableCell className="font-medium">{uni.name_ru}</TableCell>
                    <TableCell>{uni.city}</TableCell>
                    <TableCell>
                      {uni.type === 'state' ? 'Гос.' : uni.type === 'private' ? 'Частный' : 'Нац.'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => { setEditingUniversity(uni); setIsDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(uni.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
