import { Link } from 'react-router-dom';
import { MapPin, Users, BookOpen, Trophy, Heart, Scale, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';
import { University } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UniversityCardProps {
  university: University;
  className?: string;
}

export function UniversityCard({ university, className }: UniversityCardProps) {
  const { t, getLocalizedField } = useLanguage();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();

  const inCompare = isInCompare(university.id);

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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <Card className={cn(
      'group overflow-hidden transition-all duration-300',
      'hover:shadow-lg hover:-translate-y-1',
      'border-border/50 bg-card',
      className
    )}>
      {/* Cover Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={university.cover_image_url}
          alt={getLocalizedField(university, 'name')}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Logo */}
        <div className="absolute bottom-0 left-4 translate-y-1/2">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-background bg-card p-2 shadow-md">
            <img
              src={university.logo_url}
              alt=""
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name_en)}&background=0A9EB7&color=fff&size=64`;
              }}
            />
          </div>
        </div>

        {/* Type Badge */}
        <Badge 
          className="absolute right-3 top-3 bg-primary/90 text-primary-foreground"
        >
          {typeLabels[university.type]}
        </Badge>
      </div>

      <CardContent className="pt-10 pb-4">
        {/* Title */}
        <h3 className="mb-2 font-display text-lg font-semibold leading-tight line-clamp-2">
          {getLocalizedField(university, 'name')}
        </h3>

        {/* Location & Ranking */}
        <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {university.city}
          </span>
          {university.ranking_national && (
            <span className="flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5 text-accent" />
              #{university.ranking_national} {t('university.nationalRanking')}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-2 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-sm font-semibold">
              <Users className="h-3.5 w-3.5 text-primary" />
              {formatNumber(university.students_count)}
            </div>
            <div className="text-[10px] text-muted-foreground">{t('common.students')}</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm font-semibold">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              {university.programs_count}
            </div>
            <div className="text-[10px] text-muted-foreground">{t('common.programs')}</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm font-semibold">
              <Trophy className="h-3.5 w-3.5 text-accent" />
              {university.founded_year}
            </div>
            <div className="text-[10px] text-muted-foreground">{t('university.founded')}</div>
          </div>
        </div>

        {/* Fields Tags */}
        <div className="mb-4 flex flex-wrap gap-1">
          {university.fields.slice(0, 3).map((field) => (
            <Badge key={field} variant="secondary" className="text-[10px]">
              {t(`fields.${field}`)}
            </Badge>
          ))}
          {university.fields.length > 3 && (
            <Badge variant="outline" className="text-[10px]">
              +{university.fields.length - 3}
            </Badge>
          )}
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
      </CardContent>
    </Card>
  );
}
