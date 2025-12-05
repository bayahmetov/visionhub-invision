import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, BookOpen, Users, Handshake, Star, User, KeyRound, LogOut, Tag, Heart, Loader2, Calendar, MapPin, Newspaper, Megaphone } from 'lucide-react';
import UniversitiesManager from './admin/UniversitiesManager';
import ProgramsManager from './admin/ProgramsManager';
import UsersManager from './admin/UsersManager';
import PartnershipsManager from './admin/PartnershipsManager';
import ReviewsManager from './admin/ReviewsManager';
import AccessRequestsManager from './admin/AccessRequestsManager';
import FieldsManager from './admin/FieldsManager';
import { EventsManager } from './admin/EventsManager';
import { CitiesManager } from './admin/CitiesManager';
import { ArticlesManager } from './admin/ArticlesManager';
import { AnnouncementsManager } from './admin/AnnouncementsManager';
import ProfileTab from './shared/ProfileTab';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import ReviewForm from './student/ReviewForm';

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('universities');
  const { signOut, user } = useAuth();
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['admin-favorites', user?.id],
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

  const { data: myReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['admin-reviews', user?.id],
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
      queryClient.invalidateQueries({ queryKey: ['admin-favorites', user?.id] });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews', user?.id] });
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Панель администратора</h1>
          <p className="text-muted-foreground">Полное управление данными системы</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 mb-8">
          <TabsTrigger value="universities" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden lg:inline">ВУЗы</span>
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden lg:inline">Программы</span>
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden lg:inline">Направления</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden lg:inline">События</span>
          </TabsTrigger>
          <TabsTrigger value="cities" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden lg:inline">Города</span>
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            <span className="hidden lg:inline">Статьи</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden lg:inline">Объявления</span>
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="flex items-center gap-2">
            <Handshake className="h-4 w-4" />
            <span className="hidden lg:inline">Партнерства</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden lg:inline">Пользователи</span>
          </TabsTrigger>
          <TabsTrigger value="access-requests" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            <span className="hidden lg:inline">Заявки</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden lg:inline">Отзывы</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden lg:inline">Избранное</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden lg:inline">Профиль</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="universities">
          <UniversitiesManager />
        </TabsContent>
        <TabsContent value="programs">
          <ProgramsManager />
        </TabsContent>
        <TabsContent value="fields">
          <FieldsManager />
        </TabsContent>
        <TabsContent value="events">
          <EventsManager />
        </TabsContent>
        <TabsContent value="cities">
          <CitiesManager />
        </TabsContent>
        <TabsContent value="articles">
          <ArticlesManager />
        </TabsContent>
        <TabsContent value="announcements">
          <AnnouncementsManager />
        </TabsContent>
        <TabsContent value="partnerships">
          <PartnershipsManager />
        </TabsContent>
        <TabsContent value="users">
          <UsersManager />
        </TabsContent>
        <TabsContent value="access-requests">
          <AccessRequestsManager />
        </TabsContent>
        <TabsContent value="reviews">
          <ReviewsManager />
        </TabsContent>

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

        <TabsContent value="profile">
          <div className="space-y-6">
            <ProfileTab user={user} />
            
            {/* My Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Мои отзывы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-reviews', user?.id] })} />
                
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : myReviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Вы ещё не оставляли отзывов</p>
                ) : (
                  <div className="space-y-4 mt-6">
                    {myReviews.map((review) => (
                      <div key={review.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{review.universities.name_ru}</p>
                          <div className="flex items-center gap-1 my-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted'}`}
                              />
                            ))}
                          </div>
                          {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteReviewId(review.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
