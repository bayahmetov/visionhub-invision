import { Link } from 'react-router-dom';
import { MapPin, Users, BookOpen, Trophy, Scale, ExternalLink, Star, GraduationCap, Calendar, Award, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';
import { Tables } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUniversityRating } from '@/hooks/useUniversityRating';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type University = Tables<'universities'>;

interface UniversityCardProps {
  university: University;
  className?: string;
}

export function UniversityCard({ university, className }: UniversityCardProps) {
  const { t, getLocalizedField } = useLanguage();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  const { data: ratingData } = useUniversityRating(university.id);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const inCompare = isInCompare(university.id);

  // Check if university is in favorites
  const { data: isFavorite } = useQuery({
    queryKey: ['favorite', university.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('university_id', university.id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!user,
  });

  // Toggle favorite mutation
  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('university_id', university.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ university_id: university.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', university.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(isFavorite ? 'Убрано из избранного' : 'Добавлено в избранное');
    },
    onError: () => {
      toast.error('Ошибка при обновлении избранного');
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Войдите, чтобы добавить в избранное');
      return;
    }
    
    toggleFavorite.mutate();
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inCompare) {
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

  const typeLabels: Record<string, string> = {
    national: t('filters.types.national'),
    state: t('filters.types.state'),
    private: t('filters.types.private'),
    international: t('filters.types.international'),
  };

  const formatNumber = (num: number | null) => {
    if (!num) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <Card className={cn(
      'group overflow-hidden transition-all duration-300 rounded-2xl',
      'hover:shadow-xl hover:-translate-y-1',
      'border border-border/60 bg-card',
      className
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

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={cn(
            'absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full transition-all',
            'bg-background/80 backdrop-blur-sm hover:bg-background',
            isFavorite && 'text-red-500'
          )}
        >
          <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
        </button>

        {/* Rating Badge */}
        {ratingData && ratingData.reviewsCount > 0 && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span>{ratingData.averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({ratingData.reviewsCount})</span>
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
              {university.teachers_count || '-'}
            </div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Педагогов</div>
          </div>
          <div className="py-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-base font-bold text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {university.founded_year || '-'}
            </div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Год</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant={inCompare ? 'default' : 'outline'}
            size="sm"
            className="flex-1 gap-1"
            onClick={handleCompare}
          >
            <Scale className="h-3.5 w-3.5" />
            {inCompare ? 'В сравнении' : t('common.compare')}
          </Button>
          <Button asChild size="sm" className="flex-1 gap-1">
            <Link to={`/universities/${university.id}`}>
              {t('common.viewMore')}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
