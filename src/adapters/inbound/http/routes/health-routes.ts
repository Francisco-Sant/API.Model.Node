import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { UserService } from '../../../../application/services/user-service.js';

const liveResponseSchema = z.object({
  status: z.literal('alive')
});

const readyResponseSchema = z.object({
  status: z.literal('ready'),
  persistence: z.literal('in-memory')
});

const unavailableResponseSchema = z.object({
  detail: z.literal('User service unavailable.')
});

export interface HealthRoutesOptions {
  userService: UserService | null;
}

export const healthRoutes: FastifyPluginAsync<HealthRoutesOptions> = async (app, options) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.get('/health/live', {
    schema: {
      tags: ['Health'],
      response: {
        200: liveResponseSchema
      }
    }
  }, async () => ({ status: 'alive' as const }));

  typedApp.get('/health/ready', {
    schema: {
      tags: ['Health'],
      response: {
        200: readyResponseSchema,
        503: unavailableResponseSchema
      }
    }
  }, async (_, reply) => {
    if (options.userService === null) {
      return reply.code(503).send({ detail: 'User service unavailable.' as const });
    }

    return { status: 'ready' as const, persistence: 'in-memory' as const };
  });
};
