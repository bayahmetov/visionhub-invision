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

interface Partnership {
  id: string;
  university_id: string;
  partner_name: string;
  partner_country: string;
  partnership_type: string | null;
  description_ru: string | null;
  universities?: { name_ru: string };
}

interface University {
  id: string;
  name_ru: string;
}

export default function PartnershipsManager() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartnership, setEditingPartnership] = useState<Partial<Partnership> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [partnershipsRes, universitiesRes] = await Promise.all([
      supabase.from('partnerships').select('*, universities(name_ru)').order('partner_name'),
      supabase.from('universities').select('id, name_ru').order('name_ru')
    ]);
    
    if (partnershipsRes.data) setPartnerships(partnershipsRes.data as Partnership[]);
    if (universitiesRes.data) setUniversities(universitiesRes.data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingPartnership?.university_id || !editingPartnership?.partner_name || !editingPartnership?.partner_country) {
      toast({ title: 'Ошибка', description: 'Заполните обязательные поля', variant: 'destructive' });
      return;
    }

    const data = {
      university_id: editingPartnership.university_id,
      partner_name: editingPartnership.partner_name,
      partner_country: editingPartnership.partner_country,
      partnership_type: editingPartnership.partnership_type || null,
      description_ru: editingPartnership.description_ru || null
    };

    let error;
    if (editingPartnership.id) {
      const result = await supabase.from('partnerships').update(data).eq('id', editingPartnership.id);
      error = result.error;
    } else {
      const result = await supabase.from('partnerships').insert(data);
      error = result.error;
    }

    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Успешно', description: editingPartnership.id ? 'Партнерство обновлено' : 'Партнерство создано' });
      setIsDialogOpen(false);
      setEditingPartnership(null);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить это партнерство?')) return;
    
    const { error } = await supabase.from('partnerships').delete().eq('id', id);
    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Успешно', description: 'Партнерство удалено' });
      fetchData();
    }
  };

  const filteredPartnerships = partnerships.filter(p => 
    p.partner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.partner_country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Управление партнерствами</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPartnership({})}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить партнерство
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPartnership?.id ? 'Редактировать партнерство' : 'Добавить партнерство'}</DialogTitle>
            </DialogHeader>
            {editingPartnership && (
              <div className="grid gap-4 py-4">
                <div>
                  <Label>ВУЗ *</Label>
                  <Select 
                    value={editingPartnership.university_id} 
                    onValueChange={(v) => setEditingPartnership({...editingPartnership, university_id: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Выберите ВУЗ" /></SelectTrigger>
                    <SelectContent>
                      {universities.map((uni) => (
                        <SelectItem key={uni.id} value={uni.id}>{uni.name_ru}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Название партнера *</Label>
                  <Input 
                    value={editingPartnership.partner_name || ''} 
                    onChange={(e) => setEditingPartnership({...editingPartnership, partner_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Страна *</Label>
                  <Input 
                    value={editingPartnership.partner_country || ''} 
                    onChange={(e) => setEditingPartnership({...editingPartnership, partner_country: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Тип партнерства</Label>
                  <Select 
                    value={editingPartnership.partnership_type || ''} 
                    onValueChange={(v) => setEditingPartnership({...editingPartnership, partnership_type: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exchange">Обмен студентами</SelectItem>
                      <SelectItem value="research">Научное сотрудничество</SelectItem>
                      <SelectItem value="dual_degree">Двойной диплом</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Описание</Label>
                  <Textarea 
                    value={editingPartnership.description_ru || ''} 
                    onChange={(e) => setEditingPartnership({...editingPartnership, description_ru: e.target.value})}
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
              placeholder="Поиск по названию или стране..."
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
                  <TableHead>Партнер</TableHead>
                  <TableHead>Страна</TableHead>
                  <TableHead>ВУЗ</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartnerships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Партнерства не найдены
                    </TableCell>
                  </TableRow>
                ) : filteredPartnerships.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.partner_name}</TableCell>
                    <TableCell>{p.partner_country}</TableCell>
                    <TableCell>{p.universities?.name_ru}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => { setEditingPartnership(p); setIsDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(p.id)}
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
