/**
 * Base class for expected business errors. Services throw subclasses;
 * DomainErrorFilter turns them into HTTP responses, so services stay HTTP-agnostic
 * apart from declaring which status fits.
 */
export abstract class DomainError extends Error {
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
