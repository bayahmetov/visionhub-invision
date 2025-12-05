import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Save, User } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Введите имя').max(100, 'Максимум 100 символов'),
  phone: z.string().max(20, 'Максимум 20 символов').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileTabProps {
  user: SupabaseUser | null;
}

export default function ProfileTab({ user }: ProfileTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      phone: '',
    },
    values: profile ? {
      full_name: profile.full_name || '',
      phone: profile.phone || '',
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          full_name: data.full_name,
          phone: data.phone || null,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({ title: 'Успешно', description: 'Профиль обновлен' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Данные профиля</CardTitle>
            <CardDescription>Управление личной информацией</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Полное имя *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} placeholder="+7 (XXX) XXX-XX-XX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4 border-t space-y-2">
              <div>
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm text-muted-foreground ml-2">{user?.email}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Дата регистрации:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {user?.created_at && new Date(user.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
