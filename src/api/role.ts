import APIClient from '../core/client';

export interface RolePayload {
    name: string;
    description?: string;
    registrable?: boolean;
    permissions?: Record<string, string[]>;
}

export class RoleAPI {
    constructor(private client: APIClient) {}

    getRole(roleId: string) {
        return this.client.request('GET', `/api/v1/roles/${roleId}`);
    }

    listRoles(queryParams?: Record<string, any>) {
        return this.client.request('GET', '/api/v1/roles', { params: queryParams });
    }

    createRole(roleData: RolePayload) {
        return this.client.request('POST', '/api/v1/roles', roleData);
    }

    updateRole(roleId: string, roleData: Partial<RolePayload>) {
        return this.client.request('PUT', `/api/v1/roles/${roleId}`, roleData);
    }

    deleteRole(roleId: string) {
        return this.client.request('DELETE', `/api/v1/roles/${roleId}`);
    }
}
