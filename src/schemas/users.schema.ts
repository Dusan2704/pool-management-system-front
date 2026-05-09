import { z } from 'zod';

export const updateContactSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]+$/, 'Telefon može sadržati samo cifre').min(6).max(20).optional(),
  email: z.string().email('Unesite ispravnu email adresu').max(120).optional(),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Unesite trenutnu lozinku'),
    new_password: z.string().min(8, 'Nova lozinka mora imati najmanje 8 karaktera').max(72),
    confirm_password: z.string().min(1, 'Potvrdite novu lozinku'),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirm_password'],
  });

export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
