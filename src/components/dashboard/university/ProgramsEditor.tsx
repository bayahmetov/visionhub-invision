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
import { Switch } from '@/components/ui/switch';

type DegreeLevel = 'bachelor' | 'master' | 'doctorate';

interface Program {
  id: string;
  name_ru: string;
  name_kz: string | null;
  degree_level: DegreeLevel;
  duration_years: number;
  tuition_fee_kzt: number | null;
  grants_available: boolean | null;
  ent_min_score: number | null;
  description_ru: string | null;
}

interface ProgramsEditorProps {
  universityId: string;
}

export default function ProgramsEditor({ universityId }: ProgramsEditorProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Partial<Program> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrograms();
  }, [universityId]);

  const fetchPrograms = async () => {
    const { data } = await supabase
      .from('programs')
      .select('*')
      .eq('university_id', universityId)
      .order('name_ru');
    
    if (data) setPrograms(data as Program[]);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingProgram?.name_ru || !editingProgram?.degree_level) {
      toast({ title: 'Ошибка', description: 'Заполните обязательные поля', variant: 'destructive' });
      return;
    }

    const data = {
      name_ru: editingProgram.name_ru,
      name_kz: editingProgram.name_kz || null,
      university_id: universityId,
      degree_level: editingProgram.degree_level,
      duration_years: editingProgram.duration_years || 4,
      tuition_fee_kzt: editingProgram.tuition_fee_kzt || null,
      grants_available: editingProgram.grants_available || false,
      ent_min_score: editingProgram.ent_min_score || null,
      description_ru: editingProgram.description_ru || null
    };

    let error;
    if (editingProgram.id) {
      const result = await supabase.from('programs').update(data).eq('id', editingProgram.id);
      error = result.error;
    } else {
      const result = await supabase.from('programs').insert(data);
      error = result.error;
    }

    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Успешно', description: editingProgram.id ? 'Программа обновлена' : 'Программа создана' });
      setIsDialogOpen(false);
      setEditingProgram(null);
      fetchPrograms();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту программу?')) return;
    
    const { error } = await supabase.from('programs').delete().eq('id', id);
    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Успешно', description: 'Программа удалена' });
      fetchPrograms();
    }
  };

  const getDegreeLabel = (level: DegreeLevel) => {
    const labels: Record<DegreeLevel, string> = {
      bachelor: 'Бакалавриат',
      master: 'Магистратура',
      doctorate: 'Докторантура'
    };
    return labels[level];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Образовательные программы</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProgram({ duration_years: 4, grants_available: false })}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить программу
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProgram?.id ? 'Редактировать программу' : 'Добавить программу'}</DialogTitle>
            </DialogHeader>
            {editingProgram && (
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Название (RU) *</Label>
                  <Input 
                    value={editingProgram.name_ru || ''} 
                    onChange={(e) => setEditingProgram({...editingProgram, name_ru: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Название (KZ)</Label>
                  <Input 
                    value={editingProgram.name_kz || ''} 
                    onChange={(e) => setEditingProgram({...editingProgram, name_kz: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Уровень *</Label>
                    <Select 
                      value={editingProgram.degree_level} 
                      onValueChange={(v) => setEditingProgram({...editingProgram, degree_level: v as DegreeLevel})}
                    >
                      <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">Бакалавриат</SelectItem>
                        <SelectItem value="master">Магистратура</SelectItem>
                        <SelectItem value="doctorate">Докторантура</SelectItem>
                        
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Длительность (лет)</Label>
                    <Input 
                      type="number"
                      value={editingProgram.duration_years || ''} 
                      onChange={(e) => setEditingProgram({...editingProgram, duration_years: parseInt(e.target.value) || 4})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Стоимость (тенге)</Label>
                    <Input 
                      type="number"
                      value={editingProgram.tuition_fee_kzt || ''} 
                      onChange={(e) => setEditingProgram({...editingProgram, tuition_fee_kzt: parseInt(e.target.value) || null})}
                    />
                  </div>
                  <div>
                    <Label>Мин. балл ЕНТ</Label>
                    <Input 
                      type="number"
                      value={editingProgram.ent_min_score || ''} 
                      onChange={(e) => setEditingProgram({...editingProgram, ent_min_score: parseInt(e.target.value) || null})}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={editingProgram.grants_available || false}
                    onCheckedChange={(v) => setEditingProgram({...editingProgram, grants_available: v})}
                  />
                  <Label>Доступны гранты</Label>
                </div>
                <div>
                  <Label>Описание</Label>
                  <Textarea 
                    value={editingProgram.description_ru || ''} 
                    onChange={(e) => setEditingProgram({...editingProgram, description_ru: e.target.value})}
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
        ) : programs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Программы не добавлены</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Уровень</TableHead>
                  <TableHead>Срок</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((prog) => (
                  <TableRow key={prog.id}>
                    <TableCell className="font-medium">{prog.name_ru}</TableCell>
                    <TableCell>{getDegreeLabel(prog.degree_level)}</TableCell>
                    <TableCell>{prog.duration_years} лет</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => { setEditingProgram(prog); setIsDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(prog.id)}
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
