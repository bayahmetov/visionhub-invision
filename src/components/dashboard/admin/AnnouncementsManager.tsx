import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Pin, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { format } from 'date-fns';

const announcementTypes = [
  { value: 'news', label: 'Новость' },
  { value: 'admission', label: 'Приём' },
  { value: 'scholarship', label: 'Стипендия' },
  { value: 'event', label: 'Мероприятие' },
];

export function AnnouncementsManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*, universities(name_ru)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: universities } = useQuery({
    queryKey: ['universities-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name_ru')
        .order('name_ru');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: any) => {
      const payload = {
        title_ru: item.title_ru,
        title_en: item.title_en,
        title_kz: item.title_kz,
        content_ru: item.content_ru,
        content_en: item.content_en,
        content_kz: item.content_kz,
        announcement_type: item.announcement_type,
        university_id: item.university_id || null,
        is_pinned: item.is_pinned,
        expires_at: item.expires_at || null,
      };

      if (item.id) {
        const { error } = await supabase.from('announcements').update(payload).eq('id', item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announcements').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success('Объявление сохранено');
    },
    onError: () => toast.error('Ошибка сохранения'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success('Объявление удалено');
    },
    onError: () => toast.error('Ошибка удаления'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    saveMutation.mutate({
      id: editingItem?.id,
      title_ru: formData.get('title_ru'),
      title_en: formData.get('title_en'),
      title_kz: formData.get('title_kz'),
      content_ru: formData.get('content_ru'),
      content_en: formData.get('content_en'),
      content_kz: formData.get('content_kz'),
      announcement_type: formData.get('announcement_type'),
      university_id: formData.get('university_id') || null,
      is_pinned: formData.get('is_pinned') === 'on',
      expires_at: formData.get('expires_at') || null,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Объявления
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Редактировать' : 'Новое объявление'}</DialogTitle>
              <DialogDescription>Заполните информацию об объявлении</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Select name="announcement_type" defaultValue={editingItem?.announcement_type || 'news'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {announcementTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Университет (опционально)</Label>
                  <Select name="university_id" defaultValue={editingItem?.university_id || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Общее объявление</SelectItem>
                      {universities?.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name_ru}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Заголовок (RU) *</Label>
                <Input name="title_ru" defaultValue={editingItem?.title_ru} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Заголовок (EN)</Label>
                  <Input name="title_en" defaultValue={editingItem?.title_en} />
                </div>
                <div className="space-y-2">
                  <Label>Заголовок (KZ)</Label>
                  <Input name="title_kz" defaultValue={editingItem?.title_kz} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Содержание (RU) *</Label>
                <Textarea name="content_ru" defaultValue={editingItem?.content_ru} required rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Содержание (EN)</Label>
                  <Textarea name="content_en" defaultValue={editingItem?.content_en} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Содержание (KZ)</Label>
                  <Textarea name="content_kz" defaultValue={editingItem?.content_kz} rows={3} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Истекает</Label>
                  <Input type="datetime-local" name="expires_at" defaultValue={editingItem?.expires_at?.slice(0, 16)} />
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <Switch name="is_pinned" defaultChecked={editingItem?.is_pinned} />
                  <Label>Закрепить</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
                <Button type="submit" disabled={saveMutation.isPending}>Сохранить</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Заголовок</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Университет</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                    {item.title_ru}
                  </div>
                </TableCell>
                <TableCell>{announcementTypes.find(t => t.value === item.announcement_type)?.label}</TableCell>
                <TableCell>{item.universities?.name_ru || '—'}</TableCell>
                <TableCell>{format(new Date(item.created_at), 'dd.MM.yyyy')}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => { deleteMutation.mutate(deleteId!); setDeleteId(null); }}
        title="Удалить объявление?"
        description="Это действие нельзя отменить."
      />
    </div>
  );
}
