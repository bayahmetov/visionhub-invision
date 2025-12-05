import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Star, User, LogOut, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import ReviewForm from './student/ReviewForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';
import ProfileTab from './shared/ProfileTab';

interface Favorite {
  id: string;
  university_id: string;
  universities: {
    id: string;
    name_ru: string;
    city: string;
    logo_url: string | null;
  };
}

interface Review {
  id: string;
  university_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  universities: {
    name_ru: string;
  };
}

export default function StudentDashboard() {
  const { signOut, user } = useAuth();
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['student-favorites', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('id, university_id, universities(id, name_ru, city, logo_url)')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data as unknown as Favorite[];
    },
    enabled: !!user,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['student-reviews', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, university_id, rating, comment, created_at, universities(name_ru)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as Review[];
    },
    enabled: !!user,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('favorites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-favorites', user?.id] });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-reviews', user?.id] });
    },
  });

  const handleDeleteReview = () => {
    if (deleteReviewId) {
      deleteReviewMutation.mutate(deleteReviewId);
      setDeleteReviewId(null);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Личный кабинет</h1>
          <p className="text-muted-foreground">Управляйте избранным и отзывами</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      <Tabs defaultValue="favorites">
        <TabsList className="mb-6">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Избранное</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Мои отзывы</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Профиль</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites">
          {favoritesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : favorites.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">У вас пока нет избранных ВУЗов</p>
                <Button asChild className="mt-4">
                  <Link to="/universities">Посмотреть ВУЗы</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((fav) => (
                <Card key={fav.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {fav.universities.logo_url ? (
                          <img src={fav.universities.logo_url} alt="" className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-base line-clamp-1">{fav.universities.name_ru}</CardTitle>
                          <CardDescription>{fav.universities.city}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/universities/${fav.university_id}`}>Подробнее</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavoriteMutation.mutate(fav.id)}
                      disabled={removeFavoriteMutation.isPending}
                    >
                      <Heart className="h-4 w-4 fill-destructive text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          <div className="space-y-6">
            <ReviewForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['student-reviews', user?.id] })} />

            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Вы еще не оставляли отзывов</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{review.universities.name_ru}</CardTitle>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <CardDescription>
                        {new Date(review.created_at).toLocaleDateString('ru-RU')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {review.comment && <p className="text-sm mb-4">{review.comment}</p>}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteReviewId(review.id)}
                      >
                        Удалить отзыв
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <ProfileTab user={user} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteReviewId}
        onOpenChange={(open) => !open && setDeleteReviewId(null)}
        title="Удалить отзыв?"
        description="Это действие нельзя отменить."
        onConfirm={handleDeleteReview}
        confirmText="Удалить"
        loading={deleteReviewMutation.isPending}
      />
    </div>
  );
}
