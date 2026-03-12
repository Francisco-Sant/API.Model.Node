import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createApp } from '../../../src/app.js';

async function buildApp(): Promise<FastifyInstance> {
  const app = await createApp();
  await app.ready();
  return app;
}

describe('Usuarios API', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    if (app !== undefined) {
      await app.close();
      app = undefined;
    }
  });

  it('reports liveness and readiness', async () => {
    app = await buildApp();

    const liveResponse = await app.inject({ method: 'GET', url: '/health/live' });
    const readyResponse = await app.inject({ method: 'GET', url: '/health/ready' });

    expect(liveResponse.statusCode).toBe(200);
    expect(liveResponse.json()).toEqual({ status: 'alive' });
    expect(readyResponse.statusCode).toBe(200);
    expect(readyResponse.json()).toEqual({
      status: 'ready',
      persistence: 'in-memory'
    });
  });

  it('returns 503 for readiness when the service is not available', async () => {
    app = await createApp({ userService: null });
    await app.ready();

    const readyResponse = await app.inject({ method: 'GET', url: '/health/ready' });

    expect(readyResponse.statusCode).toBe(503);
    expect(readyResponse.json()).toEqual({ detail: 'User service unavailable.' });
  });

  it('executes the full CRUD flow', async () => {
    app = await buildApp();

    const createResponse = await app.inject({
      method: 'POST',
      url: '/usuarios',
      payload: {
        id: 1,
        nome: 'Carlos',
        dtNascimento: '1992-03-14',
        status: true,
        telefones: ['11911112222', '1122223333']
      }
    });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.json()).toEqual({
      id: 1,
      nome: 'Carlos',
      dtNascimento: '1992-03-14',
      status: true,
      telefones: ['11911112222', '1122223333']
    });

    const listResponse = await app.inject({ method: 'GET', url: '/usuarios' });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toHaveLength(1);

    const getResponse = await app.inject({ method: 'GET', url: '/usuarios/1' });
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().nome).toBe('Carlos');

    const updateResponse = await app.inject({
      method: 'PUT',
      url: '/usuarios/1',
      payload: {
        id: 200,
        nome: 'Carlos Silva',
        dtNascimento: '1992-03-14',
        status: false,
        telefones: ['11900001111']
      }
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toEqual({
      id: 1,
      nome: 'Carlos Silva',
      dtNascimento: '1992-03-14',
      status: false,
      telefones: ['11900001111']
    });

    const deleteResponse = await app.inject({ method: 'DELETE', url: '/usuarios/1' });
    expect(deleteResponse.statusCode).toBe(204);

    const missingResponse = await app.inject({ method: 'GET', url: '/usuarios/1' });
    expect(missingResponse.statusCode).toBe(404);
  });

  it('returns 409 for duplicate id', async () => {
    app = await buildApp();

    const payload = {
      id: 1,
      nome: 'Patricia',
      dtNascimento: '1995-08-10',
      status: true,
      telefones: ['11977776666']
    };

    const firstResponse = await app.inject({ method: 'POST', url: '/usuarios', payload });
    const duplicateResponse = await app.inject({ method: 'POST', url: '/usuarios', payload });

    expect(firstResponse.statusCode).toBe(201);
    expect(duplicateResponse.statusCode).toBe(409);
  });

  it('returns 404 for unknown user on get, put and delete', async () => {
    app = await buildApp();

    const getResponse = await app.inject({ method: 'GET', url: '/usuarios/999' });
    const putResponse = await app.inject({
      method: 'PUT',
      url: '/usuarios/999',
      payload: {
        id: 999,
        nome: 'Inexistente',
        dtNascimento: '2000-01-01',
        status: false,
        telefones: []
      }
    });
    const deleteResponse = await app.inject({ method: 'DELETE', url: '/usuarios/999' });

    expect(getResponse.statusCode).toBe(404);
    expect(putResponse.statusCode).toBe(404);
    expect(deleteResponse.statusCode).toBe(404);
  });
});
