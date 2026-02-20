import APIClient from '../core/client';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';

export interface DynamicCallArgs {
  pathParams?: Record<string, string | number>;
  query?: Record<string, any>;
  body?: any;
}

export type DynamicFunction = (args?: DynamicCallArgs) => Promise<any>;

export class DynamicAPI {
  endpoints: Record<string, DynamicFunction> = {};

  constructor(
    private client: APIClient,
    private schemaUrl = '/api/v1/api/openapi'
  ) {}

  /** Fetch OpenAPI spec and rebuild the function map. */
  async refresh(): Promise<Record<string, DynamicFunction>> {
    const spec = await this.client.request<any>('GET', this.schemaUrl);
    this.buildFromSpec(spec);
    return this.endpoints;
  }

  private buildFromSpec(spec: any) {
    this.endpoints = {};
    if (!spec?.paths) return;

    Object.entries<any>(spec.paths).forEach(([path, methods]) => {
      Object.entries<any>(methods || {}).forEach(([method, def]) => {
        const httpMethod = method.toLowerCase() as HttpMethod;
        const name = this.buildName(def?.operationId, httpMethod, path);
        this.endpoints[name] = (args: DynamicCallArgs = {}) => {
          const url = this.buildUrl(path, args.pathParams, args.query);
          const payload = httpMethod === 'get' || httpMethod === 'delete' ? undefined : args.body;
          return this.client.request(httpMethod.toUpperCase(), url, payload);
        };
      });
    });
  }

  private buildName(operationId: string | undefined, method: string, path: string): string {
    if (operationId) return this.toCamel(operationId);
    const raw = `${method}_${path}`.replace(/[{}/]+/g, '_');
    return this.toCamel(raw.replace(/_+/g, '_'));
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
}

