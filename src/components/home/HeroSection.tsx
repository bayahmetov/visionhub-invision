import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/universities?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const quickFilters = [
    { id: 'it', label: 'IT' },
    { id: 'medicine', label: 'Медицина' },
    { id: 'law', label: 'Право' },
    { id: 'economics', label: 'Экономика' },
    { id: 'engineering', label: 'Инженерия' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary-glow">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 h-20 w-20 rounded-full bg-accent/20 blur-2xl animate-pulse-soft" />
      <div className="absolute bottom-20 right-20 h-32 w-32 rounded-full bg-secondary/30 blur-3xl animate-pulse-soft [animation-delay:1s]" />

      <div className="container relative py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>DataHub ВУЗов Республики Казахстан</span>
          </div>

          {/* Title */}
          <h1 className="mb-6 font-display text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="mb-10 text-lg text-primary-foreground/80 md:text-xl">
            {t('hero.subtitle')}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mx-auto mb-12 max-w-2xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('hero.searchPlaceholder')}
                  className="h-14 rounded-xl border-0 bg-background pl-12 pr-4 text-base shadow-xl sm:rounded-r-none"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 rounded-xl bg-accent px-8 text-base font-semibold text-accent-foreground shadow-accent hover:bg-accent/90 sm:rounded-l-none"
              >
                {t('hero.cta')}
              </Button>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {quickFilters.map((field) => (
              <Button
                key={field.id}
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/universities?field=${field.id}`)}
                className="rounded-full border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                {field.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 50L60 45.8C120 41.7 240 33.3 360 37.5C480 41.7 600 58.3 720 62.5C840 66.7 960 58.3 1080 50C1200 41.7 1320 33.3 1380 29.2L1440 25V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
