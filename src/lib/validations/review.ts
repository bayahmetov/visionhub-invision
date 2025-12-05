import { z } from 'zod';

export const reviewSchema = z.object({
  university_id: z.string().uuid('Выберите ВУЗ'),
  rating: z.number().min(1, 'Выберите оценку').max(5, 'Максимум 5'),
  comment: z.string().max(2000, 'Максимум 2000 символов').optional().or(z.literal('')),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
