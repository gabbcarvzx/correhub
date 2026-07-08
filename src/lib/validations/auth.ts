import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um email válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Informe um email válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  city: z.string().min(2, "Informe sua cidade"),
  preferredDistance: z.string().optional(),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
