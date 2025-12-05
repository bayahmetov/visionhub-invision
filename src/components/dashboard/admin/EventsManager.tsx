import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Calendar, Video, MapPin } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useUniversitiesList } from '@/hooks/useUniversities';

const eventTypes = [
  { value: 'open_day', label: 'День открытых дверей' },
  { value: 'webinar', label: 'Вебинар' },
  { value: 'deadline', label: 'Дедлайн' },
  { value: 'olympiad', label: 'Олимпиада' },
  { value: 'other', label: 'Другое' },
];

export function EventsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: universities } = useUniversitiesList();

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, universities(name_ru)')
        .order('event_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingEvent?.id) {
        const { error } = await supabase.from('events').update(data).eq('id', editingEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({ title: editingEvent?.id ? 'Событие обновлено' : 'Событие создано' });
      setIsDialogOpen(false);
      setEditingEvent(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({ title: 'Событие удалено' });
      setDeleteId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title_ru: formData.get('title_ru'),
      description_ru: formData.get('description_ru'),
      event_type: formData.get('event_type'),
      event_date: formData.get('event_date'),
      location: formData.get('location'),
      link: formData.get('link'),
      is_online: formData.get('is_online') === 'on',
      university_id: formData.get('university_id') || null,
    };
    saveMutation.mutate(data);
  };

  const openEdit = (event: any) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingEvent(null);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Управление событиями
        </CardTitle>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>ВУЗ</TableHead>
                <TableHead className="w-24">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {event.is_online && <Video className="h-4 w-4 text-muted-foreground" />}
                      {event.title_ru}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {eventTypes.find(t => t.value === event.event_type)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(parseISO(event.event_date), 'd MMM yyyy, HH:mm', { locale: ru })}
                  </TableCell>
                  <TableCell>{event.universities?.name_ru || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(event)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(event.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Редактировать событие' : 'Новое событие'}</DialogTitle>
              <DialogDescription>Заполните информацию о событии</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Название</Label>
                <Input name="title_ru" defaultValue={editingEvent?.title_ru} required />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea name="description_ru" defaultValue={editingEvent?.description_ru} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Тип</Label>
                  <Select name="event_type" defaultValue={editingEvent?.event_type || 'open_day'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Дата и время</Label>
                  <Input 
                    type="datetime-local" 
                    name="event_date" 
                    defaultValue={editingEvent?.event_date?.slice(0, 16)} 
                    required 
                  />
                </div>
              </div>
              <div>
                <Label>ВУЗ (опционально)</Label>
                <Select name="university_id" defaultValue={editingEvent?.university_id || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите ВУЗ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Без привязки</SelectItem>
                    {universities?.map(uni => (
                      <SelectItem key={uni.id} value={uni.id}>{uni.name_ru}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Место проведения</Label>
                <Input name="location" defaultValue={editingEvent?.location} />
              </div>
              <div>
                <Label>Ссылка</Label>
                <Input name="link" type="url" defaultValue={editingEvent?.link} />
              </div>
              <label className="flex items-center gap-2">
                <Checkbox name="is_online" defaultChecked={editingEvent?.is_online} />
                <span>Онлайн формат</span>
              </label>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(null)}
          onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
          title="Удалить событие?"
          description="Это действие нельзя отменить."
        />
      </CardContent>
    </Card>
  );
}
