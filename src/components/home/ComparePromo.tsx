import { Link } from 'react-router-dom';
import { Scale, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function ComparePromo() {
  const { t } = useLanguage();

  const features = [
    'Сравнение до 4 университетов одновременно',
    'Рейтинги, стоимость, программы',
    'Инфраструктура и партнёрства',
    'Экспорт результатов',
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <Scale className="h-4 w-4" />
              <span>Функция сравнения</span>
            </div>
            
            <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
              {t('home.compareTitle')}
            </h2>
            
            <p className="mb-8 text-lg text-muted-foreground">
              {t('home.compareDesc')}
            </p>

            <ul className="mb-8 space-y-3">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button asChild size="lg" className="gap-2">
              <Link to="/compare">
                Начать сравнение
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
              {/* Mock Compare Table */}
              <div className="mb-4 grid grid-cols-3 gap-4 text-center">
                {['КазНУ', 'НУ', 'КБТУ'].map((name, idx) => (
                  <div key={idx} className="rounded-lg bg-muted p-4">
                    <div className="mb-2 h-12 w-12 mx-auto rounded-lg bg-primary/20" />
                    <div className="font-semibold text-sm">{name}</div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                {[
                  { label: 'Рейтинг КZ', values: ['#1', '#2', '#3'] },
                  { label: 'Студентов', values: ['25K', '8K', '5K'] },
                  { label: 'Программ', values: ['150', '60', '45'] },
                ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-muted-foreground">{row.label}</div>
                    {row.values.map((val, i) => (
                      <div key={i} className="text-center font-medium">{val}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
