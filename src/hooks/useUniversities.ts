import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type University = Tables<'universities'>;

interface UseUniversitiesOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UniversitiesResponse {
  data: University[];
  totalCount: number;
}

async function fetchUniversities({
  page = 1,
  pageSize = 10,
  search = '',
  sortBy = 'name_ru',
  sortOrder = 'asc',
}: UseUniversitiesOptions): Promise<UniversitiesResponse> {
  let query = supabase.from('universities').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`name_ru.ilike.%${search}%,city.ilike.%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    totalCount: count || 0,
  };
}

export function useUniversities(options: UseUniversitiesOptions = {}) {
  return useQuery({
    queryKey: ['universities', options],
    queryFn: () => fetchUniversities(options),
  });
}

export function useUniversityMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: Partial<University>) => {
      const { error, data: result } = await supabase
        .from('universities')
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      toast({ title: 'Успешно', description: 'ВУЗ создан' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<University> }) => {
      const { error, data: result } = await supabase
        .from('universities')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      toast({ title: 'Успешно', description: 'ВУЗ обновлен' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('universities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      toast({ title: 'Успешно', description: 'ВУЗ удален' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}

export function useUniversitiesList() {
  return useQuery({
    queryKey: ['universities', 'list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name_ru')
        .order('name_ru');
      if (error) throw error;
      return data;
    },
  });
}
