import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2, Calendar, Pin, Megaphone } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const announcementSchema = z.object({
  title_ru: z.string().min(1, 'Заголовок обязателен').max(255, 'Максимум 255 символов'),
  title_kz: z.string().max(255).optional().or(z.literal('')),
  title_en: z.string().max(255).optional().or(z.literal('')),
  content_ru: z.string().min(1, 'Содержание обязательно').max(5000, 'Максимум 5000 символов'),
  content_kz: z.string().max(5000).optional().or(z.literal('')),
  content_en: z.string().max(5000).optional().or(z.literal('')),
  announcement_type: z.string().default('news'),
  is_pinned: z.boolean().default(false),
  expires_at: z.string().optional().or(z.literal('')),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface AnnouncementsEditorProps {
  universityId: string;
}

const announcementTypes = [
  { value: 'news', label: 'Новость' },
  { value: 'admission', label: 'Поступление' },
  { value: 'scholarship', label: 'Стипендия' },
  { value: 'event', label: 'Событие' },
  { value: 'important', label: 'Важное' },
];

export default function AnnouncementsEditor({ universityId }: AnnouncementsEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title_ru: '',
      title_kz: '',
      title_en: '',
      content_ru: '',
      content_kz: '',
      content_en: '',
      announcement_type: 'news',
      is_pinned: false,
      expires_at: '',
    },
  });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['university_announcements', universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('university_id', universityId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AnnouncementFormData) => {
      const { error } = await supabase
        .from('announcements')
        .insert({
          university_id: universityId,
          title_ru: data.title_ru,
          title_kz: data.title_kz || null,
          title_en: data.title_en || null,
          content_ru: data.content_ru,
          content_kz: data.content_kz || null,
          content_en: data.content_en || null,
          announcement_type: data.announcement_type,
          is_pinned: data.is_pinned,
          expires_at: data.expires_at || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university_announcements'] });
      toast({ title: 'Успешно', description: 'Объявление создано' });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AnnouncementFormData & { id: string }) => {
      const { error } = await supabase
        .from('announcements')
        .update({
          title_ru: data.title_ru,
          title_kz: data.title_kz || null,
          title_en: data.title_en || null,
          content_ru: data.content_ru,
          content_kz: data.content_kz || null,
          content_en: data.content_en || null,
          announcement_type: data.announcement_type,
          is_pinned: data.is_pinned,
          expires_at: data.expires_at || null,
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university_announcements'] });
      toast({ title: 'Успешно', description: 'Объявление обновлено' });
      setDialogOpen(false);
      setEditing(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university_announcements'] });
      toast({ title: 'Успешно', description: 'Объявление удалено' });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const handleCreate = () => {
    setEditing(null);
    form.reset({
      title_ru: '',
      title_kz: '',
      title_en: '',
      content_ru: '',
      content_kz: '',
      content_en: '',
      announcement_type: 'news',
      is_pinned: false,
      expires_at: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (announcement: any) => {
    setEditing(announcement);
    form.reset({
      title_ru: announcement.title_ru || '',
      title_kz: announcement.title_kz || '',
      title_en: announcement.title_en || '',
      content_ru: announcement.content_ru || '',
      content_kz: announcement.content_kz || '',
      content_en: announcement.content_en || '',
      announcement_type: announcement.announcement_type || 'news',
      is_pinned: announcement.is_pinned || false,
      expires_at: announcement.expires_at?.split('T')[0] || '',
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: AnnouncementFormData) => {
    if (editing) {
      updateMutation.mutate({ ...data, id: editing.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const getTypeLabel = (type: string) => {
    return announcementTypes.find(t => t.value === type)?.label || type;
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'important': return 'destructive';
      case 'admission': return 'default';
      case 'scholarship': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Объявления
        </CardTitle>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Нет объявлений. Создайте первое объявление.
          </p>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement: any) => (
              <div
                key={announcement.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {announcement.is_pinned && (
                      <Pin className="h-4 w-4 text-primary" />
                    )}
                    <h4 className="font-medium">{announcement.title_ru}</h4>
                    <Badge variant={getTypeBadgeVariant(announcement.announcement_type)}>
                      {getTypeLabel(announcement.announcement_type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {announcement.content_ru}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(announcement.created_at), 'dd MMM yyyy', { locale: ru })}
                    </span>
                    {announcement.expires_at && (
                      <span>
                        Истекает: {format(new Date(announcement.expires_at), 'dd MMM yyyy', { locale: ru })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(announcement)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Редактировать объявление' : 'Новое объявление'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title_ru"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Заголовок (RU) *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Введите заголовок" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title_kz"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Заголовок (KZ)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Заголовок (EN)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="content_ru"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Содержание (RU) *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder="Текст объявления" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="content_kz"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Содержание (KZ)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Содержание (EN)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="announcement_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип объявления</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {announcementTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expires_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дата истечения</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_pinned"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 pt-8">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Закрепить</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editing ? 'Сохранить' : 'Создать'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          title="Удалить объявление?"
          description="Это действие нельзя отменить."
          onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        />
      </CardContent>
    </Card>
  );
}