import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import { UniversityCard } from '@/components/universities/UniversityCard';
import { CompareBar } from '@/components/compare/CompareBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';
import { universities, regions, fieldsOfStudy } from '@/data/mockData';

export default function Universities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const { compareList } = useCompare();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    searchParams.get('field') ? [searchParams.get('field')!] : []
  );
  const [hasGrants, setHasGrants] = useState(false);
  const [sortBy, setSortBy] = useState<string>('ranking');

  const types = [
    { id: 'national', label: t('filters.types.national') },
    { id: 'state', label: t('filters.types.state') },
    { id: 'private', label: t('filters.types.private') },
    { id: 'international', label: t('filters.types.international') },
  ];

  const filteredUniversities = useMemo(() => {
    let result = [...universities];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.name_ru.toLowerCase().includes(query) ||
        u.name_en.toLowerCase().includes(query) ||
        u.name_kz.toLowerCase().includes(query) ||
        u.city.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (selectedTypes.length > 0) {
      result = result.filter(u => selectedTypes.includes(u.type));
    }

    // Region filter
    if (selectedRegion && selectedRegion !== 'all') {
      result = result.filter(u => u.region === selectedRegion || u.city === selectedRegion);
    }

    // Fields filter
    if (selectedFields.length > 0) {
      result = result.filter(u => 
        selectedFields.some(f => u.fields.includes(f))
      );
    }

    // Grants filter
    if (hasGrants) {
      result = result.filter(u => u.has_grants);
    }

    // Sort
    switch (sortBy) {
      case 'ranking':
        result.sort((a, b) => a.ranking_national - b.ranking_national);
        break;
      case 'name':
        result.sort((a, b) => a.name_ru.localeCompare(b.name_ru));
        break;
      case 'students':
        result.sort((a, b) => b.students_count - a.students_count);
        break;
      case 'programs':
        result.sort((a, b) => b.programs_count - a.programs_count);
        break;
    }

    return result;
  }, [searchQuery, selectedTypes, selectedRegion, selectedFields, hasGrants, sortBy]);

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
    setSelectedTypes([]);
    setSelectedRegion('');
    setSelectedFields([]);
    setHasGrants(false);
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedTypes.length > 0 || (selectedRegion && selectedRegion !== 'all') || selectedFields.length > 0 || hasGrants;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="mb-2 block">{t('common.search')}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('hero.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Type */}
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

      {/* Region */}
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

      {/* Fields */}
      <div>
        <Label className="mb-3 block">{t('filters.field')}</Label>
        <div className="space-y-2">
          {fieldsOfStudy.map((field) => (
            <div key={field.id} className="flex items-center space-x-2">
              <Checkbox
                id={`field-${field.id}`}
                checked={selectedFields.includes(field.id)}
                onCheckedChange={() => toggleField(field.id)}
              />
              <Label htmlFor={`field-${field.id}`} className="text-sm font-normal cursor-pointer">
                {field.icon} {t(`fields.${field.id}`)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Grants */}
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

      {/* Clear */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          {t('common.reset')}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
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
          {/* Desktop Sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-display font-semibold">{t('common.filter')}</h2>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between gap-4">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t('common.filter')}
                    {hasActiveFilters && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        !
                      </span>
                    )}
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

              {/* Active Filters Tags */}
              <div className="hidden flex-1 flex-wrap gap-2 lg:flex">
                {selectedFields.map(f => (
                  <Button
                    key={f}
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleField(f)}
                    className="gap-1"
                  >
                    {t(`fields.${f}`)}
                    <X className="h-3 w-3" />
                  </Button>
                ))}
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ranking">По рейтингу</SelectItem>
                  <SelectItem value="name">По названию</SelectItem>
                  <SelectItem value="students">По студентам</SelectItem>
                  <SelectItem value="programs">По программам</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grid */}
            {filteredUniversities.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredUniversities.map((uni) => (
                  <UniversityCard key={uni.id} university={uni} />
                ))}
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

      {/* Compare Bar */}
      {compareList.length > 0 && <CompareBar />}
    </div>
  );
}
