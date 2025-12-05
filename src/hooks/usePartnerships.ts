import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Partnership {
  id: string;
  university_id: string;
  partner_name: string;
  partner_country: string;
  partnership_type: string | null;
  description_ru: string | null;
  universities?: { name_ru: string };
}

interface UsePartnershipsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PartnershipsResponse {
  data: Partnership[];
  totalCount: number;
}

async function fetchPartnerships({
  page = 1,
  pageSize = 10,
  search = '',
  sortBy = 'partner_name',
  sortOrder = 'asc',
}: UsePartnershipsOptions): Promise<PartnershipsResponse> {
  let query = supabase.from('partnerships').select('*, universities(name_ru)', { count: 'exact' });

  if (search) {
    query = query.or(`partner_name.ilike.%${search}%,partner_country.ilike.%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: (data as Partnership[]) || [],
    totalCount: count || 0,
  };
}

export function usePartnerships(options: UsePartnershipsOptions = {}) {
  return useQuery({
    queryKey: ['partnerships', options],
    queryFn: () => fetchPartnerships(options),
  });
}

export function usePartnershipMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Partnership>) => {
      const { universities, ...insertData } = data as any;
      const { error, data: result } = await supabase
        .from('partnerships')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerships'] });
      toast({ title: 'Успешно', description: 'Партнерство создано' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Partnership> }) => {
      const { universities, ...updateData } = data as any;
      const { error, data: result } = await supabase
        .from('partnerships')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerships'] });
      toast({ title: 'Успешно', description: 'Партнерство обновлено' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('partnerships').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerships'] });
      toast({ title: 'Успешно', description: 'Партнерство удалено' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
