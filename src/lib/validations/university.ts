import { z } from 'zod';

export const universitySchema = z.object({
  name_ru: z.string().min(1, 'Название обязательно').max(255, 'Максимум 255 символов'),
  name_kz: z.string().max(255, 'Максимум 255 символов').optional().or(z.literal('')),
  name_en: z.string().max(255, 'Максимум 255 символов').optional().or(z.literal('')),
  city: z.string().min(1, 'Город обязателен').max(100, 'Максимум 100 символов'),
  region: z.string().min(1, 'Регион обязателен').max(100, 'Максимум 100 символов'),
  type: z.enum(['state', 'private', 'national', 'international']),
  founded_year: z.number().min(1800, 'Год должен быть больше 1800').max(new Date().getFullYear(), 'Год не может быть в будущем').nullable().optional(),
  students_count: z.number().min(0, 'Не может быть отрицательным').nullable().optional(),
  teachers_count: z.number().min(0, 'Не может быть отрицательным').nullable().optional(),
  has_dormitory: z.boolean().optional(),
  has_military_department: z.boolean().optional(),
  has_grants: z.boolean().optional(),
  website: z.string().url('Некорректный URL').optional().or(z.literal('')),
  email: z.string().email('Некорректный email').optional().or(z.literal('')),
  phone: z.string().max(50, 'Максимум 50 символов').optional().or(z.literal('')),
  description_ru: z.string().max(5000, 'Максимум 5000 символов').optional().or(z.literal('')),
});

export type UniversityFormData = z.infer<typeof universitySchema>;
