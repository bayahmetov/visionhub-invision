import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Program {
  id: string;
  name_ru: string;
  name_kz: string | null;
  name_en: string | null;
  university_id: string;
  degree_level: 'bachelor' | 'master' | 'doctorate';
  duration_years: number;
  tuition_fee_kzt: number | null;
  grants_available: boolean | null;
  ent_min_score: number | null;
  description_ru: string | null;
  universities?: { name_ru: string };
}

interface UseProgramsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ProgramsResponse {
  data: Program[];
  totalCount: number;
}

async function fetchPrograms({
  page = 1,
  pageSize = 10,
  search = '',
  sortBy = 'name_ru',
  sortOrder = 'asc',
}: UseProgramsOptions): Promise<ProgramsResponse> {
  let query = supabase.from('programs').select('*, universities(name_ru)', { count: 'exact' });

  if (search) {
    query = query.ilike('name_ru', `%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: (data as Program[]) || [],
    totalCount: count || 0,
  };
}

export function usePrograms(options: UseProgramsOptions = {}) {
  return useQuery({
    queryKey: ['programs', options],
    queryFn: () => fetchPrograms(options),
  });
}

export function useProgramMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Program>) => {
      const { universities, ...insertData } = data as any;
      const { error, data: result } = await supabase
        .from('programs')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast({ title: 'Успешно', description: 'Программа создана' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Program> }) => {
      const { universities, ...updateData } = data as any;
      const { error, data: result } = await supabase
        .from('programs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast({ title: 'Успешно', description: 'Программа обновлена' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast({ title: 'Успешно', description: 'Программа удалена' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
