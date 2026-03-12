import type { User } from '../entities/user.js';

export interface UserRepository {
  save(user: User): User;
  listAll(): User[];
  getById(userId: number): User | null;
  delete(userId: number): void;
}
