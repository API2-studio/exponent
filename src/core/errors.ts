
export class API2Error extends Error {
  public statusCode?: number;
  public details?: any;

  constructor(message: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'API2Error';
    this.statusCode = statusCode;
    this.details = details;

    const errorConstructor = Error as any;
    if (errorConstructor.captureStackTrace) {
      errorConstructor.captureStackTrace(this, API2Error);
    }
  }
}

export class AuthenticationError extends API2Error {
  constructor(message: string = 'Authentication failed.', details?: any) {
    super(message, 401, details);
    this.name = 'AuthenticationError';
  }
}

export class ClientError extends API2Error {
  constructor(message: string, statusCode: number = 400, details?: any) {
    super(message, statusCode, details);
    this.name = 'ClientError';
  }
}

export class ServerError extends API2Error {
  constructor(message: string = 'Server error occurred.', statusCode: number = 500, details?: any) {
    super(message, statusCode, details);
    this.name = 'ServerError';
  }
}

export class NetworkError extends API2Error {
  constructor(message: string = 'Network error occurred.', details?: any) {
    super(message, undefined, details);
    this.name = 'NetworkError';
  }
}
