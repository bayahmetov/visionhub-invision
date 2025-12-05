import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Star, User, LogOut, Building2, Loader2, KeyRound, Target, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import ReviewForm from './student/ReviewForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';
import ProfileTab from './shared/ProfileTab';
import AccessRequestForm from './student/AccessRequestForm';
import { ApplicantProfile } from './student/ApplicantProfile';
import { RoadmapTab } from './student/RoadmapTab';
import { DocumentsTab } from './student/DocumentsTab';
import { WishlistTab } from './student/WishlistTab';

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
          <p className="text-muted-foreground">Ваш путь к поступлению</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      <Tabs defaultValue="roadmap">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="roadmap" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Дорожная карта</span>
          </TabsTrigger>
          <TabsTrigger value="profile-edu" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Мой профиль</span>
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Избранное</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Документы</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Отзывы</span>
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            <span className="hidden sm:inline">Доступ</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Настройки</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap">
          <RoadmapTab />
        </TabsContent>

        <TabsContent value="profile-edu">
          <ApplicantProfile />
        </TabsContent>

        <TabsContent value="wishlist">
          <WishlistTab />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab />
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

        <TabsContent value="access">
          <AccessRequestForm />
        </TabsContent>

        <TabsContent value="settings">
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
