import APIClient from '../core/client';

export type WorkflowActionData = Record<string, unknown>;

export interface WorkflowTrigger {
    event_source: string;
    event_type: string;
    table_name?: string;
    [key: string]: unknown;
}

/**
 * A workflow task. Tasks can be chained or branched recursively.
 */
export interface WorkflowTask {
    name: string;
    action: string;
    action_data?: WorkflowActionData;
    initial?: boolean;
    condition?: string;
    next_task?: WorkflowTask;
    on_true?: WorkflowTask;
    on_false?: WorkflowTask;
}

export interface WorkflowPayload {
    name: string;
    description?: string;
    status?: string;
    repeatable?: boolean;
    triggers?: WorkflowTrigger[];
    tasks?: WorkflowTask[];
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
