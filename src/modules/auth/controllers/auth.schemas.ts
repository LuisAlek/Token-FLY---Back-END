import { z } from 'zod';
import { EMAIL_REGEX } from '../domain/email.vo';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../domain/password.vo';

const emailSchema = z
  .string({ error: 'El correo es obligatorio.' })
  .trim()
  .min(1, 'El correo es obligatorio.')
  .regex(EMAIL_REGEX, 'Ingresa un correo válido que termine en .co o .com.');

const passwordSchema = z
  .string({ error: 'La contraseña es obligatoria.' })
  .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener mínimo ${PASSWORD_MIN_LENGTH} caracteres.`)
  .max(PASSWORD_MAX_LENGTH, `La contraseña debe tener máximo ${PASSWORD_MAX_LENGTH} caracteres.`);

export const registerSchema = z
  .object({
    username: z
      .string({ error: 'El nombre de usuario es obligatorio.' })
      .trim()
      .min(1, 'El nombre de usuario es obligatorio.')
      .max(30, 'El nombre de usuario no puede superar los 30 caracteres.'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string({ error: 'Debes confirmar la contraseña.' })
      .min(1, 'Debes confirmar la contraseña.'),
    termsAccepted: z.boolean({ error: 'Debes aceptar los términos y condiciones.' }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Las contraseñas no coinciden.',
      });
    }
    if (!data.termsAccepted) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['termsAccepted'],
        message: 'Debes aceptar los términos y condiciones.',
      });
    }
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterSchemaInput = z.infer<typeof registerSchema>;
export type LoginSchemaInput = z.infer<typeof loginSchema>;
