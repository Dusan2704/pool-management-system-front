import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const pageFormSchema = z.object({
  title:        z.string().min(1, 'Naslov je obavezan').max(120),
  slug:         z.string().regex(slugRegex, 'Slug: samo mala slova i crtice (npr. o-nama)').max(80),
  content:      z.string(),
  is_published: z.boolean(),
  sort_order:   z.coerce.number().int().min(0),
});

export type PageFormInput = z.infer<typeof pageFormSchema>;
