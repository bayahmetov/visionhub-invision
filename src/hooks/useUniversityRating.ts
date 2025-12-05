import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RatingData {
  averageRating: number;
  reviewsCount: number;
}

export function useUniversityRating(universityId: string) {
  return useQuery({
    queryKey: ['university-rating', universityId],
    queryFn: async (): Promise<RatingData> => {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('university_id', universityId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { averageRating: 0, reviewsCount: 0 };
      }

      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      return {
        averageRating: Math.round((sum / data.length) * 10) / 10,
        reviewsCount: data.length,
      };
    },
    enabled: !!universityId,
  });
}

export function useUniversitiesRatings(universityIds: string[]) {
  return useQuery({
    queryKey: ['universities-ratings', universityIds],
    queryFn: async (): Promise<Record<string, RatingData>> => {
      if (universityIds.length === 0) return {};

      const { data, error } = await supabase
        .from('reviews')
        .select('university_id, rating')
        .in('university_id', universityIds);

      if (error) throw error;

      const ratingsMap: Record<string, { sum: number; count: number }> = {};
      
      universityIds.forEach(id => {
        ratingsMap[id] = { sum: 0, count: 0 };
      });

      data?.forEach(review => {
        if (ratingsMap[review.university_id]) {
          ratingsMap[review.university_id].sum += review.rating;
          ratingsMap[review.university_id].count += 1;
        }
      });

      const result: Record<string, RatingData> = {};
      Object.entries(ratingsMap).forEach(([id, { sum, count }]) => {
        result[id] = {
          averageRating: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
          reviewsCount: count,
        };
      });

      return result;
    },
    enabled: universityIds.length > 0,
  });
}
