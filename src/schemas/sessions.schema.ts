import { z } from 'zod';

export const sessionFormSchema = z
  .object({
    session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Unesite datum u formatu YYYY-MM-DD'),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Unesite vreme u formatu HH:MM'),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Unesite vreme u formatu HH:MM'),
    capacity: z.coerce.number().int().min(1, 'Kapacitet mora biti najmanje 1').max(1000),
  })
  .refine((d) => d.end_time > d.start_time, {
    message: 'Vreme završetka mora biti posle vremena početka',
    path: ['end_time'],
  });

export type SessionFormInput = z.infer<typeof sessionFormSchema>;
