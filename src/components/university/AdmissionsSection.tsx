import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, BookOpen, Award, Mail, Phone, Globe,
  Calculator, Clock, CheckCircle, Loader2
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface AdmissionsSectionProps {
  university: Tables<'universities'>;
}

export function AdmissionsSection({ university }: AdmissionsSectionProps) {
  const { t } = useLanguage();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['university-programs-admissions', university.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('university_id', university.id)
        .order('ent_min_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!university.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const programsWithGrants = programs.filter(p => p.grants_available);
  const minEntScore = programs.reduce((min, p) => {
    if (p.ent_min_score && (min === null || p.ent_min_score < min)) {
      return p.ent_min_score;
    }
    return min;
  }, null as number | null);
  const maxEntScore = programs.reduce((max, p) => {
    if (p.ent_min_score && (max === null || p.ent_min_score > max)) {
      return p.ent_min_score;
    }
    return max;
  }, null as number | null);

  const formatCurrency = (num: number | null) => {
    if (!num) return '-';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const minTuition = programs.reduce((min, p) => {
    if (p.tuition_fee_kzt && (min === null || p.tuition_fee_kzt < min)) {
      return p.tuition_fee_kzt;
    }
    return min;
  }, null as number | null);

  const degreeStats = programs.reduce((acc, p) => {
    acc[p.degree_level] = (acc[p.degree_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{programs.length}</p>
              <p className="text-xs text-muted-foreground">программ обучения</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Award className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{programsWithGrants.length}</p>
              <p className="text-xs text-muted-foreground">с грантами</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Calculator className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {minEntScore ? `${minEntScore}-${maxEntScore}` : '-'}
              </p>
              <p className="text-xs text-muted-foreground">баллы ЕНТ</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {minTuition ? `от ${(minTuition / 1000000).toFixed(1)}М` : '-'}
              </p>
              <p className="text-xs text-muted-foreground">тг/год</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Degree Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Уровни образования
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {degreeStats.bachelor && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Бакалавриат ({degreeStats.bachelor})
              </Badge>
            )}
            {degreeStats.master && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Магистратура ({degreeStats.master})
              </Badge>
            )}
            {degreeStats.doctorate && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Докторантура ({degreeStats.doctorate})
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Возможности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {university.has_grants && (
              <Badge className="bg-accent/10 text-accent border-accent/20">
                Государственные гранты
              </Badge>
            )}
            {university.has_dormitory && (
              <Badge variant="outline">Общежитие</Badge>
            )}
            {university.has_military_department && (
              <Badge variant="outline">Военная кафедра</Badge>
            )}
            {university.accreditation && (
              <Badge variant="outline">{university.accreditation}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact for Admissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Приёмная комиссия
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {university.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${university.email}`} className="text-sm hover:text-primary">
                {university.email}
              </a>
            </div>
          )}
          {university.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${university.phone}`} className="text-sm hover:text-primary">
                {university.phone}
              </a>
            </div>
          )}
          {university.website && (
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a 
                href={university.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm hover:text-primary"
              >
                Официальный сайт
              </a>
            </div>
          )}
          {!university.email && !university.phone && !university.website && (
            <p className="text-sm text-muted-foreground">
              Контактная информация не указана
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
