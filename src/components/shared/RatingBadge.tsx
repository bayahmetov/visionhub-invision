import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingBadgeProps {
  rating: number;
  reviewsCount?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
  className?: string;
}

export function RatingBadge({ 
  rating, 
  reviewsCount = 0, 
  size = 'sm', 
  showCount = true,
  className 
}: RatingBadgeProps) {
  if (rating === 0 && reviewsCount === 0) {
    return null;
  }

  return (
    <div className={cn(
      'flex items-center gap-1 text-muted-foreground',
      size === 'sm' ? 'text-xs' : 'text-sm',
      className
    )}>
      <Star className={cn(
        'fill-accent text-accent',
        size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
      )} />
      <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
      {showCount && reviewsCount > 0 && (
        <span>({reviewsCount})</span>
      )}
    </div>
  );
}
