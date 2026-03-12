import { describe, expect, it } from 'vitest';
import { InMemoryUserRepository } from '../../../src/adapters/outbound/repositories/in-memory-user-repository.js';
import type { SaveUserCommand } from '../../../src/application/commands/save-user-command.js';
import { UserService } from '../../../src/application/services/user-service.js';
import { UserAlreadyExistsError } from '../../../src/domain/errors/user-already-exists-error.js';
import { UserNotFoundError } from '../../../src/domain/errors/user-not-found-error.js';

function makeCommand(userId = 1, nome = 'Maria'): SaveUserCommand {
  return {
    id: userId,
    nome,
    dtNascimento: '1990-01-10',
    status: true,
    telefones: ['11999990000', '1133334444']
  };
}

describe('UserService', () => {
  it('creates a user and lists users', () => {
    const service = new UserService(new InMemoryUserRepository());

    const createdUser = service.createUser(makeCommand());
    const users = service.listUsers();

    expect(createdUser.id).toBe(1);
    expect(createdUser.nome).toBe('Maria');
    expect(users).toHaveLength(1);
    expect(users[0]?.telefones).toEqual(['11999990000', '1133334444']);
  });

  it('throws when creating a user with an existing id', () => {
    const service = new UserService(new InMemoryUserRepository());
    const command = makeCommand();

    service.createUser(command);

    expect(() => service.createUser(command)).toThrowError(UserAlreadyExistsError);
  });

  it('updates a user while preserving the route id', () => {
    const service = new UserService(new InMemoryUserRepository());
    service.createUser(makeCommand());

    const updatedUser = service.updateUser(1, {
      id: 99,
      nome: 'Ana',
      dtNascimento: '1988-05-20',
      status: false,
      telefones: ['11888887777']
    });

    expect(updatedUser.id).toBe(1);
    expect(updatedUser.nome).toBe('Ana');
    expect(updatedUser.status).toBe(false);
    expect(updatedUser.telefones).toEqual(['11888887777']);
  });

  it('throws when deleting an unknown user', () => {
    const service = new UserService(new InMemoryUserRepository());

    expect(() => service.deleteUser(999)).toThrowError(UserNotFoundError);
  });
});
