import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { usePartnerships, usePartnershipMutations } from '@/hooks/usePartnerships';
import { useUniversitiesList } from '@/hooks/useUniversities';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partnershipSchema, PartnershipFormData } from '@/lib/validations/partnership';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const defaultValues: PartnershipFormData = {
  university_id: '',
  partner_name: '',
  partner_country: '',
  partnership_type: null,
  description_ru: '',
};

export default function PartnershipsManager() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('partner_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = usePartnerships({ page, pageSize, search, sortBy, sortOrder });
  const { data: universities } = useUniversitiesList();
  const { createMutation, updateMutation, deleteMutation } = usePartnershipMutations();

  const form = useForm<PartnershipFormData>({
    resolver: zodResolver(partnershipSchema),
    defaultValues,
  });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleEdit = (partnership: any) => {
    setEditingId(partnership.id);
    form.reset({
      university_id: partnership.university_id,
      partner_name: partnership.partner_name,
      partner_country: partnership.partner_country,
      partnership_type: partnership.partnership_type || null,
      description_ru: partnership.description_ru || '',
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    form.reset(defaultValues);
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: PartnershipFormData) => {
    const data = {
      ...values,
      description_ru: values.description_ru || null,
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const getPartnershipTypeLabel = (type: string | null) => {
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
        <CardTitle>Управление партнерствами</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить партнерство
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Редактировать партнерство' : 'Добавить партнерство'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="university_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ВУЗ *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Выберите ВУЗ" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {universities?.map((uni) => (
                            <SelectItem key={uni.id} value={uni.id}>{uni.name_ru}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partner_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название партнера *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Textarea {...field} rows={3} />
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
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(value) => { setSearch(value); setPage(1); }}
            placeholder="Поиск по названию или стране..."
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
                    <SortableTableHead sortKey="partner_name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                      Партнер
                    </SortableTableHead>
                    <SortableTableHead sortKey="partner_country" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                      Страна
                    </SortableTableHead>
                    <TableHead>ВУЗ</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!data?.data.length ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Партнерства не найдены
                      </TableCell>
                    </TableRow>
                  ) : data.data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.partner_name}</TableCell>
                      <TableCell>{p.partner_country}</TableCell>
                      <TableCell>{p.universities?.name_ru}</TableCell>
                      <TableCell>{getPartnershipTypeLabel(p.partnership_type)}</TableCell>
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
        title="Удалить партнерство?"
        description="Это действие нельзя отменить."
        onConfirm={handleDelete}
        confirmText="Удалить"
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}
