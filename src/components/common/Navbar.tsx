import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, Globe, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { languages } from '@/i18n/config';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { user, role, signOut, loading } = useAuth();
  const location = useLocation();

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/universities', label: t('nav.universities') },
    { href: '/programs', label: t('nav.programs') },
    { href: '/compare', label: t('nav.compare') },
    { href: '/about', label: t('nav.about') },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const currentLang = languages.find(l => l.code === language);

  const getRoleLabel = () => {
    switch (role) {
      case 'admin': return 'Админ';
      case 'university': return 'ВУЗ';
      default: return 'Студент';
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">
            DataHub <span className="text-primary">ВУЗов</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors rounded-md',
                isActive(link.href)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{currentLang?.flag} {currentLang?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    'cursor-pointer',
                    language === lang.code && 'bg-primary/10 text-primary'
                  )}
                >
                  {lang.flag} {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Button */}
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{getRoleLabel()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Личный кабинет
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Войти</Link>
              </Button>
            )
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-border md:hidden animate-slide-up">
          <div className="container py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-md text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-md text-sm font-medium text-primary bg-primary/10"
              >
                Личный кабинет
              </Link>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-md text-sm font-medium text-primary bg-primary/10"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
