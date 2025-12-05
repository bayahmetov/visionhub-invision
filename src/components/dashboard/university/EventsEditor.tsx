import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2, Calendar, MapPin, Link as LinkIcon, Video } from 'lucide-react';
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

const eventSchema = z.object({
  title_ru: z.string().min(1, 'Название обязательно').max(255, 'Максимум 255 символов'),
  title_kz: z.string().max(255).optional().or(z.literal('')),
  title_en: z.string().max(255).optional().or(z.literal('')),
  description_ru: z.string().max(2000).optional().or(z.literal('')),
  description_kz: z.string().max(2000).optional().or(z.literal('')),
  description_en: z.string().max(2000).optional().or(z.literal('')),
  event_type: z.string().default('open_day'),
  event_date: z.string().min(1, 'Дата обязательна'),
  end_date: z.string().optional().or(z.literal('')),
  location: z.string().max(500).optional().or(z.literal('')),
  link: z.string().url('Некорректный URL').optional().or(z.literal('')),
  is_online: z.boolean().default(false),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventsEditorProps {
  universityId: string;
}

const eventTypes = [
  { value: 'open_day', label: 'День открытых дверей' },
  { value: 'masterclass', label: 'Мастер-класс' },
  { value: 'webinar', label: 'Вебинар' },
  { value: 'competition', label: 'Конкурс/Олимпиада' },
  { value: 'conference', label: 'Конференция' },
  { value: 'exhibition', label: 'Выставка' },
  { value: 'other', label: 'Другое' },
];

export default function EventsEditor({ universityId }: EventsEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title_ru: '',
      title_kz: '',
      title_en: '',
      description_ru: '',
      description_kz: '',
      description_en: '',
      event_type: 'open_day',
      event_date: '',
      end_date: '',
      location: '',
      link: '',
      is_online: false,
    },
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['university_events', universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('university_id', universityId)
        .order('event_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const { error } = await supabase
        .from('events')
        .insert({
          university_id: universityId,
          title_ru: data.title_ru,
          title_kz: data.title_kz || null,
          title_en: data.title_en || null,
          description_ru: data.description_ru || null,
          description_kz: data.description_kz || null,
          description_en: data.description_en || null,
          event_type: data.event_type,
          event_date: data.event_date,
          end_date: data.end_date || null,
          location: data.location || null,
          link: data.link || null,
          is_online: data.is_online,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university_events'] });
      toast({ title: 'Успешно', description: 'Событие создано' });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EventFormData & { id: string }) => {
      const { error } = await supabase
        .from('events')
        .update({
          title_ru: data.title_ru,
          title_kz: data.title_kz || null,
          title_en: data.title_en || null,
          description_ru: data.description_ru || null,
          description_kz: data.description_kz || null,
          description_en: data.description_en || null,
          event_type: data.event_type,
          event_date: data.event_date,
          end_date: data.end_date || null,
          location: data.location || null,
          link: data.link || null,
          is_online: data.is_online,
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university_events'] });
      toast({ title: 'Успешно', description: 'Событие обновлено' });
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
        .from('events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university_events'] });
      toast({ title: 'Успешно', description: 'Событие удалено' });
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
      description_ru: '',
      description_kz: '',
      description_en: '',
      event_type: 'open_day',
      event_date: '',
      end_date: '',
      location: '',
      link: '',
      is_online: false,
    });
    setDialogOpen(true);
  };

  const handleEdit = (event: any) => {
    setEditing(event);
    form.reset({
      title_ru: event.title_ru || '',
      title_kz: event.title_kz || '',
      title_en: event.title_en || '',
      description_ru: event.description_ru || '',
      description_kz: event.description_kz || '',
      description_en: event.description_en || '',
      event_type: event.event_type || 'open_day',
      event_date: event.event_date?.split('T')[0] + 'T' + (event.event_date?.split('T')[1]?.slice(0, 5) || '10:00'),
      end_date: event.end_date ? event.end_date.split('T')[0] + 'T' + (event.end_date.split('T')[1]?.slice(0, 5) || '18:00') : '',
      location: event.location || '',
      link: event.link || '',
      is_online: event.is_online || false,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: EventFormData) => {
    if (editing) {
      updateMutation.mutate({ ...data, id: editing.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const getTypeLabel = (type: string) => {
    return eventTypes.find(t => t.value === type)?.label || type;
  };

  const isPastEvent = (date: string) => new Date(date) < new Date();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const upcomingEvents = events.filter(e => !isPastEvent(e.event_date));
  const pastEvents = events.filter(e => isPastEvent(e.event_date));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          События
        </CardTitle>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Нет событий. Создайте первое событие.
          </p>
        ) : (
          <div className="space-y-6">
            {upcomingEvents.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Предстоящие события ({upcomingEvents.length})
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event: any) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={handleEdit}
                      onDelete={setDeleteTarget}
                      getTypeLabel={getTypeLabel}
                    />
                  ))}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Прошедшие события ({pastEvents.length})
                </h3>
                <div className="space-y-3 opacity-60">
                  {pastEvents.slice(0, 5).map((event: any) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={handleEdit}
                      onDelete={setDeleteTarget}
                      getTypeLabel={getTypeLabel}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Редактировать событие' : 'Новое событие'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title_ru"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название (RU) *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="День открытых дверей" />
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
                        <FormLabel>Название (KZ)</FormLabel>
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
                        <FormLabel>Название (EN)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="event_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип события</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventTypes.map(type => (
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
                    name="event_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дата и время *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дата окончания</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description_ru"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание (RU)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Подробности о событии" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Место проведения</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Главный корпус, ауд. 101" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ссылка (регистрация/трансляция)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_online"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Онлайн событие</FormLabel>
                    </FormItem>
                  )}
                />

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
          title="Удалить событие?"
          description="Это действие нельзя отменить."
          onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        />
      </CardContent>
    </Card>
  );
}

function EventCard({ event, onEdit, onDelete, getTypeLabel }: any) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium">{event.title_ru}</h4>
          <Badge variant="outline">{getTypeLabel(event.event_type)}</Badge>
          {event.is_online && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              Онлайн
            </Badge>
          )}
        </div>
        {event.description_ru && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description_ru}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(event.event_date), 'dd MMM yyyy, HH:mm', { locale: ru })}
          </span>
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          )}
          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <LinkIcon className="h-3 w-3" />
              Ссылка
            </a>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Button variant="ghost" size="icon" onClick={() => onEdit(event)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(event.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}