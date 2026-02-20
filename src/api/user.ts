
import APIClient from '../core/client';


export class UserAPI {
  constructor(private client: APIClient) {}

  getUser(userId: string) {
    return this.client.request('GET', `/api/v1/users/${userId}`);
  }

  listUsers(queryParams?: Record<string, any>) {
    return this.client.request('GET', '/api/v1/users', { params: queryParams });
  }

  createUser(userData: any) {
    return this.client.request('POST', '/api/v1/users', userData);
  }

  updateUser(userId: string, userData: any) {
    return this.client.request('PUT', `/api/v1/users/${userId}`, userData);
  }

  deleteUser(userId: string) {
    return this.client.request('DELETE', `/api/v1/users/${userId}`);
  } 
}
