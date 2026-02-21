// Docs helper endpoints 
import API2Client from '../core/client';

export class DocsAPI {
  constructor(private client: API2Client) {}

    //   Get mermaid diagram for database 
    getMermaidDiagram() {
        return this.client.request('GET', '/api/v1/docs/mermaid');
    }

    // Get mermaid diagram for table 
    getTableMermaidDiagram(tableId: string) {
        return this.client.request('GET', `/api/v1/docs/mermaid/${tableId}`);
    }

    // Get openAPI schema
    getOpenAPISchema() {
        return this.client.request('GET', '/api/v1/api/openapi');
    }

    // Get DBML for database
    getDBML() {
        return this.client.request('GET', '/api/v1/docs/dbml');
    }

    // Get DBML for table
    getTableDBML(tableId: string) {
        return this.client.request('GET', `/api/v1/docs/dbml/${tableId}`);
    }
}