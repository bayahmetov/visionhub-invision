import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Eye, TrendingUp, Calendar, MapPin, Loader2 } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface StatsTabProps {
  universityId: string;
}

export default function StatsTab({ universityId }: StatsTabProps) {
  // Fetch total views
  const { data: totalViews = 0, isLoading: loadingTotal } = useQuery({
    queryKey: ['university_views_total', universityId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('university_views')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', universityId);
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch views for last 30 days
  const { data: viewsByDay = [], isLoading: loadingDaily } = useQuery({
    queryKey: ['university_views_daily', universityId],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase
        .from('university_views')
        .select('viewed_at')
        .eq('university_id', universityId)
        .gte('viewed_at', thirtyDaysAgo);
      if (error) throw error;

      // Group by day
      const grouped: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        grouped[date] = 0;
      }

      data?.forEach(view => {
        if (view.viewed_at) {
          const date = format(new Date(view.viewed_at), 'yyyy-MM-dd');
          if (grouped[date] !== undefined) {
            grouped[date]++;
          }
        }
      });

      return Object.entries(grouped).map(([date, count]) => ({
        date: format(new Date(date), 'dd MMM', { locale: ru }),
        views: count,
      }));
    },
  });

  // Fetch views by city
  const { data: viewsByCity = [], isLoading: loadingCities } = useQuery({
    queryKey: ['university_views_cities', universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('university_views')
        .select('source_city')
        .eq('university_id', universityId)
        .not('source_city', 'is', null);
      if (error) throw error;

      const grouped: Record<string, number> = {};
      data?.forEach(view => {
        if (view.source_city) {
          grouped[view.source_city] = (grouped[view.source_city] || 0) + 1;
        }
      });

      return Object.entries(grouped)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([city, count]) => ({ city, count }));
    },
  });

  // Fetch views for last 7 days vs previous 7 days for trend
  const { data: trend = 0 } = useQuery({
    queryKey: ['university_views_trend', universityId],
    queryFn: async () => {
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const fourteenDaysAgo = subDays(new Date(), 14).toISOString();

      const { count: currentWeek } = await supabase
        .from('university_views')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', universityId)
        .gte('viewed_at', sevenDaysAgo);

      const { count: previousWeek } = await supabase
        .from('university_views')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', universityId)
        .gte('viewed_at', fourteenDaysAgo)
        .lt('viewed_at', sevenDaysAgo);

      if (!previousWeek || previousWeek === 0) return currentWeek || 0;
      return Math.round(((currentWeek || 0) - previousWeek) / previousWeek * 100);
    },
  });

  // Fetch today's views
  const { data: todayViews = 0 } = useQuery({
    queryKey: ['university_views_today', universityId],
    queryFn: async () => {
      const today = startOfDay(new Date()).toISOString();
      const { count, error } = await supabase
        .from('university_views')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', universityId)
        .gte('viewed_at', today);
      if (error) throw error;
      return count || 0;
    },
  });

  const isLoading = loadingTotal || loadingDaily || loadingCities;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего просмотров</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent/10">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Сегодня</p>
                <p className="text-2xl font-bold">{todayViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${trend >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <TrendingUp className={`h-6 w-6 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">За неделю</p>
                <p className="text-2xl font-bold">
                  {trend >= 0 ? '+' : ''}{trend}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-secondary/50">
                <MapPin className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Городов</p>
                <p className="text-2xl font-bold">{viewsByCity.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Просмотры за 30 дней</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={viewsByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Топ городов</CardTitle>
          </CardHeader>
          <CardContent>
            {viewsByCity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Нет данных о географии посетителей
              </p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={viewsByCity} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      dataKey="city" 
                      type="category" 
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}