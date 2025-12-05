import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span>
                DataHub <span className="text-primary">ВУЗов</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-display font-semibold">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/universities" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.universities')}
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.programs')}
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.compare')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="mb-4 font-display font-semibold">{t('footer.contacts')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Астана, Казахстан
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                info@datahub.kz
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                +7 (7172) 00-00-00
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div>
            <h3 className="mb-4 font-display font-semibold">DataHub</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <div className="text-2xl font-bold text-primary">130+</div>
                <div className="text-xs text-muted-foreground">ВУЗов</div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <div className="text-2xl font-bold text-primary">2500+</div>
                <div className="text-xs text-muted-foreground">Программ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
}
