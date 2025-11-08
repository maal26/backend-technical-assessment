import { email, z } from "zod";

export const authenticateUserRequestSchema = z.object({
    email: z.email(),
    password: z.string(),
});

export type AuthenticateUserInput = z.infer<typeof authenticateUserRequestSchema>;

export const registerUserRequestSchema = z.object({
    name: z.string().min(3).max(50),
    email: z.email().max(255),
    password: z.string().min(8).max(60)
});

export type RegisterUserInput = z.infer<typeof registerUserRequestSchema>;