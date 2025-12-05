import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pin, Megaphone, GraduationCap, Award, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Props {
  universityId: string;
}

const typeConfig = {
  news: { label: 'Новость', icon: Megaphone, color: 'bg-blue-500/10 text-blue-600' },
  admission: { label: 'Приём', icon: GraduationCap, color: 'bg-green-500/10 text-green-600' },
  scholarship: { label: 'Стипендия', icon: Award, color: 'bg-yellow-500/10 text-yellow-600' },
  event: { label: 'Мероприятие', icon: Calendar, color: 'bg-purple-500/10 text-purple-600' },
};

export function AnnouncementsSection({ universityId }: Props) {
  const { language } = useLanguage();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['university-announcements', universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('university_id', universityId)
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Загрузка...</div>;
  }

  if (!announcements?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Megaphone className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Нет объявлений</p>
      </div>
    );
  }

  const getLocalizedContent = (item: any, field: string) => {
    const langKey = `${field}_${language === 'kz' ? 'kz' : language === 'en' ? 'en' : 'ru'}`;
    return item[langKey] || item[`${field}_ru`];
  };

  return (
    <div className="space-y-4">
      {announcements.map((item) => {
        const config = typeConfig[item.announcement_type as keyof typeof typeConfig] || typeConfig.news;
        const Icon = config.icon;

        return (
          <Card key={item.id} className={item.is_pinned ? 'border-primary/50' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                    <h4 className="font-semibold truncate">{getLocalizedContent(item, 'title')}</h4>
                    <Badge variant="secondary" className={config.color}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {getLocalizedContent(item, 'content')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(item.published_at || item.created_at), 'd MMMM yyyy', { locale: ru })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
