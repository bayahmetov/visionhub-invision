import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUniversityViews(universityId: string) {
  const { user } = useAuth();

  // Track view on mount
  const trackMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('university_views').insert({
        university_id: universityId,
        viewer_id: user?.id || null,
      });
      if (error) throw error;
    },
  });

  useEffect(() => {
    if (universityId) {
      trackMutation.mutate();
    }
  }, [universityId]);

  // Get view count
  const { data: viewCount } = useQuery({
    queryKey: ['university-views-count', universityId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('university_views')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', universityId);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!universityId,
  });

  return { viewCount };
}

export function useUniversityViewStats(universityId: string) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['university-view-stats', universityId],
    queryFn: async () => {
      // Get total views
      const { count: totalViews } = await supabase
        .from('university_views')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', universityId);

      // Get views last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weekViews } = await supabase
        .from('university_views')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', universityId)
        .gte('viewed_at', weekAgo.toISOString());

      // Get views last 30 days
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const { count: monthViews } = await supabase
        .from('university_views')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', universityId)
        .gte('viewed_at', monthAgo.toISOString());

      return {
        totalViews: totalViews || 0,
        weekViews: weekViews || 0,
        monthViews: monthViews || 0,
      };
    },
    enabled: !!universityId,
  });

  return { stats, isLoading };
}
