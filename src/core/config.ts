
export interface SDKConfig {
  apiKey: string;
  accessToken?: string;
  baseURL?: string;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  permissions?: Record<string, string[]>;
}

export class Config {
  private static instance: Config;
  private config: SDKConfig;
  private static readonly ACCESS_TOKEN_STORAGE_KEY = 'api2_sdk_access_token';

  private constructor(config: SDKConfig) {
    const persistedAccessToken = this.getStoredAccessToken();
    this.config = {
      baseURL: 'http://localhost',
      timeout: 10000,
      retryCount: 3,
      retryDelay: 1000,
      permissions: {},
      accessToken: persistedAccessToken,
      ...config,
    };

    if (this.config.accessToken) {
      this.storeAccessToken(this.config.accessToken);
    }
  }

  public static initialize(config: SDKConfig) {
    if (!Config.instance) {
      Config.instance = new Config(config);
    }
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      throw new Error('Config not initialized. Call Config.initialize() first.');
    }
    return Config.instance;
  }

  // Retrieve configuration values
  public get<Key extends keyof SDKConfig>(key: Key): SDKConfig[Key] {
    return this.config[key];
  }

  // Update configuration values with proper type safety
  public set<Key extends keyof SDKConfig>(key: Key, value: SDKConfig[Key]): void {
    this.config[key] = value;
    if (key === 'accessToken') {
      const token = value as string | undefined;
      if (token) {
        this.storeAccessToken(token);
      } else {
        this.clearStoredAccessToken();
      }
    }
  }

  private getStoredAccessToken(): string | undefined {
    const storage = this.getStorage();
    if (!storage) return undefined;
    const token = storage.getItem(Config.ACCESS_TOKEN_STORAGE_KEY);
    return token || undefined;
  }

  private storeAccessToken(token: string): void {
    const storage = this.getStorage();
    if (!storage) return;
    storage.setItem(Config.ACCESS_TOKEN_STORAGE_KEY, token);
  }

  private clearStoredAccessToken(): void {
    const storage = this.getStorage();
    if (!storage) return;
    storage.removeItem(Config.ACCESS_TOKEN_STORAGE_KEY);
  }

  private getStorage(): Storage | undefined {
    if (typeof window === 'undefined' || !window.localStorage) {
      return undefined;
    }
    return window.localStorage;
  }
}
