import { Link } from 'react-router-dom';
import { X, Scale, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/contexts/CompareContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { t, getLocalizedField } = useLanguage();

  // Fetch selected universities from Supabase
  const { data: selectedUniversities = [] } = useQuery({
    queryKey: ['compare-universities', compareList],
    queryFn: async () => {
      if (compareList.length === 0) return [];
      const { data, error } = await supabase
        .from('universities')
        .select('id, name_ru, name_kz, name_en, logo_url')
        .in('id', compareList);
      if (error) throw error;
      return data;
    },
    enabled: compareList.length > 0,
  });

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm shadow-lg animate-slide-in-bottom">
      <div className="container flex items-center justify-between gap-4 py-4">
        {/* Selected Universities */}
        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.compare')}:</span>
          </div>
          
          {selectedUniversities.map((uni) => (
            <div
              key={uni.id}
              className="flex shrink-0 items-center gap-2 rounded-full bg-secondary px-3 py-1.5"
            >
              <img
                src={uni.logo_url || ''}
                alt=""
                className="h-5 w-5 rounded-full object-contain bg-background"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(uni.name_en || uni.name_ru)}&background=0A9EB7&color=fff&size=20`;
                }}
              />
              <span className="text-sm font-medium max-w-[100px] truncate">
                {getLocalizedField(uni, 'name').split(' ')[0]}
              </span>
              <button
                onClick={() => removeFromCompare(uni.id)}
                className="rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Empty slots indicator */}
          {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
            <div
              key={idx}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border"
            >
              <span className="text-xs text-muted-foreground">+</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCompare}
            className="gap-1 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('compare.clear')}</span>
          </Button>
          
          <Button asChild size="sm" className="gap-2" disabled={compareList.length < 2}>
            <Link to={`/compare?ids=${compareList.join(',')}`}>
              <Scale className="h-4 w-4" />
              {t('common.compare')} ({compareList.length})
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
