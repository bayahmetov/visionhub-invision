import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Calendar, DollarSign, Briefcase, GraduationCap, MapPin, 
  Globe, Award, ArrowLeft, Scale, Building2, BookOpen, CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useComparePrograms } from '@/contexts/CompareProgramsContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, getLocalizedField } = useLanguage();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useComparePrograms();

  const { data: program, isLoading: programLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: university } = useQuery({
    queryKey: ['university', program?.university_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('id', program!.university_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!program?.university_id,
  });

  const { data: field } = useQuery({
    queryKey: ['field', program?.field_id],
    queryFn: async () => {
      if (!program?.field_id) return null;
      const { data, error } = await supabase
        .from('fields_of_study')
        .select('*')
        .eq('id', program.field_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!program?.field_id,
  });

  // Fetch similar programs from same field
  const { data: similarPrograms = [] } = useQuery({
    queryKey: ['similar-programs', program?.field_id, program?.id],
    queryFn: async () => {
      if (!program?.field_id) return [];
      const { data, error } = await supabase
        .from('programs')
        .select('*, universities(name_ru, name_en, logo_url)')
        .eq('field_id', program.field_id)
        .neq('id', program.id)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!program?.field_id,
  });

  const formatCurrency = (num: number | null) => {
    if (!num || num === 0) return 'Бесплатно (грант)';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleCompare = () => {
    if (!program) return;
    if (isInCompare(program.id)) {
      removeFromCompare(program.id);
      toast.info('Убрано из сравнения');
    } else if (canAddMore) {
      addToCompare(program.id);
      toast.success('Добавлено к сравнению');
    } else {
      toast.error('Максимум 4 программы для сравнения');
    }
  };

  if (programLoading) {
    return (
      <div className="min-h-screen bg-muted/20">
        <div className="container py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Программа не найдена</h2>
          <p className="text-muted-foreground mb-4">Запрашиваемая программа не существует</p>
          <Button asChild>
            <Link to="/programs">Вернуться к программам</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const inCompare = isInCompare(program.id);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <Link 
            to="/programs" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Все программы
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* University Logo */}
            {university && (
              <Link to={`/universities/${university.id}`}>
                <div className="h-20 w-20 rounded-xl border-2 border-border bg-background p-2 shadow-sm">
                  <img
                    src={university.logo_url || ''}
                    alt=""
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name_en || university.name_ru)}&background=0A9EB7&color=fff&size=80`;
                    }}
                  />
                </div>
              </Link>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-sm">
                  {t(`filters.degrees.${program.degree_level}`)}
                </Badge>
                {field && (
                  <Badge variant="outline">
                    {field.icon} {getLocalizedField(field, 'name')}
                  </Badge>
                )}
                {program.grants_available && (
                  <Badge className="bg-accent text-accent-foreground">Грант доступен</Badge>
                )}
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                {getLocalizedField(program, 'name')}
              </h1>

              {university && (
                <Link 
                  to={`/universities/${university.id}`}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Building2 className="h-4 w-4" />
                  {getLocalizedField(university, 'name')}
                  {university.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {university.city}
                    </span>
                  )}
                </Link>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant={inCompare ? 'default' : 'outline'}
                onClick={handleCompare}
              >
                <Scale className="h-4 w-4 mr-2" />
                {inCompare ? 'В сравнении' : 'Сравнить'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {program.description_ru && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    О программе
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {getLocalizedField(program, 'description')}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Key Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Ключевые показатели</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Длительность</p>
                      <p className="text-muted-foreground">{program.duration_years} {t('common.years')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Стоимость обучения</p>
                      <p className="text-muted-foreground">{formatCurrency(program.tuition_fee_kzt)}/год</p>
                    </div>
                  </div>

                  {program.ent_min_score && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Минимальный балл ЕНТ</p>
                        <p className="text-muted-foreground">от {program.ent_min_score} баллов</p>
                      </div>
                    </div>
                  )}

                  {program.employment_rate && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10">
                      <Briefcase className="h-5 w-5 text-accent mt-0.5" />
                      <div>
                        <p className="font-medium">Трудоустройство</p>
                        <p className="text-accent font-semibold">{program.employment_rate}% выпускников</p>
                      </div>
                    </div>
                  )}

                  {program.language && program.language.length > 0 && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <Globe className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Языки обучения</p>
                        <div className="flex gap-1 mt-1">
                          {program.language.map(lang => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang === 'ru' ? 'Русский' : lang === 'kz' ? 'Казахский' : lang === 'en' ? 'English' : lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {program.grants_available && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10">
                      <Award className="h-5 w-5 text-accent mt-0.5" />
                      <div>
                        <p className="font-medium">Государственный грант</p>
                        <p className="text-accent">Доступен</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Similar Programs */}
            {similarPrograms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Похожие программы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {similarPrograms.map((sp: any) => (
                    <Link 
                      key={sp.id}
                      to={`/programs/${sp.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg border border-border bg-background p-1.5 shrink-0">
                        <img
                          src={sp.universities?.logo_url || ''}
                          alt=""
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=U&background=0A9EB7&color=fff&size=40`;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{getLocalizedField(sp, 'name')}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {sp.universities?.name_ru}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(sp.tuition_fee_kzt)}/год
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* University Card */}
            {university && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Университет</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link 
                    to={`/universities/${university.id}`}
                    className="block p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-lg border border-border bg-background p-1.5">
                        <img
                          src={university.logo_url || ''}
                          alt=""
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name_en || university.name_ru)}&background=0A9EB7&color=fff&size=48`;
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{getLocalizedField(university, 'name')}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {university.city}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {university.ranking_national && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Рейтинг РК</span>
                          <span className="font-medium">#{university.ranking_national}</span>
                        </div>
                      )}
                      {university.students_count && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Студентов</span>
                          <span className="font-medium">{university.students_count.toLocaleString()}</span>
                        </div>
                      )}
                      <Badge variant="outline" className="w-full justify-center mt-2">
                        {t(`filters.types.${university.type}`)}
                      </Badge>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Facts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Требования</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span className="text-sm">Аттестат о среднем образовании</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span className="text-sm">Сертификат ЕНТ {program.ent_min_score ? `(от ${program.ent_min_score} баллов)` : ''}</span>
                </div>
                {program.language?.includes('en') && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span className="text-sm">Сертификат IELTS/TOEFL</span>
                  </div>
                )}
                <Separator className="my-3" />
                <Button asChild className="w-full">
                  <Link to={`/universities/${program.university_id}`}>
                    Подать заявку
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
