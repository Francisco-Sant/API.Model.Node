import type { FastifyPluginAsync } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { UserService } from '../../../../application/services/user-service.js';
import { UserAlreadyExistsError } from '../../../../domain/errors/user-already-exists-error.js';
import { UserNotFoundError } from '../../../../domain/errors/user-not-found-error.js';
import {
  toSaveUserCommand,
  toUserResponse,
  userErrorSchema,
  userParamsSchema,
  userRequestSchema,
  userResponseSchema
} from '../schemas/user-schemas.js';

export interface UserRoutesOptions {
  userService: UserService | null;
}

export const userRoutes: FastifyPluginAsync<UserRoutesOptions> = async (app, options) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.post('/usuarios', {
    schema: {
      tags: ['Usuarios'],
      body: userRequestSchema,
      response: {
        201: userResponseSchema,
        409: userErrorSchema,
        503: userErrorSchema
      }
    }
  }, async (request, reply) => {
    if (options.userService === null) {
      return reply.code(503).send({ detail: 'User service unavailable.' });
    }

    try {
      const user = options.userService.createUser(toSaveUserCommand(request.body));
      return reply.code(201).send(toUserResponse(user));
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return reply.code(409).send({ detail: error.message });
      }

      throw error;
    }
  });

  typedApp.get('/usuarios', {
    schema: {
      tags: ['Usuarios'],
      response: {
        200: userResponseSchema.array(),
        503: userErrorSchema
      }
    }
  }, async (_, reply) => {
    if (options.userService === null) {
      return reply.code(503).send({ detail: 'User service unavailable.' });
    }

    const users = options.userService.listUsers().map(toUserResponse);
    return users;
  });

  typedApp.get('/usuarios/:usuarioId', {
    schema: {
      tags: ['Usuarios'],
      params: userParamsSchema,
      response: {
        200: userResponseSchema,
        404: userErrorSchema,
        503: userErrorSchema
      }
    }
  }, async (request, reply) => {
    if (options.userService === null) {
      return reply.code(503).send({ detail: 'User service unavailable.' });
    }

    try {
      const user = options.userService.getUser(request.params.usuarioId);
      return toUserResponse(user);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.code(404).send({ detail: error.message });
      }

      throw error;
    }
  });

  typedApp.put('/usuarios/:usuarioId', {
    schema: {
      tags: ['Usuarios'],
      params: userParamsSchema,
      body: userRequestSchema,
      response: {
        200: userResponseSchema,
        404: userErrorSchema,
        503: userErrorSchema
      }
    }
  }, async (request, reply) => {
    if (options.userService === null) {
      return reply.code(503).send({ detail: 'User service unavailable.' });
    }

    try {
      const user = options.userService.updateUser(
        request.params.usuarioId,
        toSaveUserCommand(request.body)
      );
      return toUserResponse(user);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.code(404).send({ detail: error.message });
      }

      throw error;
    }
  });

  typedApp.delete('/usuarios/:usuarioId', {
    schema: {
      tags: ['Usuarios'],
      params: userParamsSchema,
      response: {
        204: z.null(),
        404: userErrorSchema,
        503: userErrorSchema
      }
    }
  }, async (request, reply) => {
    if (options.userService === null) {
      return reply.code(503).send({ detail: 'User service unavailable.' });
    }

    try {
      options.userService.deleteUser(request.params.usuarioId);
      return reply.code(204).send(null);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.code(404).send({ detail: error.message });
      }

      throw error;
    }
  });
};
