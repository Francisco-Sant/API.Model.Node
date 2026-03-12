import type { User } from '../../../domain/entities/user.js';
import type { UserRepository } from '../../../domain/ports/user-repository.js';

export class InMemoryUserRepository implements UserRepository {
  private readonly storage = new Map<number, User>();

  save(user: User): User {
    const storedUser = this.clone(user);
    this.storage.set(user.id, storedUser);
    return this.clone(storedUser);
  }

  listAll(): User[] {
    return [...this.storage.values()].map((user) => this.clone(user));
  }

  getById(userId: number): User | null {
    const user = this.storage.get(userId);
    return user === undefined ? null : this.clone(user);
  }

  delete(userId: number): void {
    this.storage.delete(userId);
  }

  private clone(user: User): User {
    return {
      ...user,
      telefones: [...user.telefones]
    };
  }
}
