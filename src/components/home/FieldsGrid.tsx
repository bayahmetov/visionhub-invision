import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export function FieldsGrid() {
  const { t, getLocalizedField } = useLanguage();

  // Fetch fields of study from Supabase
  const { data: fieldsOfStudy = [], isLoading } = useQuery({
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

  // Fetch university counts per field
  const { data: fieldCounts = {} } = useQuery({
    queryKey: ['university-field-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('university_fields')
        .select('field_id');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(uf => {
        counts[uf.field_id] = (counts[uf.field_id] || 0) + 1;
      });
      return counts;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="mb-10 text-center">
            <Skeleton className="h-10 w-64 mx-auto mb-2" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (fieldsOfStudy.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <h2 className="mb-2 font-display text-3xl font-bold md:text-4xl">
            {t('home.popularFields')}
          </h2>
          <p className="text-muted-foreground">
            {t('home.popularFieldsDesc')}
          </p>
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {fieldsOfStudy.map((field) => {
            const count = fieldCounts[field.id] || 0;
            return (
              <Link
                key={field.id}
                to={`/universities?field=${field.id}`}
                className={cn(
                  'group relative overflow-hidden rounded-xl p-6 transition-all',
                  'bg-card border border-border/50 hover:border-primary/30',
                  'hover:shadow-lg hover:-translate-y-1'
                )}
              >
                {/* Icon */}
                <div className="mb-4 text-4xl">{field.icon || '📚'}</div>
                
                {/* Title */}
                <h3 className="mb-1 font-display font-semibold">
                  {getLocalizedField(field, 'name')}
                </h3>
                
                {/* Count */}
                <p className="text-sm text-muted-foreground">
                  {count} {t('common.universities')}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
