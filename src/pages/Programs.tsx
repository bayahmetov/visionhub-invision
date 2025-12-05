import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, DollarSign, Briefcase, GraduationCap } from 'lucide-react';
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
import { programs, universities, fieldsOfStudy } from '@/data/mockData';

export default function Programs() {
  const { t, getLocalizedField } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDegree, setSelectedDegree] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');

  const filteredPrograms = useMemo(() => {
    let result = [...programs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name_ru.toLowerCase().includes(query) ||
        p.name_en.toLowerCase().includes(query)
      );
    }

    if (selectedDegree) {
      result = result.filter(p => p.degree_level === selectedDegree);
    }

    if (selectedField) {
      result = result.filter(p => p.field_of_study === selectedField);
    }

    return result;
  }, [searchQuery, selectedDegree, selectedField]);

  const getUniversity = (universityId: string) => {
    return universities.find(u => u.id === universityId);
  };

  const formatCurrency = (num: number) => {
    if (num === 0) return 'Бесплатно (грант)';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(num);
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
              <SelectItem value="">Все уровни</SelectItem>
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
              <SelectItem value="">Все направления</SelectItem>
              {fieldsOfStudy.map(field => (
                <SelectItem key={field.id} value={field.id}>
                  {field.icon} {t(`fields.${field.id}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Programs List */}
        <div className="space-y-4">
          {filteredPrograms.map(program => {
            const university = getUniversity(program.university_id);
            return (
              <Card key={program.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* University Logo */}
                    {university && (
                      <Link to={`/universities/${university.id}`} className="shrink-0">
                        <div className="h-16 w-16 rounded-lg border border-border bg-background p-2">
                          <img
                            src={university.logo_url}
                            alt=""
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name_en)}&background=0A9EB7&color=fff&size=64`;
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
                        <Badge variant="outline">
                          {t(`fields.${program.field_of_study}`)}
                        </Badge>
                        {program.has_grant && (
                          <Badge className="bg-accent text-accent-foreground">Грант</Badge>
                        )}
                      </div>

                      <h3 className="font-display text-lg font-semibold mb-1">
                        {getLocalizedField(program, 'name')}
                      </h3>

                      {university && (
                        <Link 
                          to={`/universities/${university.id}`}
                          className="text-sm text-muted-foreground hover:text-primary mb-3 block"
                        >
                          {getLocalizedField(university, 'name')}
                        </Link>
                      )}

                      <p className="text-sm text-muted-foreground mb-4">
                        {getLocalizedField(program, 'description')}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          {program.duration_years} {t('common.years')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-primary" />
                          {formatCurrency(program.tuition_fee)}/год
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-accent" />
                          {program.employment_rate}% трудоустройство
                        </span>
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          {program.credits} кредитов
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <Button asChild variant="outline" className="shrink-0">
                      <Link to={`/universities/${program.university_id}`}>
                        Подробнее
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredPrograms.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">{t('common.noResults')}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
