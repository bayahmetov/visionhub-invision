import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, Target, MapPin, Wallet, Globe, Save, 
  Sparkles, X 
} from 'lucide-react';

const englishLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const degreeOptions = [
  { value: 'bachelor', label: 'Бакалавриат' },
  { value: 'master', label: 'Магистратура' },
  { value: 'phd', label: 'Докторантура' },
];

const profileSchema = z.object({
  ent_score: z.number().min(0).max(140).nullable(),
  expected_ent_score: z.number().min(0).max(140).nullable(),
  budget_max_kzt: z.number().min(0).nullable(),
  english_level: z.string().nullable(),
  target_degree: z.string().nullable(),
  willing_to_relocate: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ApplicantProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['applicant-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: fields } = useQuery({
    queryKey: ['fields-of-study'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fields_of_study')
        .select('*')
        .order('name_ru');
      if (error) throw error;
      return data;
    },
  });

  const cities = [
    'Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Павлодар',
    'Семей', 'Атырау', 'Костанай', 'Тараз', 'Актау', 'Уральск',
  ];

  const { register, handleSubmit, setValue, watch, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ent_score: null,
      expected_ent_score: null,
      budget_max_kzt: null,
      english_level: null,
      target_degree: null,
      willing_to_relocate: true,
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        ent_score: profile.ent_score,
        expected_ent_score: profile.expected_ent_score,
        budget_max_kzt: profile.budget_max_kzt,
        english_level: profile.english_level,
        target_degree: profile.target_degree,
        willing_to_relocate: profile.willing_to_relocate ?? true,
      });
      setSelectedInterests(profile.interests || []);
      setSelectedCities(profile.preferred_cities || []);
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          interests: selectedInterests,
          preferred_cities: selectedCities,
        })
        .eq('id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicant-profile'] });
      toast({ title: 'Профиль сохранён' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const toggleInterest = (fieldId: string) => {
    setSelectedInterests(prev => 
      prev.includes(fieldId) ? prev.filter(f => f !== fieldId) : [...prev, fieldId]
    );
  };

  const toggleCity = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const calculateProfileCompleteness = () => {
    let filled = 0;
    const total = 7;
    
    if (watch('ent_score') || watch('expected_ent_score')) filled++;
    if (watch('english_level')) filled++;
    if (watch('target_degree')) filled++;
    if (watch('budget_max_kzt')) filled++;
    if (selectedInterests.length > 0) filled++;
    if (selectedCities.length > 0) filled++;
    if (profile?.full_name) filled++;
    
    return Math.round((filled / total) * 100);
  };

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  const completeness = calculateProfileCompleteness();

  return (
    <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
      {/* Completeness Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Образовательный профиль</h3>
                <p className="text-sm text-muted-foreground">
                  Заполните профиль для персональных рекомендаций
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{completeness}%</span>
              <p className="text-xs text-muted-foreground">заполнено</p>
            </div>
          </div>
          <Progress value={completeness} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Academic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Академические данные
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Балл ЕНТ</Label>
                <Input
                  type="number"
                  placeholder="0-140"
                  {...register('ent_score', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label>Ожидаемый балл</Label>
                <Input
                  type="number"
                  placeholder="0-140"
                  {...register('expected_ent_score', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <Label>Уровень английского</Label>
              <Select 
                value={watch('english_level') || ''} 
                onValueChange={(v) => setValue('english_level', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите уровень" />
                </SelectTrigger>
                <SelectContent>
                  {englishLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Целевая степень</Label>
              <Select 
                value={watch('target_degree') || ''} 
                onValueChange={(v) => setValue('target_degree', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите степень" />
                </SelectTrigger>
                <SelectContent>
                  {degreeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Предпочтения
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Максимальный бюджет (₸/год)</Label>
              <Input
                type="number"
                placeholder="Например: 1500000"
                {...register('budget_max_kzt', { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={watch('willing_to_relocate')}
                onCheckedChange={(c) => setValue('willing_to_relocate', !!c)}
              />
              <Label className="cursor-pointer">Готов к переезду</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Интересующие направления
          </CardTitle>
          <CardDescription>Выберите области, которые вас интересуют</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {fields?.map(field => (
              <Badge
                key={field.id}
                variant={selectedInterests.includes(field.id) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleInterest(field.id)}
              >
                {field.icon && <span className="mr-1">{field.icon}</span>}
                {field.name_ru}
                {selectedInterests.includes(field.id) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preferred Cities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Предпочтительные города
          </CardTitle>
          <CardDescription>Где бы вы хотели учиться?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {cities.map(city => (
              <Badge
                key={city}
                variant={selectedCities.includes(city) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleCity(city)}
              >
                {city}
                {selectedCities.includes(city) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={updateMutation.isPending} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        {updateMutation.isPending ? 'Сохранение...' : 'Сохранить профиль'}
      </Button>
    </form>
  );
}
