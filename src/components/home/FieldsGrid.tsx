import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { fieldsOfStudy, universities } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function FieldsGrid() {
  const { t } = useLanguage();

  const getFieldCount = (fieldId: string) => {
    return universities.filter(u => u.fields.includes(fieldId)).length;
  };

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
            const count = getFieldCount(field.id);
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
                <div className="mb-4 text-4xl">{field.icon}</div>
                
                {/* Title */}
                <h3 className="mb-1 font-display font-semibold">
                  {t(`fields.${field.id}`)}
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
