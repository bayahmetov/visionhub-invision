import { z } from 'zod';

export const programSchema = z.object({
  name_ru: z.string().min(1, 'Название обязательно').max(255, 'Максимум 255 символов'),
  name_kz: z.string().max(255, 'Максимум 255 символов').optional().or(z.literal('')),
  name_en: z.string().max(255, 'Максимум 255 символов').optional().or(z.literal('')),
  university_id: z.string().uuid('Выберите ВУЗ'),
  degree_level: z.enum(['bachelor', 'master', 'doctorate'], {
    errorMap: () => ({ message: 'Выберите уровень' }),
  }),
  duration_years: z.number().min(1, 'Минимум 1 год').max(10, 'Максимум 10 лет'),
  tuition_fee_kzt: z.number().min(0, 'Не может быть отрицательным').nullable().optional(),
  grants_available: z.boolean().optional(),
  ent_min_score: z.number().min(0, 'Минимум 0').max(140, 'Максимум 140').nullable().optional(),
  description_ru: z.string().max(5000, 'Максимум 5000 символов').optional().or(z.literal('')),
});

export type ProgramFormData = z.infer<typeof programSchema>;
