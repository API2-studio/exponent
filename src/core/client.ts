
import axios, { AxiosInstance } from 'axios';
import { Config } from './config';
import { AuthenticationError, ClientError, ServerError, NetworkError, API2Error } from './errors';

class APIClient {
  private httpClient: AxiosInstance;
  private sdkInitPromise: Promise<void>;
  private sdkInitError?: unknown;
  private sdkInitCompleted = false;

  constructor() {
    const config = Config.getInstance();
    this.httpClient = axios.create({
      baseURL: config.get('baseURL') as string,
      timeout: config.get('timeout') as number,
    });

    this.httpClient.interceptors.request.use((reqConfig) => {
      const currentConfig = Config.getInstance();
      const accessToken = currentConfig.get('accessToken') as string | undefined;
      reqConfig.headers = reqConfig.headers || {};
      const isSdkInitRequest = reqConfig.url === '/api/v1/sdk/init';

      if (!isSdkInitRequest && accessToken) {
        reqConfig.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        delete reqConfig.headers.Authorization;
      }
      return reqConfig;
    });

    const apiKey = config.get('apiKey') as string;
    // Start init immediately, but capture failures so they are thrown on awaited requests.
    this.sdkInitPromise = this.initializeSDK(apiKey).catch((error) => {
      this.sdkInitError = error;
    }).finally(() => {
      this.sdkInitCompleted = true;
    });
  }

  public getConfig() {
    return Config.getInstance();
  }

  async request<T>(method: string, url: string, data?: any): Promise<T> {
    // SDK init call itself must not wait for init.
    if (url !== '/api/v1/sdk/init') {
      await this.ensureSDKInitialized();
    }

    if (this.requiresAccessToken(url) && !this.hasAccessToken()) {
      throw new AuthenticationError(
        `Access token missing for ${url}. Call api.auth.login(...) before making this request.`
      );
    }

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
        const baseURL = Config.getInstance().get('baseURL') as string;
        throw new NetworkError(
          `No response received from the server (${baseURL}${url}). Check CORS, protocol (http/https), and network reachability.`,
          error.request
        );
      } else {
        // Unknown error
        throw new API2Error('An unknown error occurred.', undefined, error.message);
      }
    }
  
    // Adding an explicit `return` to satisfy TypeScript's type system
    throw new Error('Unexpected error: all error cases should be handled above.');
  }

  private async ensureSDKInitialized(): Promise<void> {
    if (this.sdkInitCompleted && this.sdkInitError) {
      this.sdkInitCompleted = false;
      this.sdkInitError = undefined;
      const apiKey = Config.getInstance().get('apiKey') as string;
      this.sdkInitPromise = this.initializeSDK(apiKey).catch((error) => {
        this.sdkInitError = error;
      }).finally(() => {
        this.sdkInitCompleted = true;
      });
    }

    await this.sdkInitPromise;
    if (this.sdkInitError) {
      const error = this.sdkInitError as any;
      if (error instanceof API2Error) {
        throw error;
      }
      throw new AuthenticationError('SDK initialization failed.', error);
    }
  }

  private async initializeSDK(apiKey: string): Promise<void> {
    const config = Config.getInstance();
    const retryCount = (config.get('retryCount') as number) ?? 0;
    const retryDelay = (config.get('retryDelay') as number) ?? 0;

    for (let attempt = 0; attempt <= retryCount; attempt += 1) {
      try {
        const response = await this.httpClient.post<{ status?: string }>(
          '/api/v1/sdk/init',
          undefined,
          {
            headers: {
              'x-api-key': apiKey,
            },
          }
        );

        if (response.status !== 200 || response.data?.status !== 'ok') {
          throw new AuthenticationError('SDK initialization rejected by server.', response.data);
        }

        return;
      } catch (error: any) {
        const isLastAttempt = attempt === retryCount;
        const shouldRetry =
          !isLastAttempt &&
          (
            Boolean(error?.request && !error?.response) ||
            (typeof error?.response?.status === 'number' && error.response.status >= 500)
          );

        if (shouldRetry) {
          await this.sleep(retryDelay);
          continue;
        }

        if (error instanceof API2Error) {
          throw error;
        }

        if (error.response) {
          const { status, data } = error.response;
          if (status === 401 || status === 403) {
            throw new AuthenticationError(data?.message || 'SDK initialization unauthorized.', data);
          }
          if (status >= 400 && status < 500) {
            throw new ClientError(data?.message || 'SDK initialization client error.', status, data);
          }
          if (status >= 500) {
            throw new ServerError(data?.message || 'SDK initialization server error.', status, data);
          }
        } else if (error.request) {
          const baseURL = Config.getInstance().get('baseURL') as string;
          throw new NetworkError(
            `No response received during SDK initialization (${baseURL}/api/v1/sdk/init). Check CORS, protocol (http/https), and network reachability.`,
            error.request
          );
        }

        throw new API2Error('SDK initialization failed.', undefined, error?.message);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    if (!ms || ms <= 0) return Promise.resolve();
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private hasAccessToken(): boolean {
    const token = Config.getInstance().get('accessToken') as string | undefined;
    return Boolean(token);
  }

  private requiresAccessToken(url: string): boolean {
    return ![
      '/api/v1/sdk/init',
      '/api/v1/authentication/identity/callback',
    ].includes(url);
  }
}

export default APIClient;
