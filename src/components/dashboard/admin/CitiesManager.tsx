import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export function CitiesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: cities, isLoading } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name_ru');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingCity?.id) {
        const { error } = await supabase.from('cities').update(data).eq('id', editingCity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cities').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      toast({ title: editingCity?.id ? 'Город обновлён' : 'Город добавлен' });
      setIsDialogOpen(false);
      setEditingCity(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      toast({ title: 'Город удалён' });
      setDeleteId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name_ru: formData.get('name_ru'),
      name_kz: formData.get('name_kz') || null,
      name_en: formData.get('name_en') || null,
      region: formData.get('region'),
      population: formData.get('population') ? Number(formData.get('population')) : null,
      description_ru: formData.get('description_ru') || null,
      cost_of_living_kzt: formData.get('cost_of_living_kzt') ? Number(formData.get('cost_of_living_kzt')) : null,
      dormitory_cost_kzt: formData.get('dormitory_cost_kzt') ? Number(formData.get('dormitory_cost_kzt')) : null,
      rent_cost_kzt: formData.get('rent_cost_kzt') ? Number(formData.get('rent_cost_kzt')) : null,
      safety_rating: formData.get('safety_rating') ? Number(formData.get('safety_rating')) : null,
      image_url: formData.get('image_url') || null,
    };
    saveMutation.mutate(data);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '—';
    return `${(price / 1000).toFixed(0)}K ₸`;
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Управление городами
        </CardTitle>
        <Button onClick={() => { setEditingCity(null); setIsDialogOpen(true); }}>
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
                <TableHead>Город</TableHead>
                <TableHead>Регион</TableHead>
                <TableHead>Население</TableHead>
                <TableHead>Стоимость жизни</TableHead>
                <TableHead>Общежитие</TableHead>
                <TableHead className="w-24">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities?.map((city) => (
                <TableRow key={city.id}>
                  <TableCell className="font-medium">{city.name_ru}</TableCell>
                  <TableCell>{city.region}</TableCell>
                  <TableCell>{city.population ? `${(city.population / 1000000).toFixed(1)}M` : '—'}</TableCell>
                  <TableCell>{formatPrice(city.cost_of_living_kzt)}</TableCell>
                  <TableCell>{formatPrice(city.dormitory_cost_kzt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCity(city); setIsDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(city.id)}>
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
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCity ? 'Редактировать город' : 'Новый город'}</DialogTitle>
              <DialogDescription>Заполните информацию о городе</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Название (RU)</Label>
                  <Input name="name_ru" defaultValue={editingCity?.name_ru} required />
                </div>
                <div>
                  <Label>Название (KZ)</Label>
                  <Input name="name_kz" defaultValue={editingCity?.name_kz} />
                </div>
                <div>
                  <Label>Название (EN)</Label>
                  <Input name="name_en" defaultValue={editingCity?.name_en} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Регион</Label>
                  <Input name="region" defaultValue={editingCity?.region} required />
                </div>
                <div>
                  <Label>Население</Label>
                  <Input name="population" type="number" defaultValue={editingCity?.population} />
                </div>
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea name="description_ru" defaultValue={editingCity?.description_ru} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Стоимость жизни (₸/мес)</Label>
                  <Input name="cost_of_living_kzt" type="number" defaultValue={editingCity?.cost_of_living_kzt} />
                </div>
                <div>
                  <Label>Общежитие (₸/мес)</Label>
                  <Input name="dormitory_cost_kzt" type="number" defaultValue={editingCity?.dormitory_cost_kzt} />
                </div>
                <div>
                  <Label>Аренда (₸/мес)</Label>
                  <Input name="rent_cost_kzt" type="number" defaultValue={editingCity?.rent_cost_kzt} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Рейтинг безопасности (1-5)</Label>
                  <Input name="safety_rating" type="number" min="1" max="5" defaultValue={editingCity?.safety_rating} />
                </div>
                <div>
                  <Label>URL изображения</Label>
                  <Input name="image_url" type="url" defaultValue={editingCity?.image_url} />
                </div>
              </div>
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
          title="Удалить город?"
          description="Это действие нельзя отменить."
        />
      </CardContent>
    </Card>
  );
}
