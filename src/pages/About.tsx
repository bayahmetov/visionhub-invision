import { GraduationCap, Target, Users, Lightbulb, Award, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function About() {
  // Fetch real stats from Supabase
  const { data: stats } = useQuery({
    queryKey: ['about-stats'],
    queryFn: async () => {
      const [universitiesRes, programsRes, citiesRes] = await Promise.all([
        supabase.from('universities').select('students_count', { count: 'exact' }),
        supabase.from('programs').select('*', { count: 'exact', head: true }),
        supabase.from('cities').select('*', { count: 'exact', head: true }),
      ]);

      const totalStudents = universitiesRes.data?.reduce((sum, u) => sum + (u.students_count || 0), 0) || 0;

      return {
        universities: universitiesRes.count || 0,
        programs: programsRes.count || 0,
        students: totalStudents,
        cities: citiesRes.count || 0,
      };
    },
  });

  const features = [
    {
      icon: GraduationCap,
      title: 'Полный каталог ВУЗов',
      description: 'Информация о всех университетах Казахстана в одном месте',
    },
    {
      icon: Target,
      title: 'Умное сравнение',
      description: 'Сравнивайте до 4 университетов по десяткам параметров',
    },
    {
      icon: Users,
      title: 'AI-консультант',
      description: 'Персональные рекомендации на основе ваших предпочтений',
    },
    {
      icon: Globe,
      title: '3D-туры',
      description: 'Виртуальные экскурсии по кампусам без выхода из дома',
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${Math.round(num / 1000)}K+`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/95 to-primary-glow py-20">
        <div className="container text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/10">
            <GraduationCap className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="mb-4 font-display text-4xl font-bold text-primary-foreground md:text-5xl">
            О проекте DataHub
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
            Централизованная платформа для поиска, сравнения и получения информации 
            о высших учебных заведениях Республики Казахстан
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm text-accent-foreground">
              <Lightbulb className="h-4 w-4 text-accent" />
              Наша миссия
            </div>
            <h2 className="mb-6 font-display text-3xl font-bold">
              Помочь каждому абитуриенту найти свой идеальный университет
            </h2>
            <p className="text-lg text-muted-foreground">
              Мы верим, что правильный выбор университета — это первый шаг к успешной карьере. 
              DataHub объединяет всю необходимую информацию о ВУЗах Казахстана, чтобы сделать 
              этот выбор осознанным и простым.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="mb-10 text-center font-display text-3xl font-bold">
            Возможности платформы
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 font-display font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            {[
              { value: stats?.universities || 0, label: 'Университетов' },
              { value: stats?.programs || 0, label: 'Программ' },
              { value: stats?.students || 0, label: 'Студентов', format: true },
              { value: stats?.cities || 0, label: 'Городов' },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="font-display text-4xl font-bold text-primary mb-1">
                  {stat.format ? formatNumber(stat.value) : stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hackathon Info */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm">
              <Award className="h-4 w-4 text-primary" />
              Хакатон 2025
            </div>
            <h2 className="mb-4 font-display text-3xl font-bold">
              Проект создан в рамках хакатона
            </h2>
            <p className="text-muted-foreground mb-6">
              DataHub ВУЗов РК — это MVP-проект, разработанный командой энтузиастов 
              с целью улучшить доступ к информации о высшем образовании в Казахстане.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="rounded-lg bg-card px-4 py-2 text-sm">
                React + TypeScript
              </div>
              <div className="rounded-lg bg-card px-4 py-2 text-sm">
                Tailwind CSS
              </div>
              <div className="rounded-lg bg-card px-4 py-2 text-sm">
                AI Integration
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
