import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Calendar, User, Eye, BookOpen, Lightbulb, 
  MessageSquare, Newspaper, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { value: 'all', label: 'Все', icon: BookOpen },
  { value: 'guide', label: 'Гайды', icon: Lightbulb },
  { value: 'story', label: 'Истории', icon: MessageSquare },
  { value: 'interview', label: 'Интервью', icon: User },
  { value: 'news', label: 'Новости', icon: Newspaper },
];

export default function Blog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles', category],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select(`
          *,
          profiles (full_name, avatar_url)
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      
      if (category !== 'all') {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredArticles = articles?.filter(article =>
    article.title_ru.toLowerCase().includes(search.toLowerCase()) ||
    article.excerpt_ru?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const featuredArticle = filteredArticles[0];
  const restArticles = filteredArticles.slice(1);

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'guide': return 'bg-primary text-primary-foreground';
      case 'story': return 'bg-purple-500 text-white';
      case 'interview': return 'bg-amber-500 text-white';
      case 'news': return 'bg-emerald-500 text-white';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/30 border-b">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-2">Медиа-центр</h1>
          <p className="text-muted-foreground">
            Истории выпускников, гайды и полезные материалы о высшем образовании
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск статей..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList>
              {categories.map(cat => (
                <TabsTrigger key={cat.value} value={cat.value} className="gap-2">
                  <cat.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-96 bg-muted rounded-lg animate-pulse" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Статей пока нет</h3>
            <p className="text-muted-foreground">
              {articles?.length === 0 
                ? 'Скоро здесь появятся интересные материалы'
                : 'По вашему запросу ничего не найдено'
              }
            </p>
          </Card>
        ) : (
          <>
            {/* Featured Article */}
            {featuredArticle && (
              <Card className="mb-8 overflow-hidden">
                <div className="md:flex">
                  {featuredArticle.cover_image_url ? (
                    <div className="md:w-1/2 h-64 md:h-auto">
                      <img 
                        src={featuredArticle.cover_image_url} 
                        alt={featuredArticle.title_ru}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                      <BookOpen className="h-24 w-24 text-primary/40" />
                    </div>
                  )}
                  <div className="md:w-1/2 p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getCategoryStyle(featuredArticle.category)}>
                        {categories.find(c => c.value === featuredArticle.category)?.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {featuredArticle.published_at && format(parseISO(featuredArticle.published_at), 'd MMMM yyyy', { locale: ru })}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{featuredArticle.title_ru}</h2>
                    {featuredArticle.excerpt_ru && (
                      <p className="text-muted-foreground mb-4 flex-1">{featuredArticle.excerpt_ru}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {featuredArticle.profiles?.avatar_url ? (
                          <img src={featuredArticle.profiles.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span>{featuredArticle.profiles?.full_name || 'Редакция'}</span>
                        <span>•</span>
                        <Eye className="h-4 w-4" />
                        <span>{featuredArticle.views_count || 0}</span>
                      </div>
                      <Button asChild>
                        <Link to={`/blog/${featuredArticle.slug}`}>
                          Читать
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Articles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restArticles.map(article => (
                <Link key={article.id} to={`/blog/${article.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                    {article.cover_image_url ? (
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={article.cover_image_url} 
                          alt={article.title_ru}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={getCategoryStyle(article.category)}>
                          {categories.find(c => c.value === article.category)?.label}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold mb-2 line-clamp-2">{article.title_ru}</h3>
                      
                      {article.excerpt_ru && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {article.excerpt_ru}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {article.published_at && format(parseISO(article.published_at), 'd MMM', { locale: ru })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {article.views_count || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
