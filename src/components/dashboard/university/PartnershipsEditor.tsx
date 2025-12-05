import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SearchInput } from '@/components/shared/SearchInput';

const partnershipSchema = z.object({
  partner_name: z.string().min(1, 'Обязательное поле').max(255),
  partner_country: z.string().min(1, 'Обязательное поле').max(100),
  partnership_type: z.enum(['exchange', 'research', 'dual_degree', 'other']).optional().nullable(),
  description_ru: z.string().max(2000).optional().or(z.literal('')),
});

type FormData = z.infer<typeof partnershipSchema>;

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: partnerships = [], isLoading } = useQuery({
    queryKey: ['university-partnerships', universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partnerships')
        .select('*')
        .eq('university_id', universityId)
        .order('partner_name');
      if (error) throw error;
      return data as Partnership[];
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(partnershipSchema),
    defaultValues: {
      partner_name: '',
      partner_country: '',
      partnership_type: null,
      description_ru: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.from('partnerships').insert({
        partner_name: data.partner_name,
        partner_country: data.partner_country,
        partnership_type: data.partnership_type,
        description_ru: data.description_ru || null,
        university_id: universityId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-partnerships', universityId] });
      toast({ title: 'Успешно', description: 'Партнерство создано' });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const { error } = await supabase.from('partnerships').update({
        ...data,
        description_ru: data.description_ru || null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-partnerships', universityId] });
      toast({ title: 'Успешно', description: 'Партнерство обновлено' });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('partnerships').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-partnerships', universityId] });
      toast({ title: 'Успешно', description: 'Партнерство удалено' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const handleCreate = () => {
    setEditingId(null);
    form.reset({
      partner_name: '',
      partner_country: '',
      partnership_type: null,
      description_ru: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (partnership: Partnership) => {
    setEditingId(partnership.id);
    form.reset({
      partner_name: partnership.partner_name,
      partner_country: partnership.partner_country,
      partnership_type: partnership.partnership_type as any,
      description_ru: partnership.description_ru || '',
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

  const filteredPartnerships = partnerships.filter(p =>
    p.partner_name.toLowerCase().includes(search.toLowerCase()) ||
    p.partner_country.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      exchange: 'Обмен студентами',
      research: 'Научное сотрудничество',
      dual_degree: 'Двойной диплом',
      other: 'Другое',
    };
    return type ? labels[type] || type : '-';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Международные партнерства</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить партнерство
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Редактировать' : 'Добавить партнерство'}</DialogTitle>
              <DialogDescription>Заполните информацию о партнерстве</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="partner_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название партнера *</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partner_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Страна *</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnership_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип партнерства</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="exchange">Обмен студентами</SelectItem>
                          <SelectItem value="research">Научное сотрудничество</SelectItem>
                          <SelectItem value="dual_degree">Двойной диплом</SelectItem>
                          <SelectItem value="other">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
          <SearchInput value={search} onChange={setSearch} placeholder="Поиск партнерств..." />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPartnerships.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {search ? 'Партнерства не найдены' : 'Партнерства не добавлены'}
          </p>
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
                {filteredPartnerships.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.partner_name}</TableCell>
                    <TableCell>{p.partner_country}</TableCell>
                    <TableCell>{getTypeLabel(p.partnership_type)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}>
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
        title="Удалить партнерство?"
        description="Это действие нельзя отменить."
        onConfirm={handleDelete}
        confirmText="Удалить"
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}
