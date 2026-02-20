
import axios, { AxiosInstance } from 'axios';
import { Config } from './config';
import { AuthenticationError, ClientError, ServerError, NetworkError, API2Error } from './errors';

class APIClient {
  private httpClient: AxiosInstance;

  constructor() {
    const config = Config.getInstance();
    const apiKey = config.get('apiKey') as string;

    this.httpClient = axios.create({
      baseURL: config.get('baseURL') as string,
      timeout: config.get('timeout') as number,
    });

    this.httpClient.interceptors.request.use((reqConfig) => {
      reqConfig.headers.Authorization = `Bearer ${apiKey}`;
      return reqConfig;
    });
  }

  public getConfig() {
    return Config.getInstance();
  }

  async request<T>(method: string, url: string, data?: any): Promise<T> {
    try {
      const response = await this.httpClient.request<T>({ method, url, data });
      return response.data;
    } catch (error: any) {
      // Categorize errors
      if (error.response) {
        const { status, data } = error.response;
  
        // Authentication error
        if (status === 401) {
          throw new AuthenticationError(data?.message || 'Unauthorised', data);
        }
  
        // Client error (4xx)
        if (status >= 400 && status < 500) {
          throw new ClientError(data?.message || 'Client error occurred', status, data);
        }
  
        // Server error (5xx)
        if (status >= 500) {
          throw new ServerError(data?.message || 'Server error occurred', status, data);
        }
      } else if (error.request) {
        // Network error
        throw new NetworkError('No response received from the server.', error.request);
      } else {
        // Unknown error
        throw new API2Error('An unknown error occurred.', undefined, error.message);
      }
    }
  
    // Adding an explicit `return` to satisfy TypeScript's type system
    throw new Error('Unexpected error: all error cases should be handled above.');
  }
}

export default APIClient;
