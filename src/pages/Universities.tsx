import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Users, Scale, ExternalLink, Loader2, GraduationCap, Calendar, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CompareBar } from '@/components/compare/CompareBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useUniversitiesRatings } from '@/hooks/useUniversityRating';

type University = Tables<'universities'>;

const regions = [
  'Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 
  'Павлодар', 'Семей', 'Атырау', 'Костанай', 'Тараз'
];

export default function Universities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, getLocalizedField } = useLanguage();
  const { compareList, addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  
  const initialField = searchParams.get('field');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>(searchParams.get('city') || '');
  const [selectedFields, setSelectedFields] = useState<string[]>(initialField ? [initialField] : []);
  const [hasGrants, setHasGrants] = useState(false);
  const [minRating, setMinRating] = useState<string>('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchQuery]);
  const [sortBy, setSortBy] = useState<string>('ranking');

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['universities-page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('ranking_national', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch program counts for each university
  const { data: programCounts = {} } = useQuery({
    queryKey: ['university-program-counts'],
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

  // Fetch fields of study
  const { data: fieldsOfStudy = [] } = useQuery({
    queryKey: ['fields-of-study'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fields_of_study')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Fetch university fields from junction table
  const { data: universityFields = {} } = useQuery({
    queryKey: ['university-fields'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('university_fields')
        .select('university_id, field_id');
      if (error) throw error;
      
      const result: Record<string, string[]> = {};
      data.forEach(uf => {
        if (!result[uf.university_id]) {
          result[uf.university_id] = [];
        }
        result[uf.university_id].push(uf.field_id);
      });
      return result;
    },
  });

  // Fetch ratings for all universities
  const universityIds = useMemo(() => universities.map(u => u.id), [universities]);
  const { data: ratingsData = {} } = useUniversitiesRatings(universityIds);

  const types = [
    { id: 'national', label: t('filters.types.national') },
    { id: 'state', label: t('filters.types.state') },
    { id: 'private', label: t('filters.types.private') },
    { id: 'international', label: t('filters.types.international') },
  ];

  const filteredUniversities = useMemo(() => {
    let result = [...universities];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.name_ru.toLowerCase().includes(query) ||
        u.name_en?.toLowerCase().includes(query) ||
        u.name_kz?.toLowerCase().includes(query) ||
        u.city.toLowerCase().includes(query)
      );
    }

    if (selectedTypes.length > 0) {
      result = result.filter(u => selectedTypes.includes(u.type));
    }

    if (selectedRegion && selectedRegion !== 'all') {
      result = result.filter(u => u.region === selectedRegion || u.city === selectedRegion);
    }

    if (hasGrants) {
      result = result.filter(u => u.has_grants);
    }

    // Filter by selected fields
    if (selectedFields.length > 0) {
      result = result.filter(u => {
        const uniFieldIds = universityFields[u.id] || [];
        return selectedFields.some(fieldId => uniFieldIds.includes(fieldId));
      });
    }

    // Filter by minimum rating
    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      result = result.filter(u => {
        const rating = ratingsData[u.id];
        return rating && rating.averageRating >= minRatingNum;
      });
    }

    switch (sortBy) {
      case 'ranking':
        result.sort((a, b) => (a.ranking_national || 999) - (b.ranking_national || 999));
        break;
      case 'name':
        result.sort((a, b) => a.name_ru.localeCompare(b.name_ru));
        break;
      case 'students':
        result.sort((a, b) => (b.students_count || 0) - (a.students_count || 0));
        break;
    }

    return result;
  }, [universities, searchQuery, selectedTypes, selectedRegion, hasGrants, selectedFields, universityFields, sortBy, minRating, ratingsData]);

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocalSearchQuery('');
    setSelectedTypes([]);
    setSelectedRegion('');
    setSelectedFields([]);
    setHasGrants(false);
    setMinRating('');
    setSearchParams({});
  };

  const handleCompare = (university: University, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInCompare(university.id)) {
      removeFromCompare(university.id);
      toast.info('Убрано из сравнения');
    } else {
      if (canAddMore) {
        addToCompare(university.id);
        toast.success('Добавлено к сравнению');
      } else {
        toast.error(t('compare.maxReached'));
      }
    }
  };

  const formatNumber = (num: number | null) => {
    if (!num) return '-';
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const hasActiveFilters = searchQuery || selectedTypes.length > 0 || (selectedRegion && selectedRegion !== 'all') || selectedFields.length > 0 || hasGrants || minRating;

  const typeLabels: Record<string, string> = {
    national: t('filters.types.national'),
    state: t('filters.types.state'),
    private: t('filters.types.private'),
    international: t('filters.types.international'),
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block">{t('common.search')}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('hero.searchPlaceholder')}
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <Label className="mb-3 block">{t('filters.type')}</Label>
        <div className="space-y-2">
          {types.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={type.id}
                checked={selectedTypes.includes(type.id)}
                onCheckedChange={() => toggleType(type.id)}
              />
              <Label htmlFor={type.id} className="text-sm font-normal cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">{t('filters.region')}</Label>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger>
            <SelectValue placeholder="Все регионы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все регионы</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="grants"
          checked={hasGrants}
          onCheckedChange={(checked) => setHasGrants(checked as boolean)}
        />
        <Label htmlFor="grants" className="text-sm font-normal cursor-pointer">
          {t('filters.hasGrants')}
        </Label>
      </div>

      <div>
        <Label className="mb-2 block">Минимальный рейтинг</Label>
        <Select value={minRating} onValueChange={setMinRating}>
          <SelectTrigger>
            <SelectValue placeholder="Любой рейтинг" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Любой рейтинг</SelectItem>
            <SelectItem value="3">⭐ 3.0 и выше</SelectItem>
            <SelectItem value="3.5">⭐ 3.5 и выше</SelectItem>
            <SelectItem value="4">⭐ 4.0 и выше</SelectItem>
            <SelectItem value="4.5">⭐ 4.5 и выше</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {fieldsOfStudy.length > 0 && (
        <div>
          <Label className="mb-3 block">Направления</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {fieldsOfStudy.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`field-${field.id}`}
                  checked={selectedFields.includes(field.id)}
                  onCheckedChange={() => toggleField(field.id)}
                />
                <Label htmlFor={`field-${field.id}`} className="text-sm font-normal cursor-pointer">
                  {getLocalizedField(field, 'name')}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          {t('common.reset')}
        </Button>
      )}
    </div>
  );

  const getRating = (universityId: string) => ratingsData[universityId];

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b border-border bg-card">
        <div className="container py-8">
          <h1 className="mb-2 font-display text-3xl font-bold">
            {t('nav.universities')}
          </h1>
          <p className="text-muted-foreground">
            Найдено: {filteredUniversities.length} {t('common.universities')}
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-display font-semibold">{t('common.filter')}</h2>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t('common.filter')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>{t('common.filter')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex-1" />

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ranking">По рейтингу</SelectItem>
                  <SelectItem value="name">По названию</SelectItem>
                  <SelectItem value="students">По студентам</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUniversities.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredUniversities.map((university) => {
                  const inCompare = isInCompare(university.id);
                  const programCount = programCounts[university.id] || 0;
                  const uniFieldIds = universityFields[university.id] || [];
                  const uniFields = fieldsOfStudy.filter(f => uniFieldIds.includes(f.id)).slice(0, 3);
                  const extraFieldsCount = Math.max(0, uniFieldIds.length - 3);
                  
                  return (
                    <Card key={university.id} className={cn(
                      'group overflow-hidden transition-all duration-300 rounded-2xl',
                      'hover:shadow-xl hover:-translate-y-1',
                      'border border-border/60 bg-card'
                    )}>
                      {/* Cover Image */}
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={university.cover_image_url || '/placeholder.svg'}
                          alt={getLocalizedField(university, 'name')}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Type Badge */}
                        <Badge className="absolute right-3 top-3 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                          {typeLabels[university.type]}
                        </Badge>

                        {/* Rating Badge */}
                        {getRating(university.id)?.reviewsCount > 0 && (
                          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                            <span>{getRating(university.id)?.averageRating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({getRating(university.id)?.reviewsCount})</span>
                          </div>
                        )}
                      </div>

                      {/* Logo - positioned outside cover container */}
                      <div className="relative">
                        <div className="absolute -top-8 left-4 z-10">
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-background bg-card p-2 shadow-lg">
                            <img
                              src={university.logo_url || ''}
                              alt=""
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name_en || university.name_ru)}&background=0A9EB7&color=fff&size=64`;
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="px-4 pt-10 pb-4">
                        <h3 className="mb-2 font-display text-lg font-bold leading-tight line-clamp-2 min-h-[3.5rem]">
                          {getLocalizedField(university, 'name')}
                        </h3>

                        {/* Location & Ranking */}
                        <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {university.city}
                          </span>
                          {university.ranking_national && (
                            <span className="flex items-center gap-1 text-accent font-medium">
                              <Award className="h-4 w-4" />
                              #{university.ranking_national} В Казахстане
                            </span>
                          )}
                        </div>

                        {/* Stats Row */}
                        <div className="mb-4 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-background">
                          <div className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-base font-bold text-foreground">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {formatNumber(university.students_count)}
                            </div>
                            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Студентов</div>
                          </div>
                          <div className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-base font-bold text-foreground">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              {programCount}
                            </div>
                            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Программ</div>
                          </div>
                          <div className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-base font-bold text-foreground">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {university.founded_year || '-'}
                            </div>
                            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Год основания</div>
                          </div>
                        </div>

                        {/* Field Tags */}
                        {uniFields.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {uniFields.map(field => (
                              <Badge 
                                key={field.id} 
                                variant="outline" 
                                className="rounded-full text-xs font-normal px-3 py-1"
                              >
                                {getLocalizedField(field, 'name')}
                              </Badge>
                            ))}
                            {extraFieldsCount > 0 && (
                              <Badge variant="outline" className="rounded-full text-xs font-normal px-3 py-1">
                                +{extraFieldsCount}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Button
                            variant={inCompare ? 'default' : 'outline'}
                            className={cn(
                              "flex-1 gap-2 rounded-lg h-10",
                              !inCompare && "hover:bg-muted"
                            )}
                            onClick={(e) => handleCompare(university, e)}
                          >
                            <Scale className="h-4 w-4" />
                            {inCompare ? 'В сравнении' : t('common.compare')}
                          </Button>
                          <Button 
                            asChild 
                            className="flex-1 gap-2 rounded-lg h-10 bg-primary hover:bg-primary/90"
                          >
                            <Link to={`/universities/${university.id}`}>
                              {t('common.viewMore')}
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">{t('common.noResults')}</p>
                <Button variant="link" onClick={clearFilters}>
                  {t('common.reset')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {compareList.length > 0 && <CompareBar />}
    </div>
  );
}
