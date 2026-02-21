
import { Config, SDKConfig } from './core/config';
import APIClient from './core/client';
import { UserAPI } from './api/user';
import { ConfigAPI } from './api/config';
import { DocsAPI } from './api/docs';
import { TableAPI } from './api/table';
import {AuthAPI} from './api/auth';
import { DataAPI } from './api/data';
import { EncoderAPI } from './api/encoder'; 
import { PermissionManager } from './core/permissions';
import { DynamicAPI } from './api/dynamic';
import { RoleAPI } from './api/role';
import { GroupAPI } from './api/group';
import { WorkflowAPI } from './api/workflow';

export { PermissionManager } from './core/permissions';
export type { PermissionMatrix } from './core/permissions';
export { DynamicAPI } from './api/dynamic';
export { RoleAPI } from './api/role';
export { GroupAPI } from './api/group';
export { WorkflowAPI } from './api/workflow';

class API2 {
  user: UserAPI;
  config: ConfigAPI;
  docs: DocsAPI;
  table: TableAPI;
  auth: AuthAPI;
  data: DataAPI;
  encoder: EncoderAPI;
  client: APIClient;
  permissions: PermissionManager;
  dynamic: DynamicAPI;
  roles: RoleAPI;
  groups: GroupAPI;
  workflows: WorkflowAPI;

  constructor(configuration: SDKConfig) {
    Config.initialize(configuration);
    const client = new APIClient();
    const permissions = new PermissionManager();
    const dynamic = new DynamicAPI(client);
    this.user = new UserAPI(client);
    this.config = new ConfigAPI(client);
    this.docs = new DocsAPI(client);
    this.table = new TableAPI(client);
    this.auth = new AuthAPI(client, permissions, async () => {
      await dynamic.refresh();
    });
    this.encoder = new EncoderAPI(client);
    this.data = new DataAPI(client, this.encoder);
    this.dynamic = dynamic;
    this.roles = new RoleAPI(client);
    this.groups = new GroupAPI(client);
    this.workflows = new WorkflowAPI(client);
    this.client = client;
    this.permissions = permissions;
  }
}

export default API2;
