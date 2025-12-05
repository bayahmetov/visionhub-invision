import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Globe, Mail, Phone, Trophy, Users, BookOpen, Calendar,
  Scale, Share2, ExternalLink, Play, Building, Target, History, Star, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { ReviewSection } from '@/components/university/ReviewSection';
import { useUniversityRating } from '@/hooks/useUniversityRating';

type University = Tables<'universities'>;
type Program = Tables<'programs'>;

export default function UniversityDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, getLocalizedField } = useLanguage();
  const { addToCompare, isInCompare, canAddMore } = useCompare();

  const { data: university, isLoading } = useQuery({
    queryKey: ['university', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['university-programs', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('university_id', id!)
        .order('name_ru');
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: ratingData } = useUniversityRating(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">ВУЗ не найден</h1>
        <Button asChild>
          <Link to="/universities">Вернуться к каталогу</Link>
        </Button>
      </div>
    );
  }

  const inCompare = isInCompare(university.id);

  const handleCompare = () => {
    if (inCompare) {
      toast.info('Уже в сравнении');
    } else if (canAddMore) {
      addToCompare(university.id);
      toast.success('Добавлено к сравнению');
    } else {
      toast.error(t('compare.maxReached'));
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: getLocalizedField(university, 'name'),
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована');
    }
  };

  const formatCurrency = (num: number | null) => {
    if (!num) return '-';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const typeLabels: Record<string, string> = {
    national: t('filters.types.national'),
    state: t('filters.types.state'),
    private: t('filters.types.private'),
    international: t('filters.types.international'),
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={university.cover_image_url || '/placeholder.svg'}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Header */}
      <div className="container relative -mt-24">
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-border bg-background p-3 shadow-md">
              <img
                src={university.logo_url || ''}
                alt=""
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name_en || university.name_ru)}&background=0A9EB7&color=fff&size=96`;
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {typeLabels[university.type]}
                </Badge>
                {university.has_grants && (
                  <Badge variant="secondary">Гранты доступны</Badge>
                )}
                {ratingData && ratingData.reviewsCount > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium">{ratingData.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({ratingData.reviewsCount})</span>
                  </div>
                )}
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                {getLocalizedField(university, 'name')}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {university.city}{university.address && `, ${university.address}`}
                </span>
                {university.website && (
                  <a href={university.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                    <Globe className="h-4 w-4" />
                    {university.website.replace('https://', '').replace('http://', '')}
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                {university.ranking_national && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    <span className="font-semibold">#{university.ranking_national}</span>
                    <span className="text-muted-foreground">в Казахстане</span>
                  </div>
                )}
                {university.students_count && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{university.students_count.toLocaleString()}</span>
                    <span className="text-muted-foreground">студентов</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{programs.length}</span>
                  <span className="text-muted-foreground">программ</span>
                </div>
                {university.founded_year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{university.founded_year}</span>
                    <span className="text-muted-foreground">год основания</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row md:flex-col gap-2">
              <Button onClick={handleCompare} variant={inCompare ? 'default' : 'outline'} className="gap-2">
                <Scale className="h-4 w-4" />
                {inCompare ? 'В сравнении' : 'Сравнить'}
              </Button>
              <Button variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Поделиться
              </Button>
              {university.website && (
                <Button asChild className="gap-2">
                  <a href={university.website} target="_blank" rel="noopener noreferrer">
                    Сайт ВУЗа
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="about">{t('university.about')}</TabsTrigger>
            <TabsTrigger value="programs">{t('university.programs')}</TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="h-4 w-4 mr-1" />
              Отзывы
            </TabsTrigger>
            {university.virtual_tour_url && (
              <TabsTrigger value="tour">{t('university.tours')}</TabsTrigger>
            )}
            <TabsTrigger value="contacts">{t('university.contacts')}</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {university.mission_ru && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      {t('university.mission')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {getLocalizedField(university, 'mission')}
                    </p>
                  </CardContent>
                </Card>
              )}

              {university.description_ru && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Об университете
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {getLocalizedField(university, 'description')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>{t('university.facilities')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {university.has_dormitory && (
                    <Badge variant="secondary">Общежитие</Badge>
                  )}
                  {university.has_military_department && (
                    <Badge variant="secondary">Военная кафедра</Badge>
                  )}
                  {university.has_grants && (
                    <Badge variant="secondary">Гранты</Badge>
                  )}
                  {university.accreditation && (
                    <Badge variant="outline">{university.accreditation}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-4">
            {programs.length > 0 ? (
              programs.map(program => (
                <Card key={program.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold mb-1">
                          {getLocalizedField(program, 'name')}
                        </h3>
                        {program.description_ru && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {getLocalizedField(program, 'description')}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-primary" />
                            {program.duration_years} {t('common.years')}
                          </span>
                          <span>
                            {formatCurrency(program.tuition_fee_kzt)}/год
                          </span>
                          {program.employment_rate && (
                            <span>
                              {program.employment_rate}% трудоустройство
                            </span>
                          )}
                          {program.ent_min_score && (
                            <span>
                              от {program.ent_min_score} ЕНТ
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge>
                          {t(`filters.degrees.${program.degree_level}`)}
                        </Badge>
                        {program.grants_available && (
                          <Badge variant="secondary" className="bg-accent/10 text-accent">
                            Грант
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Программы не найдены</p>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <ReviewSection 
              universityId={university.id} 
              universityName={getLocalizedField(university, 'name')} 
            />
          </TabsContent>

          {/* Tour Tab */}
          {university.virtual_tour_url && (
            <TabsContent value="tour">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    Виртуальный тур по кампусу
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                      src={university.virtual_tour_url}
                      className="h-full w-full"
                      allowFullScreen
                      title="3D Tour"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{university.city}{university.address && `, ${university.address}`}</span>
                </div>
                {university.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <a href={university.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      {university.website}
                    </a>
                  </div>
                )}
                {university.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <a href={`mailto:${university.email}`} className="hover:text-primary">
                      {university.email}
                    </a>
                  </div>
                )}
                {university.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <a href={`tel:${university.phone}`} className="hover:text-primary">
                      {university.phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
