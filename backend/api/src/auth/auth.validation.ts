import { z } from "zod";

const passwordSchema = z
  .string()
  .min(12, "La contraseña debe tener al menos 12 caracteres")
  .max(128, "La contraseña no puede superar 128 caracteres")
  .regex(/[a-z]/, "La contraseña debe incluir una minúscula")
  .regex(/[A-Z]/, "La contraseña debe incluir una mayúscula")
  .regex(/[0-9]/, "La contraseña debe incluir un número");

export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: passwordSchema,
    fullName: z.string().trim().min(2).max(150),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

export const passwordResetRequestSchema = z
  .object({ email: z.string().trim().toLowerCase().email().max(254) })
  .strict();

export const passwordResetSchema = z
  .object({ token: z.string().min(32).max(200), password: passwordSchema })
  .strict();

export const emailVerificationSchema = z
  .object({ token: z.string().min(32).max(200) })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
