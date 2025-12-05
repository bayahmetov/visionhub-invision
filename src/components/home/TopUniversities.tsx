import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UniversityCard } from '@/components/universities/UniversityCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { universities } from '@/data/mockData';

export function TopUniversities() {
  const { t } = useLanguage();
  
  // Get top 6 universities by national ranking
  const topUniversities = [...universities]
    .sort((a, b) => a.ranking_national - b.ranking_national)
    .slice(0, 6);

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Section Header */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="mb-2 font-display text-3xl font-bold md:text-4xl">
              {t('home.topUniversities')}
            </h2>
            <p className="text-muted-foreground">
              {t('home.topUniversitiesDesc')}
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/universities">
              {t('common.showAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Universities Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topUniversities.map((uni) => (
            <UniversityCard key={uni.id} university={uni} />
          ))}
        </div>
      </div>
    </section>
  );
}
