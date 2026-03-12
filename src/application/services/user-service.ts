import type { SaveUserCommand } from '../commands/save-user-command.js';
import { UserAlreadyExistsError } from '../../domain/errors/user-already-exists-error.js';
import { UserNotFoundError } from '../../domain/errors/user-not-found-error.js';
import type { User } from '../../domain/entities/user.js';
import type { UserRepository } from '../../domain/ports/user-repository.js';

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  createUser(command: SaveUserCommand): User {
    if (this.repository.getById(command.id) !== null) {
      throw new UserAlreadyExistsError(command.id);
    }

    const user = this.toUser(command);
    return this.repository.save(user);
  }

  listUsers(): User[] {
    return this.repository.listAll();
  }

  getUser(userId: number): User {
    const user = this.repository.getById(userId);
    if (user === null) {
      throw new UserNotFoundError(userId);
    }

    return user;
  }

  updateUser(userId: number, command: SaveUserCommand): User {
    this.getUser(userId);
    const user = this.toUser(command, userId);
    return this.repository.save(user);
  }

  deleteUser(userId: number): void {
    this.getUser(userId);
    this.repository.delete(userId);
  }

  private toUser(command: SaveUserCommand, userId?: number): User {
    return {
      id: userId ?? command.id,
      nome: command.nome,
      dtNascimento: command.dtNascimento,
      status: command.status,
      telefones: [...command.telefones]
    };
  }
}
