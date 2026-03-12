export class UserNotFoundError extends Error {
  constructor(userId: number) {
    super(`Usuario com id ${userId} nao foi encontrado.`);
    this.name = 'UserNotFoundError';
  }
}
