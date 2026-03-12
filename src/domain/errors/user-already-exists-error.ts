export class UserAlreadyExistsError extends Error {
  constructor(userId: number) {
    super(`Usuario com id ${userId} ja existe.`);
    this.name = 'UserAlreadyExistsError';
  }
}
