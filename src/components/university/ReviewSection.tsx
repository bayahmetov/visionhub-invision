import { useState } from 'react';
import { Star, Send, Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface ReviewSectionProps {
  universityId: string;
  universityName: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export function ReviewSection({ universityId, universityName }: ReviewSectionProps) {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['university-reviews', universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, user_id, profiles(full_name)')
        .eq('university_id', universityId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as Review[];
    },
  });

  const { data: userReview } = useQuery({
    queryKey: ['user-review', universityId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('university_id', universityId)
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Необходимо войти');
      if (rating === 0) throw new Error('Выберите оценку');

      const { error } = await supabase.from('reviews').upsert({
        user_id: user.id,
        university_id: universityId,
        rating,
        comment: comment || null,
      }, { onConflict: 'user_id,university_id' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Отзыв сохранен');
      setRating(0);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['university-reviews', universityId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', universityId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['university-rating', universityId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const canReview = user && role === 'student' && !userReview;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={`h-5 w-5 ${value <= Math.round(averageRating) ? 'fill-accent text-accent' : 'text-muted'}`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {reviews.length} {reviews.length === 1 ? 'отзыв' : reviews.length < 5 ? 'отзыва' : 'отзывов'}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-1 w-full max-w-md">
              {[5, 4, 3, 2, 1].map((value) => {
                const count = reviews.filter(r => r.rating === value).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={value} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{value}</span>
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Review Form */}
      {canReview ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Оценить {universityName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ваша оценка</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        value <= (hoveredRating || rating)
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Комментарий (необязательно)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Расскажите о своем опыте..."
                rows={3}
              />
            </div>

            <Button
              onClick={() => submitMutation.mutate()}
              disabled={rating === 0 || submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Отправить отзыв
            </Button>
          </CardContent>
        </Card>
      ) : userReview ? (
        <Card>
          <CardContent className="py-6 text-center">
            <Star className="h-8 w-8 fill-accent text-accent mx-auto mb-2" />
            <p className="text-muted-foreground">Вы уже оценили этот ВУЗ</p>
            <p className="text-sm text-muted-foreground">
              Ваша оценка: {userReview.rating}/5
            </p>
          </CardContent>
        </Card>
      ) : !user ? (
        <Card>
          <CardContent className="py-6 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-4">Войдите, чтобы оставить отзыв</p>
            <Button asChild>
              <Link to="/auth">Войти</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Отзывы студентов</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Пока нет отзывов</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {review.profiles?.full_name || 'Студент'}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            className={`h-3.5 w-3.5 ${
                              value <= review.rating ? 'fill-accent text-accent' : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
