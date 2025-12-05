import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Star, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  universities: { name_ru: string };
  profiles: { full_name: string | null };
}

interface UseReviewsOptions {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

function useReviews({ page, pageSize, search, sortBy, sortOrder }: UseReviewsOptions) {
  return useQuery({
    queryKey: ['reviews', { page, pageSize, search, sortBy, sortOrder }],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select('id, rating, comment, created_at, universities(name_ru), profiles:user_id(full_name)', { count: 'exact' });

      if (search) {
        query = query.or(`comment.ilike.%${search}%`);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: (data as any as Review[]) || [],
        totalCount: count || 0,
      };
    },
  });
}

export default function ReviewsManager() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useReviews({ page, pageSize, search, sortBy, sortOrder });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: 'Успешно', description: 'Отзыв удален' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление отзывами</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(value) => { setSearch(value); setPage(1); }}
            placeholder="Поиск по содержимому..."
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ВУЗ</TableHead>
                    <TableHead>Автор</TableHead>
                    <SortableTableHead sortKey="rating" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                      Оценка
                    </SortableTableHead>
                    <TableHead>Комментарий</TableHead>
                    <SortableTableHead sortKey="created_at" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                      Дата
                    </SortableTableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!data?.data.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Отзывы не найдены
                      </TableCell>
                    </TableRow>
                  ) : data.data.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.universities?.name_ru}</TableCell>
                      <TableCell>{review.profiles?.full_name || 'Аноним'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted'}`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{review.comment || '-'}</TableCell>
                      <TableCell>{new Date(review.created_at).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(review.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={data?.totalCount || 0}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            />
          </>
        )}
      </CardContent>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить отзыв?"
        description="Это действие нельзя отменить."
        onConfirm={handleDelete}
        confirmText="Удалить"
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}
