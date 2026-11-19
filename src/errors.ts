/**
 * An error that carries an HTTP status code. Any layer can `throw` one of these;
 * the errorHandler middleware turns it into a JSON response.
 */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Thrown when a request body or parameter is not acceptable. Becomes a 400. */
export class ValidationError extends HttpError {
  constructor(message: string) {
    super(400, message);
    this.name = 'ValidationError';
  }
}

export const notFound = (what: string) => new HttpError(404, `${what} not found`);
