import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, BookOpen, Eye, EyeOff } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const categories = [
  { value: 'guide', label: 'Гайд' },
  { value: 'story', label: 'История' },
  { value: 'interview', label: 'Интервью' },
  { value: 'news', label: 'Новость' },
];

export function ArticlesManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingArticle?.id) {
        const { error } = await supabase.from('articles').update(data).eq('id', editingArticle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('articles').insert({ ...data, author_id: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({ title: editingArticle?.id ? 'Статья обновлена' : 'Статья создана' });
      setIsDialogOpen(false);
      setEditingArticle(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({ title: 'Статья удалена' });
      setDeleteId(null);
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase
        .from('articles')
        .update({ 
          is_published: published, 
          published_at: published ? new Date().toISOString() : null 
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title_ru') as string;
    const slug = title.toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/gi, '')
      .replace(/\s+/g, '-')
      .slice(0, 50) + '-' + Date.now().toString(36);
    
    const data = {
      title_ru: title,
      slug: editingArticle?.slug || slug,
      excerpt_ru: formData.get('excerpt_ru'),
      content_ru: formData.get('content_ru'),
      category: formData.get('category'),
      cover_image_url: formData.get('cover_image_url') || null,
      is_published: formData.get('is_published') === 'on',
      published_at: formData.get('is_published') === 'on' ? new Date().toISOString() : null,
    };
    saveMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Управление статьями
        </CardTitle>
        <Button onClick={() => { setEditingArticle(null); setIsDialogOpen(true); }}>
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
                <TableHead>Категория</TableHead>
                <TableHead>Автор</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Просмотры</TableHead>
                <TableHead className="w-32">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles?.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-xs truncate">{article.title_ru}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {categories.find(c => c.value === article.category)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{article.profiles?.full_name || '—'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublishMutation.mutate({ id: article.id, published: !article.is_published })}
                    >
                      {article.is_published ? (
                        <Badge className="gap-1 bg-green-500"><Eye className="h-3 w-3" />Опубликовано</Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1"><EyeOff className="h-3 w-3" />Черновик</Badge>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>{article.views_count || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingArticle(article); setIsDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(article.id)}>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? 'Редактировать статью' : 'Новая статья'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Заголовок</Label>
                <Input name="title_ru" defaultValue={editingArticle?.title_ru} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Категория</Label>
                  <Select name="category" defaultValue={editingArticle?.category || 'guide'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>URL обложки</Label>
                  <Input name="cover_image_url" type="url" defaultValue={editingArticle?.cover_image_url} />
                </div>
              </div>
              <div>
                <Label>Краткое описание</Label>
                <Textarea name="excerpt_ru" defaultValue={editingArticle?.excerpt_ru} rows={2} />
              </div>
              <div>
                <Label>Содержание</Label>
                <Textarea name="content_ru" defaultValue={editingArticle?.content_ru} rows={10} required />
              </div>
              <label className="flex items-center gap-2">
                <Checkbox name="is_published" defaultChecked={editingArticle?.is_published} />
                <span>Опубликовать сразу</span>
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
          title="Удалить статью?"
          description="Это действие нельзя отменить."
        />
      </CardContent>
    </Card>
  );
}
