import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const universityEditorSchema = z.object({
  description_ru: z.string().max(5000, 'Максимум 5000 символов').optional().or(z.literal('')),
  description_kz: z.string().max(5000, 'Максимум 5000 символов').optional().or(z.literal('')),
  description_en: z.string().max(5000, 'Максимум 5000 символов').optional().or(z.literal('')),
  mission_ru: z.string().max(2000, 'Максимум 2000 символов').optional().or(z.literal('')),
  mission_kz: z.string().max(2000, 'Максимум 2000 символов').optional().or(z.literal('')),
  mission_en: z.string().max(2000, 'Максимум 2000 символов').optional().or(z.literal('')),
  website: z.string().url('Некорректный URL').optional().or(z.literal('')),
  email: z.string().email('Некорректный email').optional().or(z.literal('')),
  phone: z.string().max(50, 'Максимум 50 символов').optional().or(z.literal('')),
  address: z.string().max(500, 'Максимум 500 символов').optional().or(z.literal('')),
  students_count: z.number().min(0).nullable().optional(),
  teachers_count: z.number().min(0).nullable().optional(),
  has_dormitory: z.boolean().optional(),
  has_military_department: z.boolean().optional(),
  has_grants: z.boolean().optional(),
  virtual_tour_url: z.string().url('Некорректный URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof universityEditorSchema>;

interface UniversityEditorProps {
  university: any;
  onUpdate: () => void;
}

export default function UniversityEditor({ university, onUpdate }: UniversityEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(universityEditorSchema),
    defaultValues: {
      description_ru: university.description_ru || '',
      description_kz: university.description_kz || '',
      description_en: university.description_en || '',
      mission_ru: university.mission_ru || '',
      mission_kz: university.mission_kz || '',
      mission_en: university.mission_en || '',
      website: university.website || '',
      email: university.email || '',
      phone: university.phone || '',
      address: university.address || '',
      students_count: university.students_count,
      teachers_count: university.teachers_count,
      has_dormitory: university.has_dormitory || false,
      has_military_department: university.has_military_department || false,
      has_grants: university.has_grants || false,
      virtual_tour_url: university.virtual_tour_url || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase
        .from('universities')
        .update({
          description_ru: data.description_ru || null,
          description_kz: data.description_kz || null,
          description_en: data.description_en || null,
          mission_ru: data.mission_ru || null,
          mission_kz: data.mission_kz || null,
          mission_en: data.mission_en || null,
          website: data.website || null,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          students_count: data.students_count,
          teachers_count: data.teachers_count,
          has_dormitory: data.has_dormitory,
          has_military_department: data.has_military_department,
          has_grants: data.has_grants,
          virtual_tour_url: data.virtual_tour_url || null,
        })
        .eq('id', university.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      toast({ title: 'Успешно', description: 'Данные сохранены' });
      onUpdate();
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Информация о ВУЗе</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <FormLabel>Название (RU)</FormLabel>
                <Input value={university.name_ru || ''} disabled className="bg-muted" />
              </div>
              <div>
                <FormLabel>Город</FormLabel>
                <Input value={university.city || ''} disabled className="bg-muted" />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description_ru"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание (RU)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description_kz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание (KZ)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mission_ru"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Миссия (RU)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-3 gap-4">
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="students_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Количество студентов</FormLabel>
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
                    <FormLabel>Количество преподавателей</FormLabel>
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
              name="virtual_tour_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ссылка на виртуальный тур</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить изменения
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
