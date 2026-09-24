import { z } from "zod";

export const roleSchema = z.enum([
  "ADMINISTRADOR",
  "SUPERVISOR",
  "PERSONAL_ACCESO",
  "PERSONAL_CONFITERIA",
  "CLIENTE",
]);

export const addMemberSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    role: roleSchema,
  })
  .strict();

export const changeMemberRoleSchema = z.object({ role: roleSchema }).strict();
