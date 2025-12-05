import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { format } from 'date-fns';

const announcementTypes = [
  { value: 'news', label: 'Новость' },
  { value: 'admission', label: 'Поступление' },
  { value: 'scholarship', label: 'Стипендия' },
  { value: 'event', label: 'Мероприятие' },
];

interface Props {
  university: { id: string; name: string } | null;
  onClose: () => void;
}

interface Announcement {
  id: string;
  title_ru: string;
  content_ru: string;
  announcement_type: string;
  is_pinned: boolean;
  expires_at: string | null;
  published_at: string | null;
}

export function UniversityAnnouncementsDialog({ university, onClose }: Props) {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['university-announcements', university?.id],
    queryFn: async () => {
      if (!university) return [];
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('university_id', university.id)
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
    enabled: !!university,
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const data = {
        title_ru: formData.get('title_ru') as string,
        content_ru: formData.get('content_ru') as string,
        announcement_type: formData.get('announcement_type') as string,
        is_pinned: formData.get('is_pinned') === 'true',
        expires_at: formData.get('expires_at') as string || null,
        university_id: university?.id,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('announcements')
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-announcements', university?.id] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success(editingItem ? 'Объявление обновлено' : 'Объявление добавлено');
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: () => {
      toast.error('Ошибка сохранения');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-announcements', university?.id] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Объявление удалено');
      setDeleteId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveMutation.mutate(new FormData(e.currentTarget));
  };

  const handleEdit = (item: Announcement) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  return (
    <>
      <Dialog open={!!university} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Объявления: {university?.name}</DialogTitle>
            <DialogDescription>Управление объявлениями вуза</DialogDescription>
          </DialogHeader>

          {!isFormOpen ? (
            <div className="space-y-4">
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить объявление
              </Button>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !announcements?.length ? (
                <p className="text-center text-muted-foreground py-8">Нет объявлений</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Заголовок</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                            {item.title_ru}
                          </div>
                        </TableCell>
                        <TableCell>
                          {announcementTypes.find(t => t.value === item.announcement_type)?.label}
                        </TableCell>
                        <TableCell>
                          {item.published_at && format(new Date(item.published_at), 'dd.MM.yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title_ru">Заголовок *</Label>
                <Input
                  id="title_ru"
                  name="title_ru"
                  defaultValue={editingItem?.title_ru || ''}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content_ru">Содержание *</Label>
                <Textarea
                  id="content_ru"
                  name="content_ru"
                  defaultValue={editingItem?.content_ru || ''}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="announcement_type">Тип</Label>
                  <Select name="announcement_type" defaultValue={editingItem?.announcement_type || 'news'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {announcementTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expires_at">Истекает</Label>
                  <Input
                    id="expires_at"
                    name="expires_at"
                    type="date"
                    defaultValue={editingItem?.expires_at?.split('T')[0] || ''}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_pinned"
                  name="is_pinned"
                  defaultChecked={editingItem?.is_pinned || false}
                  onCheckedChange={(checked) => {
                    const input = document.querySelector('input[name="is_pinned"]') as HTMLInputElement;
                    if (input) input.value = String(checked);
                  }}
                />
                <input type="hidden" name="is_pinned" defaultValue={String(editingItem?.is_pinned || false)} />
                <Label htmlFor="is_pinned">Закрепить</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Сохранить
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить объявление?"
        description="Это действие нельзя отменить."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        confirmText="Удалить"
        loading={deleteMutation.isPending}
      />
    </>
  );
}
