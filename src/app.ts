import Fastify, { type FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod';
import { InMemoryUserRepository } from './adapters/outbound/repositories/in-memory-user-repository.js';
import { healthRoutes } from './adapters/inbound/http/routes/health-routes.js';
import { userRoutes } from './adapters/inbound/http/routes/user-routes.js';
import { UserService } from './application/services/user-service.js';

export interface CreateAppOptions {
  userService?: UserService | null;
}

function buildUserService(): UserService {
  const repository = new InMemoryUserRepository();
  return new UserService(repository);
}

export async function createApp(options: CreateAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.userService === null ? false : false
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Usuarios API Node - Canal DEPLOY',
        version: '0.1.0',
        description: 'CRUD de usuarios com persistencia em memoria.'
      }
    },
    transform: jsonSchemaTransform
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs'
  });

  const userService = options.userService === undefined ? buildUserService() : options.userService;

  await app.register(healthRoutes, { userService });
  await app.register(userRoutes, { userService });

  return app;
}
