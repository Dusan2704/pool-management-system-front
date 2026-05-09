import { z } from 'zod';

export const registerSchema = z
  .object({
    first_name:       z.string().min(1, 'Ime je obavezno').max(50),
    last_name:        z.string().min(1, 'Prezime je obavezno').max(50),
    email:            z.string().email('Unesite ispravnu email adresu').max(120),
    phone:            z.string().regex(/^\+?[0-9]+$/, 'Telefon može sadržati samo cifre').min(6, 'Telefon mora imati najmanje 6 cifara').max(20),
    password:         z.string().min(8, 'Lozinka mora imati najmanje 8 karaktera').max(72),
    confirm_password: z.string().min(1, 'Potvrdite lozinku'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirm_password'],
  });

export const loginSchema = z.object({
  email:    z.string().email('Unesite ispravnu email adresu'),
  password: z.string().min(1, 'Lozinka je obavezna'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData    = z.infer<typeof loginSchema>;
