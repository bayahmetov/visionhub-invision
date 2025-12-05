import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, User, Eye, BookOpen } from 'lucide-react';
import { useEffect } from 'react';

const categories = [
  { value: 'guide', label: 'Гайды' },
  { value: 'story', label: 'Истории' },
  { value: 'interview', label: 'Интервью' },
  { value: 'news', label: 'Новости' },
];

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          profiles (full_name, avatar_url)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Increment view count
  const viewMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase
        .from('articles')
        .update({ views_count: (article?.views_count || 0) + 1 })
        .eq('id', articleId);
      if (error) throw error;
    },
  });

  useEffect(() => {
    if (article?.id) {
      viewMutation.mutate(article.id);
    }
  }, [article?.id]);

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'guide': return 'bg-primary text-primary-foreground';
      case 'story': return 'bg-purple-500 text-white';
      case 'interview': return 'bg-amber-500 text-white';
      case 'news': return 'bg-emerald-500 text-white';
      default: return 'bg-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Статья не найдена</h1>
          <p className="text-muted-foreground mb-4">
            Возможно, статья была удалена или перемещена
          </p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к блогу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/blog')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к блогу
        </Button>

        {/* Cover Image */}
        {article.cover_image_url ? (
          <div className="aspect-video w-full overflow-hidden rounded-xl mb-8">
            <img
              src={article.cover_image_url}
              alt={article.title_ru}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-secondary rounded-xl mb-8 flex items-center justify-center">
            <BookOpen className="h-24 w-24 text-primary/40" />
          </div>
        )}

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className={getCategoryStyle(article.category)}>
              {categories.find(c => c.value === article.category)?.label || article.category}
            </Badge>
            {article.published_at && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(parseISO(article.published_at), 'd MMMM yyyy', { locale: ru })}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title_ru}</h1>

          {article.excerpt_ru && (
            <p className="text-lg text-muted-foreground mb-4">{article.excerpt_ru}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {article.profiles?.avatar_url ? (
                <img src={article.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}
              <span>{article.profiles?.full_name || 'Редакция'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{article.views_count || 0} просмотров</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <div 
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: article.content_ru.replace(/\n/g, '<br/>') }}
          />
        </article>

        {/* Related Articles Section */}
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-xl font-bold mb-4">Читайте также</h2>
          <Button asChild variant="outline">
            <Link to="/blog">Все статьи</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
