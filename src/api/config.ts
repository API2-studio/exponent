
import APIClient from '../core/client';

export class ConfigAPI {
  constructor(private client: APIClient) {}

  getConfig(configId: string) {
    return this.client.request('GET', `/api/v1/configs/${configId}`);
  }

  listConfigs() {
    return this.client.request('GET', '/api/v1/configs');
  }

  createConfig(configData: any) {
    return this.client.request('POST', '/api/v1/configs', configData)
  }

  updateConfig(configData: any, configId: string ) {
    return this.client.request('PUT', `/api/v1/configs/${configId}`, configData)
  }

  deleteConfig(configId: string) {
    return this.client.request('DELETE', `/api/v1/configs/${configId}`)
  }
}
