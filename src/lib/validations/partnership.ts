import { z } from 'zod';

export const partnershipSchema = z.object({
  university_id: z.string().uuid('Выберите ВУЗ'),
  partner_name: z.string().min(1, 'Название партнера обязательно').max(255, 'Максимум 255 символов'),
  partner_country: z.string().min(1, 'Страна обязательна').max(100, 'Максимум 100 символов'),
  partnership_type: z.enum(['exchange', 'research', 'dual_degree', 'other']).optional().nullable(),
  description_ru: z.string().max(2000, 'Максимум 2000 символов').optional().or(z.literal('')),
});

export type PartnershipFormData = z.infer<typeof partnershipSchema>;
