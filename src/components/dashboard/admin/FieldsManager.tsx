import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const fieldSchema = z.object({
  id: z.string().min(1, 'ID обязателен').max(50, 'Максимум 50 символов').regex(/^[a-z0-9_-]+$/, 'Только латинские буквы, цифры, - и _'),
  name_ru: z.string().min(1, 'Название обязательно').max(100, 'Максимум 100 символов'),
  name_kz: z.string().max(100, 'Максимум 100 символов').optional().or(z.literal('')),
  name_en: z.string().max(100, 'Максимум 100 символов').optional().or(z.literal('')),
  icon: z.string().max(50, 'Максимум 50 символов').optional().or(z.literal('')),
});

type FieldFormData = z.infer<typeof fieldSchema>;

interface FieldOfStudy {
  id: string;
  name_ru: string;
  name_kz: string | null;
  name_en: string | null;
  icon: string | null;
}

const defaultValues: FieldFormData = {
  id: '',
  name_ru: '',
  name_kz: '',
  name_en: '',
  icon: '',
};

export default function FieldsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fields = [], isLoading } = useQuery({
    queryKey: ['fields-of-study-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fields_of_study')
        .select('*')
        .order('name_ru');
      if (error) throw error;
      return data as FieldOfStudy[];
    },
  });

  const form = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: async (data: FieldFormData) => {
      const { error } = await supabase
        .from('fields_of_study')
        .insert({
          id: data.id,
          name_ru: data.name_ru,
          name_kz: data.name_kz || null,
          name_en: data.name_en || null,
          icon: data.icon || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields-of-study'] });
      queryClient.invalidateQueries({ queryKey: ['fields-of-study-admin'] });
      toast({ title: 'Успешно', description: 'Направление создано' });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FieldFormData> }) => {
      const { error } = await supabase
        .from('fields_of_study')
        .update({
          name_ru: data.name_ru,
          name_kz: data.name_kz || null,
          name_en: data.name_en || null,
          icon: data.icon || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields-of-study'] });
      queryClient.invalidateQueries({ queryKey: ['fields-of-study-admin'] });
      toast({ title: 'Успешно', description: 'Направление обновлено' });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fields_of_study').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields-of-study'] });
      queryClient.invalidateQueries({ queryKey: ['fields-of-study-admin'] });
      toast({ title: 'Успешно', description: 'Направление удалено' });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const handleEdit = (field: FieldOfStudy) => {
    setEditingId(field.id);
    form.reset({
      id: field.id,
      name_ru: field.name_ru,
      name_kz: field.name_kz || '',
      name_en: field.name_en || '',
      icon: field.icon || '',
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    form.reset(defaultValues);
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: FieldFormData) => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Управление направлениями
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить направление
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Редактировать направление' : 'Добавить направление'}</DialogTitle>
              <DialogDescription>
                Направления используются для категоризации образовательных программ
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID (slug) *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="it-programming" disabled={!!editingId} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name_ru"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название (RU) *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="IT и программирование" />
                      </FormControl>
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
                      <FormControl>
                        <Input {...field} placeholder="IT және бағдарламалау" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название (EN)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="IT and Programming" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Иконка (Lucide icon name)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Сохранить
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Название (RU)</TableHead>
                <TableHead>Название (KZ)</TableHead>
                <TableHead>Название (EN)</TableHead>
                <TableHead>Иконка</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell className="font-mono text-sm">{field.id}</TableCell>
                  <TableCell>{field.name_ru}</TableCell>
                  <TableCell>{field.name_kz || '-'}</TableCell>
                  <TableCell>{field.name_en || '-'}</TableCell>
                  <TableCell>{field.icon || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(field)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(field.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {fields.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Направления не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить направление?"
        description="Это действие нельзя отменить. Направление будет удалено."
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}
