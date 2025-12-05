import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Send, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUniversitiesList } from '@/hooks/useUniversities';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, ReviewFormData } from '@/lib/validations/review';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ReviewFormProps {
  onSuccess: () => void;
}

export default function ReviewForm({ onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: universities = [] } = useUniversitiesList();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      university_id: '',
      rating: 0,
      comment: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const { error } = await supabase.from('reviews').upsert({
        user_id: user!.id,
        university_id: data.university_id,
        rating: data.rating,
        comment: data.comment || null,
      }, { onConflict: 'user_id,university_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Успешно', description: 'Отзыв сохранен' });
      form.reset({ university_id: '', rating: 0, comment: '' });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const rating = form.watch('rating');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Оставить отзыв</CardTitle>
        <CardDescription>Поделитесь впечатлениями о ВУЗе</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="university_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ВУЗ</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите ВУЗ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {universities.map((uni) => (
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
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Оценка</FormLabel>
                  <FormControl>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => field.onChange(value)}
                          className="p-1 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary rounded"
                        >
                          <Star
                            className={`h-7 w-7 ${value <= rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Комментарий (необязательно)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Расскажите о своем опыте..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Отправить отзыв
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
