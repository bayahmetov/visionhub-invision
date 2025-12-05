import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Partnership {
  id: string;
  partner_name: string;
  partner_country: string;
  partnership_type: string | null;
  description_ru: string | null;
}

interface PartnershipsEditorProps {
  universityId: string;
}

export default function PartnershipsEditor({ universityId }: PartnershipsEditorProps) {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartnership, setEditingPartnership] = useState<Partial<Partnership> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPartnerships();
  }, [universityId]);

  const fetchPartnerships = async () => {
    const { data } = await supabase
      .from('partnerships')
      .select('*')
      .eq('university_id', universityId)
      .order('partner_name');
    
    if (data) setPartnerships(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingPartnership?.partner_name || !editingPartnership?.partner_country) {
      toast({ title: 'Ошибка', description: 'Заполните обязательные поля', variant: 'destructive' });
      return;
    }

    const data = {
      university_id: universityId,
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
      fetchPartnerships();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить это партнерство?')) return;
    
    const { error } = await supabase.from('partnerships').delete().eq('id', id);
    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Успешно', description: 'Партнерство удалено' });
      fetchPartnerships();
    }
  };

  const getTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      exchange: 'Обмен студентами',
      research: 'Научное сотрудничество',
      dual_degree: 'Двойной диплом',
      other: 'Другое'
    };
    return type ? labels[type] || type : '-';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Международные партнерства</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPartnership({})}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить партнерство
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPartnership?.id ? 'Редактировать' : 'Добавить партнерство'}</DialogTitle>
            </DialogHeader>
            {editingPartnership && (
              <div className="grid gap-4 py-4">
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
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : partnerships.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Партнерства не добавлены</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Партнер</TableHead>
                  <TableHead>Страна</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnerships.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.partner_name}</TableCell>
                    <TableCell>{p.partner_country}</TableCell>
                    <TableCell>{getTypeLabel(p.partnership_type)}</TableCell>
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
