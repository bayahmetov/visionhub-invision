import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SearchInput } from '@/components/shared/SearchInput';

const programSchema = z.object({
  name_ru: z.string().min(1, 'Обязательное поле').max(255),
  name_kz: z.string().max(255).optional().or(z.literal('')),
  degree_level: z.enum(['bachelor', 'master', 'doctorate'], { errorMap: () => ({ message: 'Выберите уровень' }) }),
  duration_years: z.number().min(1).max(10),
  tuition_fee_kzt: z.number().min(0).nullable().optional(),
  grants_available: z.boolean().optional(),
  ent_min_score: z.number().min(0).max(140).nullable().optional(),
  description_ru: z.string().max(5000).optional().or(z.literal('')),
  field_id: z.string().nullable().optional(),
});

type FormData = z.infer<typeof programSchema>;
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
  field_id: string | null;
}

interface FieldOfStudy {
  id: string;
  name_ru: string;
}

interface ProgramsEditorProps {
  universityId: string;
}

export default function ProgramsEditor({ universityId }: ProgramsEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['university-programs', universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('university_id', universityId)
        .order('name_ru');
      if (error) throw error;
      return data as Program[];
    },
  });

  const { data: fieldsOfStudy = [] } = useQuery({
    queryKey: ['fields-of-study'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fields_of_study')
        .select('id, name_ru')
        .order('name_ru');
      if (error) throw error;
      return data as FieldOfStudy[];
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name_ru: '',
      name_kz: '',
      degree_level: 'bachelor',
      duration_years: 4,
      tuition_fee_kzt: null,
      grants_available: false,
      ent_min_score: null,
      description_ru: '',
      field_id: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.from('programs').insert({
        name_ru: data.name_ru,
        name_kz: data.name_kz || null,
        degree_level: data.degree_level,
        duration_years: data.duration_years,
        tuition_fee_kzt: data.tuition_fee_kzt,
        grants_available: data.grants_available,
        ent_min_score: data.ent_min_score,
        description_ru: data.description_ru || null,
        field_id: data.field_id || null,
        university_id: universityId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-programs', universityId] });
      queryClient.invalidateQueries({ queryKey: ['university-fields'] });
      toast({ title: 'Успешно', description: 'Программа создана' });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const { error } = await supabase.from('programs').update({
        name_ru: data.name_ru,
        name_kz: data.name_kz || null,
        degree_level: data.degree_level,
        duration_years: data.duration_years,
        tuition_fee_kzt: data.tuition_fee_kzt,
        grants_available: data.grants_available,
        ent_min_score: data.ent_min_score,
        description_ru: data.description_ru || null,
        field_id: data.field_id || null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-programs', universityId] });
      queryClient.invalidateQueries({ queryKey: ['university-fields'] });
      toast({ title: 'Успешно', description: 'Программа обновлена' });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-programs', universityId] });
      queryClient.invalidateQueries({ queryKey: ['university-fields'] });
      toast({ title: 'Успешно', description: 'Программа удалена' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const handleCreate = () => {
    setEditingId(null);
    form.reset({
      name_ru: '',
      name_kz: '',
      degree_level: 'bachelor',
      duration_years: 4,
      tuition_fee_kzt: null,
      grants_available: false,
      ent_min_score: null,
      description_ru: '',
      field_id: null,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (program: Program) => {
    setEditingId(program.id);
    form.reset({
      name_ru: program.name_ru,
      name_kz: program.name_kz || '',
      degree_level: program.degree_level,
      duration_years: program.duration_years,
      tuition_fee_kzt: program.tuition_fee_kzt,
      grants_available: program.grants_available || false,
      ent_min_score: program.ent_min_score,
      description_ru: program.description_ru || '',
      field_id: program.field_id,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: FormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const filteredPrograms = programs.filter(p =>
    p.name_ru.toLowerCase().includes(search.toLowerCase())
  );

  const getDegreeLabel = (level: DegreeLevel) => {
    const labels: Record<DegreeLevel, string> = {
      bachelor: 'Бакалавриат',
      master: 'Магистратура',
      doctorate: 'Докторантура',
    };
    return labels[level];
  };

  const getFieldName = (fieldId: string | null) => {
    if (!fieldId) return null;
    const field = fieldsOfStudy.find(f => f.id === fieldId);
    return field?.name_ru || null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Образовательные программы</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить программу
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Редактировать программу' : 'Добавить программу'}</DialogTitle>
              <DialogDescription>Заполните информацию о программе</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name_ru"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название (RU) *</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name_kz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название (KZ)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="degree_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Уровень *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bachelor">Бакалавриат</SelectItem>
                            <SelectItem value="master">Магистратура</SelectItem>
                            <SelectItem value="doctorate">Докторантура</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Длительность (лет)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 4)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tuition_fee_kzt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Стоимость (тенге)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ent_min_score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Мин. балл ЕНТ</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="field_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Направление</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(val === 'none' ? null : val)} 
                        value={field.value || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите направление" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Без направления</SelectItem>
                          {fieldsOfStudy.map((f) => (
                            <SelectItem key={f.id} value={f.id}>{f.name_ru}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grants_available"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Доступны гранты</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description_ru"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание</FormLabel>
                      <FormControl><Textarea {...field} rows={3} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Сохранить
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Поиск программ..." />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPrograms.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {search ? 'Программы не найдены' : 'Программы не добавлены'}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Направление</TableHead>
                  <TableHead>Уровень</TableHead>
                  <TableHead>Срок</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.map((prog) => (
                  <TableRow key={prog.id}>
                    <TableCell className="font-medium">{prog.name_ru}</TableCell>
                    <TableCell>
                      {getFieldName(prog.field_id) ? (
                        <Badge variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {getFieldName(prog.field_id)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getDegreeLabel(prog.degree_level)}</TableCell>
                    <TableCell>{prog.duration_years} лет</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(prog)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(prog.id)}>
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

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить программу?"
        description="Это действие нельзя отменить."
        onConfirm={handleDelete}
        confirmText="Удалить"
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}
