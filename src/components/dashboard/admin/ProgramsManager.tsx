import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { usePrograms, useProgramMutations } from '@/hooks/usePrograms';
import { useUniversitiesList } from '@/hooks/useUniversities';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { programSchema, ProgramFormData } from '@/lib/validations/program';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type DegreeLevel = 'bachelor' | 'master' | 'doctorate';

const defaultValues: ProgramFormData = {
  name_ru: '',
  name_kz: '',
  name_en: '',
  university_id: '',
  degree_level: 'bachelor',
  duration_years: 4,
  tuition_fee_kzt: null,
  grants_available: false,
  ent_min_score: null,
  description_ru: '',
};

export default function ProgramsManager() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_ru');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = usePrograms({ page, pageSize, search, sortBy, sortOrder });
  const { data: universities } = useUniversitiesList();
  const { createMutation, updateMutation, deleteMutation } = useProgramMutations();

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
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

  const handleEdit = (program: any) => {
    setEditingId(program.id);
    form.reset({
      name_ru: program.name_ru,
      name_kz: program.name_kz || '',
      name_en: program.name_en || '',
      university_id: program.university_id,
      degree_level: program.degree_level,
      duration_years: program.duration_years,
      tuition_fee_kzt: program.tuition_fee_kzt,
      grants_available: program.grants_available || false,
      ent_min_score: program.ent_min_score,
      description_ru: program.description_ru || '',
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    form.reset(defaultValues);
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: ProgramFormData) => {
    const data = {
      ...values,
      name_kz: values.name_kz || null,
      name_en: values.name_en || null,
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

  const getDegreeLabel = (level: DegreeLevel) => {
    const labels: Record<DegreeLevel, string> = {
      bachelor: 'Бакалавриат',
      master: 'Магистратура',
      doctorate: 'Докторантура',
    };
    return labels[level];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Управление программами</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить программу
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Редактировать программу' : 'Добавить программу'}</DialogTitle>
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
                    name="degree_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Уровень *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Выберите уровень" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bachelor">Бакалавриат</SelectItem>
                            <SelectItem value="master">Магистратура</SelectItem>
                            <SelectItem value="doctorate">Докторантура</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Длительность (лет)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 4)}
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
                    name="tuition_fee_kzt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Стоимость (тенге)</FormLabel>
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
                    name="ent_min_score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Мин. балл ЕНТ</FormLabel>
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
                <FormField
                  control={form.control}
                  name="grants_available"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Доступны гранты</FormLabel>
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
            placeholder="Поиск по названию..."
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
                    <TableHead>ВУЗ</TableHead>
                    <SortableTableHead sortKey="degree_level" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                      Уровень
                    </SortableTableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!data?.data.length ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Программы не найдены
                      </TableCell>
                    </TableRow>
                  ) : data.data.map((prog) => (
                    <TableRow key={prog.id}>
                      <TableCell className="font-medium">{prog.name_ru}</TableCell>
                      <TableCell>{prog.universities?.name_ru}</TableCell>
                      <TableCell>{getDegreeLabel(prog.degree_level)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(prog)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(prog.id)}>
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
        title="Удалить программу?"
        description="Это действие нельзя отменить."
        onConfirm={handleDelete}
        confirmText="Удалить"
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}
