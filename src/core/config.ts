
export interface SDKConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  permissions?: Record<string, string[]>;
}

export class Config {
  private static instance: Config;
  private config: SDKConfig;

  private constructor(config: SDKConfig) {
    this.config = {
      baseURL: 'http://localhost',
      timeout: 10000,
      retryCount: 3,
      retryDelay: 1000,
      permissions: {},
      ...config,
    };
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
  }
}
