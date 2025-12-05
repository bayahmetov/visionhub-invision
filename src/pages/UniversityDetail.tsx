import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Globe, Mail, Phone, Trophy, Users, BookOpen, Calendar,
  Scale, Share2, ExternalLink, Play, Building, Target, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';
import { universities, programs } from '@/data/mockData';
import { toast } from 'sonner';

export default function UniversityDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, getLocalizedField } = useLanguage();
  const { addToCompare, isInCompare, canAddMore } = useCompare();

  const university = universities.find(u => u.id === id);

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

  const universityPrograms = programs.filter(p => p.university_id === id);
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

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={university.cover_image_url}
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
                src={university.logo_url}
                alt=""
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name_en)}&background=0A9EB7&color=fff&size=96`;
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {t(`filters.types.${university.type}`)}
                </Badge>
                {university.has_grants && (
                  <Badge variant="secondary">Гранты доступны</Badge>
                )}
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                {getLocalizedField(university, 'name')}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {university.city}, {university.address}
                </span>
                <a href={university.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                  <Globe className="h-4 w-4" />
                  {university.website.replace('https://', '')}
                </a>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  <span className="font-semibold">#{university.ranking_national}</span>
                  <span className="text-muted-foreground">в Казахстане</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{university.students_count.toLocaleString()}</span>
                  <span className="text-muted-foreground">студентов</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{university.programs_count}</span>
                  <span className="text-muted-foreground">программ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{university.founded_year}</span>
                  <span className="text-muted-foreground">год основания</span>
                </div>
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
              <Button asChild className="gap-2">
                <a href={university.website} target="_blank" rel="noopener noreferrer">
                  Сайт ВУЗа
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
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
            <TabsTrigger value="admissions">{t('university.admissions')}</TabsTrigger>
            {university.has_3d_tour && (
              <TabsTrigger value="tour">{t('university.tours')}</TabsTrigger>
            )}
            <TabsTrigger value="contacts">{t('university.contacts')}</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    {t('university.history')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {getLocalizedField(university, 'history')}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('university.facilities')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {university.fields.map(field => (
                    <Badge key={field} variant="secondary">
                      {t(`fields.${field}`)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-4">
            {universityPrograms.length > 0 ? (
              universityPrograms.map(program => (
                <Card key={program.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold mb-1">
                          {getLocalizedField(program, 'name')}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {getLocalizedField(program, 'description')}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-primary" />
                            {program.duration_years} {t('common.years')}
                          </span>
                          <span>
                            {formatCurrency(program.tuition_fee)}/год
                          </span>
                          <span>
                            {program.employment_rate}% трудоустройство
                          </span>
                        </div>
                      </div>
                      <Badge>
                        {t(`filters.degrees.${program.degree_level}`)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Программы загружаются...</p>
              </Card>
            )}
          </TabsContent>

          {/* Admissions Tab */}
          <TabsContent value="admissions">
            <Card>
              <CardHeader>
                <CardTitle>Приём 2025</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="text-2xl font-bold text-primary">75+</div>
                    <div className="text-sm text-muted-foreground">Мин. балл ЕНТ</div>
                  </div>
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="text-2xl font-bold text-primary">25 июля</div>
                    <div className="text-sm text-muted-foreground">Дедлайн подачи</div>
                  </div>
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="text-2xl font-bold text-accent">✓</div>
                    <div className="text-sm text-muted-foreground">Гранты доступны</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Стоимость обучения</h4>
                  <p className="text-muted-foreground">
                    От {formatCurrency(university.tuition_min)} до {formatCurrency(university.tuition_max)} в год
                  </p>
                </div>

                <Button asChild className="w-full md:w-auto">
                  <a href={university.website} target="_blank" rel="noopener noreferrer">
                    Подать заявку на сайте ВУЗа
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tour Tab */}
          {university.has_3d_tour && (
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
                      src={university.tour_url}
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
                  <span>{university.city}, {university.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <a href={university.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    {university.website}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <a href={`mailto:${university.email}`} className="hover:text-primary">
                    {university.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <a href={`tel:${university.phone}`} className="hover:text-primary">
                    {university.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
