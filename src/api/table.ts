
import APIClient from '../core/client';

export interface TableSchema {
    name: string, 
    type: string,
    options?: {
      foreign_key?: boolean,
      references_table?: string,
      references_column?: string,
      relation_type?: string,
      unique?: boolean,
      required?: boolean,
      default?: any
    }
}

export interface TablePermissions {
    [TableName: string]: [
        [PermissionName: string]
    ] 
}

export interface JsonProperty {
    [PropertyName: string]: {
        description: string, 
        type: string,
        format?: string
    }
}

export interface JsonSchema {
    $id: string,
    $schema: string,
    properties: JsonProperty[], 
    required?: [string],
    title: string,
    description?: string,
    type: string, 
    additionalProperties?: boolean
}

export interface TableRelation {
    table: {
        name: string,
        id: string,
        column: string
    },
    references_table: {
        name: string,
        column: string,
        id: string
    },
    relation_type: string
}

export interface Table {
    id: string,
    name: string,
    parent: string,
    schema: TableSchema[],
    permissions: TablePermissions[],
    json_schema: JsonSchema,
    relations?: TableRelation[],
    inserted_at: string,
    updated_at: string,
    deleted_at?: string,
    archived_at?: string
}

export interface Payload {
  action: string,
  type: string,
  body: {
    name: string,
    parent: string,
    schema: TableSchema[],
  }
}

export class TableAPI {
  constructor(private client: APIClient) {}

  getTable(tableId: string) {
    return this.client.request('GET', `/api/v1/structure/${tableId}`);
  }

  listTables(queryParams?: Record<string, any>) {
    return this.client.request('GET', '/api/v1/structure', { params: queryParams });
  }

  createTable(tableData: Payload) {
    return this.client.request('POST', '/api/v1/structure', tableData);
  }

  updateTable(tableData: Payload) {
    return this.client.request('POST', '/api/v1/structure', tableData )
  }

  deleteTable(tableId: string) {
    return this.client.request('DELETE', `/api/v1/tables/${tableId}`);
  }
  
  getTableByName(tableName: string) {
    return this.client.request('GET', `/api/v1/structure/${tableName}`);
  }
}
