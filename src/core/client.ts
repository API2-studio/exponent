
import { Config } from './config';
import { AuthenticationError, ClientError, ServerError, NetworkError, API2Error } from './errors';

class APIClient {
  private baseURL: string;
  private timeout: number;
  private sdkInitPromise: Promise<void>;
  private sdkInitError?: unknown;
  private sdkInitCompleted = false;

  constructor() {
    const config = Config.getInstance();
    this.baseURL = config.get('baseURL') as string;
    this.timeout = config.get('timeout') as number;

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

    return this.performRequest<T>(method, url, data);
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
        const response = await this.performRequest<{ status?: string }>(
          'POST',
          '/api/v1/sdk/init',
          undefined,
          { 'x-api-key': apiKey },
          true
        );

        if (response?.status !== 'ok') {
          throw new AuthenticationError('SDK initialization rejected by server.', response);
        }

        return;
      } catch (error: any) {
        const isLastAttempt = attempt === retryCount;
        const shouldRetry =
          !isLastAttempt &&
          (error instanceof NetworkError || error instanceof ServerError);

        if (shouldRetry) {
          await this.sleep(retryDelay);
          continue;
        }

        if (error instanceof API2Error) {
          if (error instanceof ClientError && error.statusCode === 403) {
            throw new AuthenticationError(error.message || 'SDK initialization unauthorized.', error.details);
          }
          throw error;
        }

        throw new API2Error('SDK initialization failed.', undefined, error?.message);
      }
    }
  }

  private async performRequest<T>(
    method: string,
    url: string,
    data?: any,
    extraHeaders?: Record<string, string>,
    skipAuthHeader = false
  ): Promise<T> {
    const requestURL = this.buildRequestURL(method, url, data);
    const uppercaseMethod = method.toUpperCase();
    const headers: Record<string, string> = { ...(extraHeaders || {}) };
    const body = this.buildRequestBody(uppercaseMethod, data, headers);

    const accessToken = Config.getInstance().get('accessToken') as string | undefined;
    if (!skipAuthHeader && !this.isSDKInitEndpoint(url) && accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete headers.Authorization;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(requestURL, {
        method: uppercaseMethod,
        headers,
        body,
        signal: controller.signal,
      });

      const parsedBody = await this.parseResponseBody(response);
      if (response.ok) {
        return parsedBody as T;
      }

      if (response.status === 401) {
        throw new AuthenticationError((parsedBody as any)?.message || 'Unauthorised', parsedBody);
      }
      if (response.status >= 400 && response.status < 500) {
        throw new ClientError((parsedBody as any)?.message || 'Client error occurred', response.status, parsedBody);
      }
      if (response.status >= 500) {
        throw new ServerError((parsedBody as any)?.message || 'Server error occurred', response.status, parsedBody);
      }

      throw new API2Error('An unknown error occurred.', response.status, parsedBody);
    } catch (error: any) {
      if (error instanceof API2Error) {
        throw error;
      }

      throw new NetworkError(
        `No response received from the server (${requestURL}). Check CORS, protocol (http/https), and network reachability.`,
        error
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildRequestURL(method: string, url: string, data?: any): string {
    const requestURL = new URL(url, this.baseURL);
    const upperMethod = method.toUpperCase();

    if (upperMethod === 'GET' || upperMethod === 'HEAD') {
      const queryData = this.extractQueryData(data);
      if (queryData && typeof queryData === 'object') {
        Object.entries(queryData).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (Array.isArray(value)) {
            value.forEach((item) => requestURL.searchParams.append(key, String(item)));
            return;
          }
          requestURL.searchParams.append(key, String(value));
        });
      }
    }

    return requestURL.toString();
  }

  private buildRequestBody(method: string, data: any, headers: Record<string, string>): BodyInit | undefined {
    if (method === 'GET' || method === 'HEAD' || data === undefined) {
      return undefined;
    }

    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return data;
    }
    if (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams) {
      return data;
    }
    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      return data;
    }
    if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
      return data;
    }
    if (typeof data === 'string') {
      return data;
    }

    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    return JSON.stringify(data);
  }

  private extractQueryData(data: any): Record<string, any> | undefined {
    if (!data || typeof data !== 'object') {
      return undefined;
    }

    if (data.params && typeof data.params === 'object') {
      return data.params as Record<string, any>;
    }

    return data as Record<string, any>;
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    if (response.status === 204) return undefined;

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        return undefined;
      }
    }

    const text = await response.text();
    return text.length ? text : undefined;
  }

  private isSDKInitEndpoint(url: string): boolean {
    return url === '/api/v1/sdk/init' || url.endsWith('/api/v1/sdk/init');
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
