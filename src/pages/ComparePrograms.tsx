import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { X, Plus, Check, Calendar, DollarSign, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useComparePrograms } from '@/contexts/CompareProgramsContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useState } from 'react';

type Program = Tables<'programs'>;
type University = Tables<'universities'>;

export default function ComparePrograms() {
  const { t, getLocalizedField } = useLanguage();
  const [searchParams] = useSearchParams();
  const { compareList, removeFromCompare, clearCompare, addToCompare, canAddMore } = useComparePrograms();
  const [searchQuery, setSearchQuery] = useState('');

  const urlIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const programIds = urlIds.length > 0 ? urlIds : compareList;

  const { data: programs = [] } = useQuery({
    queryKey: ['programs-compare', programIds],
    queryFn: async () => {
      if (programIds.length === 0) return [];
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .in('id', programIds);
      if (error) throw error;
      return data;
    },
    enabled: programIds.length > 0,
  });

  const universityIds = useMemo(() => [...new Set(programs.map(p => p.university_id))], [programs]);

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-for-programs', universityIds],
    queryFn: async () => {
      if (universityIds.length === 0) return [];
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .in('id', universityIds);
      if (error) throw error;
      return data;
    },
    enabled: universityIds.length > 0,
  });

  const { data: allPrograms = [] } = useQuery({
    queryKey: ['all-programs-for-dialog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('name_ru');
      if (error) throw error;
      return data;
    },
  });

  const getUniversity = (universityId: string): University | undefined => {
    return universities.find(u => u.id === universityId);
  };

  const filteredPrograms = useMemo(() => {
    if (!searchQuery) return allPrograms.filter(p => !programIds.includes(p.id));
    const query = searchQuery.toLowerCase();
    return allPrograms.filter(p => 
      !programIds.includes(p.id) &&
      (p.name_ru.toLowerCase().includes(query) ||
       p.name_en?.toLowerCase().includes(query))
    );
  }, [allPrograms, searchQuery, programIds]);

  const formatCurrency = (num: number | null) => {
    if (!num || num === 0) return 'Грант';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const comparisonRows = [
    { label: 'Университет', getValue: (p: Program) => getUniversity(p.university_id)?.name_ru || '-' },
    { label: 'Уровень', getValue: (p: Program) => t(`filters.degrees.${p.degree_level}`) },
    { label: 'Длительность', getValue: (p: Program) => `${p.duration_years} ${t('common.years')}` },
    { label: 'Стоимость', getValue: (p: Program) => formatCurrency(p.tuition_fee_kzt) },
    { label: 'Мин. балл ЕНТ', getValue: (p: Program) => p.ent_min_score || '-' },
    { label: 'Трудоустройство', getValue: (p: Program) => p.employment_rate ? `${p.employment_rate}%` : '-' },
    { label: 'Грант', getValue: (p: Program) => p.grants_available },
    { label: 'Языки', getValue: (p: Program) => p.language?.join(', ') || '-' },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 font-display text-3xl font-bold">Сравнение программ</h1>
          <p className="text-muted-foreground">Сравните до 4 программ по всем параметрам</p>
        </div>

        {programIds.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Добавьте программы для сравнения</p>
            <Button asChild>
              <Link to="/programs">К программам</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Programs Header */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${programs.length}, 1fr)` }}>
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={clearCompare}>
                  Очистить
                </Button>
              </div>
              {programs.map(program => {
                const university = getUniversity(program.university_id);
                return (
                  <Card key={program.id} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6"
                      onClick={() => removeFromCompare(program.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CardContent className="pt-6 pb-4 text-center">
                      {university && (
                        <div className="mx-auto mb-3 h-12 w-12 rounded-lg border border-border bg-background p-1">
                          <img
                            src={university.logo_url || ''}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <Badge className="mb-2">{t(`filters.degrees.${program.degree_level}`)}</Badge>
                      <h3 className="font-semibold text-sm line-clamp-2">
                        {getLocalizedField(program, 'name')}
                      </h3>
                      {university && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {getLocalizedField(university, 'name')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {canAddMore && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="flex cursor-pointer items-center justify-center border-dashed hover:border-primary">
                      <CardContent className="flex flex-col items-center py-8">
                        <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Добавить</span>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Добавить программу</DialogTitle>
                    </DialogHeader>
                    <Input
                      placeholder="Поиск программы..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-4"
                    />
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {filteredPrograms.slice(0, 20).map(program => (
                        <div
                          key={program.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                          onClick={() => addToCompare(program.id)}
                        >
                          <div>
                            <p className="font-medium text-sm">{program.name_ru}</p>
                            <p className="text-xs text-muted-foreground">
                              {t(`filters.degrees.${program.degree_level}`)}
                            </p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Comparison Table */}
            <Card>
              <CardContent className="p-0">
                {comparisonRows.map((row, idx) => (
                  <div
                    key={row.label}
                    className={`grid gap-4 p-4 ${idx !== comparisonRows.length - 1 ? 'border-b border-border' : ''}`}
                    style={{ gridTemplateColumns: `200px repeat(${programs.length}, 1fr)` }}
                  >
                    <div className="font-medium text-muted-foreground">{row.label}</div>
                    {programs.map(program => {
                      const value = row.getValue(program);
                      return (
                        <div key={program.id} className="text-center">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <Check className="h-5 w-5 text-accent mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{value}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
