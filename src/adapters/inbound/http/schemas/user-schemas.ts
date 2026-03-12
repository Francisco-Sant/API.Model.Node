import { z } from 'zod';
import type { SaveUserCommand } from '../../../../application/commands/save-user-command.js';
import type { User } from '../../../../domain/entities/user.js';

export const userRequestSchema = z.object({
  id: z.number().int().positive(),
  nome: z.string().trim().min(1).max(120),
  dtNascimento: z.iso.date(),
  status: z.boolean(),
  telefones: z.array(z.string())
});

export const userParamsSchema = z.object({
  usuarioId: z.coerce.number().int().positive()
});

export const userResponseSchema = z.object({
  id: z.number().int().positive(),
  nome: z.string(),
  dtNascimento: z.iso.date(),
  status: z.boolean(),
  telefones: z.array(z.string())
});

export const userErrorSchema = z.object({
  detail: z.string()
});

export type UserRequest = z.infer<typeof userRequestSchema>;
export type UserParams = z.infer<typeof userParamsSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

export function toSaveUserCommand(input: UserRequest): SaveUserCommand {
  return {
    id: input.id,
    nome: input.nome,
    dtNascimento: input.dtNascimento,
    status: input.status,
    telefones: [...input.telefones]
  };
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    nome: user.nome,
    dtNascimento: user.dtNascimento,
    status: user.status,
    telefones: [...user.telefones]
  };
}
