import APIClient from '../core/client';

export interface WorkflowPayload {
    name: string;
    description?: string;
    status?: string;
}

export class WorkflowAPI {
    constructor(private client: APIClient) {}

    getWorkflow(workflowId: string) {
        return this.client.request('GET', `/api/v1/workflows/${workflowId}`);
    }

    listWorkflows(queryParams?: Record<string, any>) {
        return this.client.request('GET', '/api/v1/workflows', { params: queryParams });
    }

    createWorkflow(workflowData: WorkflowPayload) {
        return this.client.request('POST', '/api/v1/workflows', workflowData);
    }

    updateWorkflow(workflowId: string, workflowData: Partial<WorkflowPayload>) {
        return this.client.request('PUT', `/api/v1/workflows/${workflowId}`, workflowData);
    }

    deleteWorkflow(workflowId: string) {
        return this.client.request('DELETE', `/api/v1/workflows/${workflowId}`);
    }
}

