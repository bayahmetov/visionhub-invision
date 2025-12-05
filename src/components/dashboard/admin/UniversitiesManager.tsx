import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useUniversities, useUniversityMutations } from '@/hooks/useUniversities';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { universitySchema, UniversityFormData } from '@/lib/validations/university';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type UniversityType = 'state' | 'private' | 'national' | 'international';

interface University {
  id: string;
  name_ru: string;
  name_kz: string | null;
  name_en: string | null;
  city: string;
  region: string;
  type: UniversityType;
  founded_year: number | null;
  students_count: number | null;
  teachers_count: number | null;
  has_dormitory: boolean | null;
  has_military_department: boolean | null;
  has_grants: boolean | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  description_ru: string | null;
  virtual_tour_url: string | null;
}

const defaultValues: UniversityFormData = {
  name_ru: '',
  name_kz: '',
  name_en: '',
  city: '',
  region: '',
  type: 'state',
  founded_year: null,
  students_count: null,
  teachers_count: null,
  has_dormitory: false,
  has_military_department: false,
  has_grants: false,
  website: '',
  email: '',
  phone: '',
  description_ru: '',
  virtual_tour_url: ''
};

export default function UniversitiesManager() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_ru');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useUniversities({ page, pageSize, search, sortBy, sortOrder });
  const { createMutation, updateMutation, deleteMutation } = useUniversityMutations();

  const form = useForm<UniversityFormData>({
    resolver: zodResolver(universitySchema),
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

  const handleEdit = (university: University) => {
    setEditingId(university.id);
    form.reset({
      name_ru: university.name_ru,
      name_kz: university.name_kz || '',
      name_en: university.name_en || '',
      city: university.city,
      region: university.region,
      type: university.type,
      founded_year: university.founded_year,
      students_count: university.students_count,
      teachers_count: university.teachers_count,
      has_dormitory: university.has_dormitory || false,
      has_military_department: university.has_military_department || false,
      has_grants: university.has_grants || false,
      website: university.website || '',
      email: university.email || '',
      phone: university.phone || '',
      description_ru: university.description_ru || '',
      virtual_tour_url: university.virtual_tour_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    form.reset(defaultValues);
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: UniversityFormData) => {
    const data = {
      ...values,
      name_kz: values.name_kz || null,
      name_en: values.name_en || null,
      website: values.website || null,
      email: values.email || null,
      phone: values.phone || null,
      description_ru: values.description_ru || null,
      virtual_tour_url: values.virtual_tour_url || null,
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

  const getTypeLabel = (type: UniversityType) => {
    const labels: Record<UniversityType, string> = {
      state: 'Государственный',
      private: 'Частный',
      national: 'Национальный',
      international: 'Международный',
    };
    return labels[type];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Управление ВУЗами</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить ВУЗ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Редактировать ВУЗ' : 'Добавить ВУЗ'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name_ru"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название (RU) *</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="name_en"
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Город *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Регион *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="state">Государственный</SelectItem>
                            <SelectItem value="private">Частный</SelectItem>
                            <SelectItem value="national">Национальный</SelectItem>
                            <SelectItem value="international">Международный</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="founded_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Год основания</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="students_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Студентов</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="teachers_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Преподавателей</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-wrap gap-6">
                  <FormField
                    control={form.control}
                    name="has_dormitory"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Общежитие</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="has_military_department"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Военная кафедра</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="has_grants"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Гранты</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Телефон</FormLabel>
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
                <FormField
                  control={form.control}
                  name="virtual_tour_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL виртуального тура</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
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
            placeholder="Поиск по названию или городу..."
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
                    <SortableTableHead sortKey="name_ru" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                      Название
                    </SortableTableHead>
                    <SortableTableHead sortKey="city" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                      Город
                    </SortableTableHead>
                    <SortableTableHead sortKey="type" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                      Тип
                    </SortableTableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!data?.data.length ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        ВУЗы не найдены
                      </TableCell>
                    </TableRow>
                  ) : data.data.map((uni) => (
                    <TableRow key={uni.id}>
                      <TableCell className="font-medium">{uni.name_ru}</TableCell>
                      <TableCell>{uni.city}</TableCell>
                      <TableCell>{getTypeLabel(uni.type)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(uni as University)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(uni.id)}>
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
        title="Удалить ВУЗ?"
        description="Это действие нельзя отменить. Все связанные программы и партнерства также будут удалены."
        onConfirm={handleDelete}
        confirmText="Удалить"
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}
