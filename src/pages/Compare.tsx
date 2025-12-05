import { useSearchParams, Link } from 'react-router-dom';
import { Plus, X, Trophy, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Compare() {
  const [searchParams] = useSearchParams();
  const { t, getLocalizedField } = useLanguage();
  const { compareList, addToCompare, removeFromCompare, clearCompare, canAddMore } = useCompare();

  const idsFromUrl = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const activeIds = idsFromUrl.length > 0 ? idsFromUrl : compareList;

  // Fetch all universities for selection
  const { data: allUniversities = [], isLoading } = useQuery({
    queryKey: ['universities-compare'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('name_ru');
      if (error) throw error;
      return data;
    },
  });

  // Fetch programs count for each university
  const { data: programCounts = {} } = useQuery({
    queryKey: ['programs-count-by-university'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('university_id');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(p => {
        counts[p.university_id] = (counts[p.university_id] || 0) + 1;
      });
      return counts;
    },
  });

  const selectedUniversities = allUniversities.filter(u => activeIds.includes(u.id));
  const availableUniversities = allUniversities.filter(u => !activeIds.includes(u.id));

  const formatNumber = (num: number | null) => {
    if (num === null) return '—';
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const formatCurrency = (num: number | null) => {
    if (num === null) return '—';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(num);
  };

  type University = typeof allUniversities[0];

  const comparisonRows = [
    {
      category: 'Основная информация',
      rows: [
        { label: 'Тип', getValue: (u: University) => t(`filters.types.${u.type}`) },
        { label: 'Год основания', getValue: (u: University) => u.founded_year?.toString() || '—' },
        { label: 'Город', getValue: (u: University) => u.city },
        { label: 'Рейтинг КZ', getValue: (u: University) => u.ranking_national ? `#${u.ranking_national}` : '—', highlight: true },
      ],
    },
    {
      category: 'Статистика',
      rows: [
        { label: 'Студентов', getValue: (u: University) => formatNumber(u.students_count) },
        { label: 'Преподавателей', getValue: (u: University) => formatNumber(u.teachers_count) },
        { label: 'Программ', getValue: (u: University) => (programCounts[u.id] || 0).toString() },
      ],
    },
    {
      category: 'Возможности',
      rows: [
        { label: 'Общежитие', getValue: (u: University) => u.has_dormitory, isBoolean: true },
        { label: 'Гранты', getValue: (u: University) => u.has_grants, isBoolean: true },
        { label: 'Военная кафедра', getValue: (u: University) => u.has_military_department, isBoolean: true },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b border-border bg-card">
        <div className="container py-8">
          <h1 className="mb-2 font-display text-3xl font-bold">{t('compare.title')}</h1>
          <p className="text-muted-foreground">Сравните до 4 университетов</p>
        </div>
      </div>

      <div className="container py-8">
        {selectedUniversities.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2 className="mb-2 font-display text-xl font-semibold">{t('compare.noSelection')}</h2>
            <Button asChild><Link to="/universities">Перейти к ВУЗам</Link></Button>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Headers */}
              <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `180px repeat(${selectedUniversities.length}, 1fr)` }}>
                <div>
                  {canAddMore && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Добавить</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Добавить ВУЗ</DialogTitle>
                          <DialogDescription>Выберите университет для сравнения</DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[400px] overflow-y-auto space-y-2">
                          {availableUniversities.map((uni) => (
                            <button key={uni.id} onClick={() => addToCompare(uni.id)} className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted text-left">
                              <span className="font-medium truncate">{getLocalizedField(uni, 'name')}</span>
                            </button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                {selectedUniversities.map((uni) => (
                  <Card key={uni.id} className="relative p-4 text-center">
                    <button onClick={() => removeFromCompare(uni.id)} className="absolute right-2 top-2 p-1 hover:bg-destructive/20 rounded">
                      <X className="h-4 w-4" />
                    </button>
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">{getLocalizedField(uni, 'name')}</h3>
                    <Button asChild variant="outline" size="sm"><Link to={`/universities/${uni.id}`}>Подробнее</Link></Button>
                  </Card>
                ))}
              </div>

              {/* Rows */}
              {comparisonRows.map((section, sIdx) => (
                <div key={sIdx} className="mb-4">
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">{section.category}</div>
                  <div className="rounded-lg border bg-card overflow-hidden">
                    {section.rows.map((row, rIdx) => (
                      <div key={rIdx} className={cn('grid gap-4 px-4 py-3', rIdx !== section.rows.length - 1 && 'border-b')} style={{ gridTemplateColumns: `180px repeat(${selectedUniversities.length}, 1fr)` }}>
                        <div className="text-sm text-muted-foreground">{row.label}</div>
                        {selectedUniversities.map((uni) => {
                          const value = row.getValue(uni);
                          return (
                            <div key={uni.id} className={cn('text-center text-sm font-medium', row.highlight && 'text-primary')}>
                              {row.isBoolean ? (value ? <CheckCircle className="h-5 w-5 mx-auto text-green-500" /> : <XCircle className="h-5 w-5 mx-auto text-muted-foreground/30" />) : String(value)}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-center pt-4"><Button variant="outline" onClick={clearCompare}>{t('compare.clear')}</Button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
