import APIClient from '../core/client';

export interface GroupPayload {
    name: string;
    description?: string;
}

export class GroupAPI {
    constructor(private client: APIClient) {}

    getGroup(groupId: string) {
        return this.client.request('GET', `/api/v1/groups/${groupId}`);
    }

    listGroups(queryParams?: Record<string, any>) {
        return this.client.request('GET', '/api/v1/groups', { params: queryParams });
    }

    createGroup(groupData: GroupPayload) {
        return this.client.request('POST', '/api/v1/groups', groupData);
    }

    updateGroup(groupId: string, groupData: Partial<GroupPayload>) {
        return this.client.request('PUT', `/api/v1/groups/${groupId}`, groupData);
    }

    deleteGroup(groupId: string) {
        return this.client.request('DELETE', `/api/v1/groups/${groupId}`);
    }
}

