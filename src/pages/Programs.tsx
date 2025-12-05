import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, DollarSign, Briefcase, GraduationCap, Scale, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useComparePrograms } from '@/contexts/CompareProgramsContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useUniversitiesRatings } from '@/hooks/useUniversityRating';

type Program = Tables<'programs'>;
type University = Tables<'universities'>;
type FieldOfStudy = Tables<'fields_of_study'>;

export default function Programs() {
  const { t, getLocalizedField } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDegree, setSelectedDegree] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');
  const { compareList, addToCompare, removeFromCompare, isInCompare, canAddMore } = useComparePrograms();

  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ['programs-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('name_ru');
      if (error) throw error;
      return data;
    },
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-list-full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: fieldsOfStudy = [] } = useQuery({
    queryKey: ['fields-of-study'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fields_of_study')
        .select('*')
        .order('name_ru');
      if (error) throw error;
      return data;
    },
  });

  const universityIds = useMemo(() => universities.map(u => u.id), [universities]);
  const { data: ratingsMap = {} } = useUniversitiesRatings(universityIds);

  const filteredPrograms = useMemo(() => {
    let result = [...programs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name_ru.toLowerCase().includes(query) ||
        p.name_en?.toLowerCase().includes(query)
      );
    }

    if (selectedDegree && selectedDegree !== 'all') {
      result = result.filter(p => p.degree_level === selectedDegree);
    }

    if (selectedField && selectedField !== 'all') {
      result = result.filter(p => p.field_id === selectedField);
    }

    return result;
  }, [programs, searchQuery, selectedDegree, selectedField]);

  const getUniversity = (universityId: string): University | undefined => {
    return universities.find(u => u.id === universityId);
  };

  const getField = (fieldId: string | null): FieldOfStudy | undefined => {
    if (!fieldId) return undefined;
    return fieldsOfStudy.find(f => f.id === fieldId);
  };

  const formatCurrency = (num: number | null) => {
    if (!num || num === 0) return 'Бесплатно (грант)';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleCompare = (programId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInCompare(programId)) {
      removeFromCompare(programId);
      toast.info('Убрано из сравнения');
    } else {
      if (canAddMore) {
        addToCompare(programId);
        toast.success('Добавлено к сравнению');
      } else {
        toast.error('Максимум 4 программы');
      }
    }
  };

  const goToCompare = () => {
    navigate('/compare-programs');
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-8">
          <h1 className="mb-2 font-display text-3xl font-bold">
            {t('nav.programs')}
          </h1>
          <p className="text-muted-foreground">
            Найдено: {filteredPrograms.length} {t('common.programs')}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск программы..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={selectedDegree} onValueChange={setSelectedDegree}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Уровень" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все уровни</SelectItem>
              <SelectItem value="bachelor">{t('filters.degrees.bachelor')}</SelectItem>
              <SelectItem value="master">{t('filters.degrees.master')}</SelectItem>
              <SelectItem value="doctorate">{t('filters.degrees.doctorate')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedField} onValueChange={setSelectedField}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Направление" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все направления</SelectItem>
              {fieldsOfStudy.map(field => (
                <SelectItem key={field.id} value={field.id}>
                  {field.icon} {getLocalizedField(field, 'name')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Programs List */}
        <div className="space-y-4">
          {programsLoading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </Card>
          ) : filteredPrograms.length > 0 ? (
            filteredPrograms.map(program => {
              const university = getUniversity(program.university_id);
              const field = getField(program.field_id);
              const inCompare = isInCompare(program.id);
              const universityRating = university ? ratingsMap[university.id] : null;
              
              return (
                <Card key={program.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* University Logo */}
                      {university && (
                        <Link to={`/universities/${university.id}`} className="shrink-0">
                          <div className="h-16 w-16 rounded-lg border border-border bg-background p-2">
                            <img
                              src={university.logo_url || ''}
                              alt=""
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name_en || university.name_ru)}&background=0A9EB7&color=fff&size=64`;
                              }}
                            />
                          </div>
                        </Link>
                      )}

                      {/* Program Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            {t(`filters.degrees.${program.degree_level}`)}
                          </Badge>
                          {field && (
                            <Badge variant="outline">
                              {field.icon} {getLocalizedField(field, 'name')}
                            </Badge>
                          )}
                          {program.grants_available && (
                            <Badge className="bg-accent text-accent-foreground">Грант</Badge>
                          )}
                        </div>

                        <h3 className="font-display text-lg font-semibold mb-1">
                          {getLocalizedField(program, 'name')}
                        </h3>

                        {university && (
                          <div className="flex items-center gap-3 mb-3">
                            <Link 
                              to={`/universities/${university.id}`}
                              className="text-sm text-muted-foreground hover:text-primary"
                            >
                              {getLocalizedField(university, 'name')}
                            </Link>
                            {universityRating && universityRating.reviewsCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                                <span className="font-medium text-foreground">
                                  {universityRating.averageRating.toFixed(1)}
                                </span>
                                <span>({universityRating.reviewsCount})</span>
                              </div>
                            )}
                          </div>
                        )}

                        {program.description_ru && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {getLocalizedField(program, 'description')}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-primary" />
                            {program.duration_years} {t('common.years')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4 text-primary" />
                            {formatCurrency(program.tuition_fee_kzt)}/год
                          </span>
                          {program.employment_rate && (
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="h-4 w-4 text-accent" />
                              {program.employment_rate}% трудоустройство
                            </span>
                          )}
                          {program.ent_min_score && (
                            <span className="flex items-center gap-1.5">
                              <GraduationCap className="h-4 w-4 text-primary" />
                              от {program.ent_min_score} ЕНТ
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant={inCompare ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => handleCompare(program.id, e)}
                        >
                          <Scale className="h-4 w-4 mr-1" />
                          {inCompare ? 'В сравнении' : 'Сравнить'}
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/universities/${program.university_id}`}>
                            Подробнее
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">{t('common.noResults')}</p>
            </Card>
          )}
        </div>

        {/* Compare Bar */}
        {compareList.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <Card className="shadow-lg border-primary/20">
              <CardContent className="flex items-center gap-4 py-3 px-4">
                <span className="text-sm font-medium">
                  Выбрано программ: {compareList.length}/4
                </span>
                <Button size="sm" onClick={goToCompare}>
                  <Scale className="h-4 w-4 mr-1" />
                  Сравнить
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
