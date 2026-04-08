import APIClient from '../core/client';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';
type SortDirection = 'asc' | 'desc';

export interface DynamicCallArgs {
  pathParams?: Record<string, string | number>;
  query?: Record<string, any>;
  body?: any;
}

export type DynamicFunction = (args?: DynamicCallArgs) => Promise<any>;

interface EndpointListParams {
  limit: number;
  offset: number;
  page: number;
  page_size: number;
  sort_field: string;
  sort_direction: SortDirection;
}

interface EndpointRecord {
  id?: string;
  url?: string;
  method?: string;
  description?: string;
  enabled?: boolean;
}

interface EndpointListResponse {
  data?: EndpointRecord[];
}

export class DynamicAPI {
  endpoints: Record<string, DynamicFunction> = {};
  private static readonly ENDPOINTS_STORAGE_KEY_PREFIX = 'api2_sdk_dynamic_endpoints:';
  private readonly defaultListParams: EndpointListParams = {
    limit: 1000000,
    offset: 0,
    page: 1,
    page_size: 10000,
    sort_field: 'inserted_at',
    sort_direction: 'asc',
  };

  constructor(
    private client: APIClient,
    private endpointsUrl = '/api/v1/endpoints'
  ) {
    const cachedEndpoints = this.readStoredEndpoints();
    this.buildFromEndpointList(cachedEndpoints);

    // Best-effort bootstrap: load public endpoints as soon as SDK is initialized.
    void this.refreshPublic().catch(() => undefined);
  }

  /** Fetch publicly available endpoint definitions and rebuild the function map. */
  async refreshPublic(params: Partial<EndpointListParams> = {}): Promise<Record<string, DynamicFunction>> {
    return this.refreshInternal(params, false);
  }

  /** Fetch authenticated endpoint definitions and rebuild the function map. */
  async refresh(params: Partial<EndpointListParams> = {}): Promise<Record<string, DynamicFunction>> {
    return this.refreshInternal(params, true);
  }

  private async refreshInternal(
    params: Partial<EndpointListParams>,
    requireAuth: boolean
  ): Promise<Record<string, DynamicFunction>> {
    const accessToken = this.client.getConfig().get('accessToken') as string | undefined;
    if (requireAuth && !accessToken) {
      throw new Error('DynamicAPI.refresh requires an access token. Call api.auth.login(...) before refresh().');
    }

    const requestParams = { ...this.defaultListParams, ...params };
    const url = this.buildUrl(this.endpointsUrl, undefined, requestParams);
    const response = await this.client.request<EndpointListResponse>('GET', url);
    const records = response?.data || [];

    this.buildFromEndpointList(records);
    this.storeEndpoints(records);
    return this.endpoints;
  }

  private buildFromEndpointList(records?: EndpointRecord[]) {
    this.endpoints = {};
    if (!records?.length) return;

    records.forEach((endpoint) => {
      if (!endpoint?.url || !endpoint?.method) return;
      if (endpoint.enabled === false) return;

      const method = endpoint.method.toLowerCase();
      if (!this.isHttpMethod(method)) return;

      const httpMethod = method;
      const name = this.buildName(endpoint.description, httpMethod, endpoint.url);
      const hasCollision = Boolean(this.endpoints[name]);

      const call: DynamicFunction = (args: DynamicCallArgs = {}) => {
        const url = this.buildUrl(endpoint.url as string, args.pathParams, args.query);
        const payload = httpMethod === 'get' || httpMethod === 'delete' ? undefined : args.body;
        return this.client.request(httpMethod.toUpperCase(), url, payload);
      };
      this.endpoints[name] = call;

      // Keep generated names unique even if descriptions or paths collide.
      if (endpoint.id && hasCollision) {
        this.endpoints[`${name}_${endpoint.id.replace(/-/g, '')}`] = call;
      }
    });
  }

  private buildName(description: string | undefined, method: string, path: string): string {
    if (description) {
      return this.toCamel(description);
    }
    const raw = `${method}_${path}`.replace(/[{}/]+/g, '_');
    return this.toCamel(raw.replace(/_+/g, '_'));
  }

  private isHttpMethod(method: string): method is HttpMethod {
    return ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method);
  }

  private toCamel(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9]+(.)/g, (_m, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
  }

  private buildUrl(pathTemplate: string, pathParams?: Record<string, string | number>, query?: Record<string, any>): string {
    let url = pathTemplate;
    if (pathParams) {
      url = url.replace(/{(.*?)}/g, (_match, key) => encodeURIComponent(String(pathParams[key] ?? `{${key}}`)));
    }

    const qs = this.buildQuery(query);
    return qs ? `${url}?${qs}` : url;
  }

  private buildQuery(query?: Record<string, any>): string {
    if (!query) return '';
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    });
    return params.toString();
  }

  private storeEndpoints(records: EndpointRecord[]): void {
    const storage = this.getStorage();
    if (!storage) return;
    storage.setItem(this.getStorageKey(), JSON.stringify(records));
  }

  private readStoredEndpoints(): EndpointRecord[] {
    const storage = this.getStorage();
    if (!storage) return [];
    const raw = storage.getItem(this.getStorageKey());
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private getStorageKey(): string {
    const baseURL = this.client.getConfig().get('baseURL') as string | undefined;
    return `${DynamicAPI.ENDPOINTS_STORAGE_KEY_PREFIX}${baseURL || 'default'}`;
  }

  private getStorage(): Storage | undefined {
    if (typeof window === 'undefined' || !window.localStorage) {
      return undefined;
    }
    return window.localStorage;
  }
}
