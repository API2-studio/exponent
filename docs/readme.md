## API2 SDK Reference & Examples

### Quickstart
```ts
import API2 from '../src';

const api = new API2({
  apiKey: 'YOUR_TOKEN',
  baseURL: 'https://api2.example.com',
  timeout: 10000,
});

await api.auth.login('user@example.com', 'password'); // sets token + permissions
```

### Core Concepts
- `api.client`: Axios-backed client with bearer auth.
- `Config` singleton stores `apiKey`, `baseURL`, `timeout`, and cached `permissions`.
- Permission checks before rendering UI:
  ```ts
  if (api.permissions.has('tables:create')) showCreateButton();
  if (api.permissions.hasAll(['tables:read', 'tables:create'])) renderTable();
  ```

---

### Auth (`src/api/auth.ts`)
- `login(email, password)` → sets token + permissions.
- `logout(token)`
- `register(userData)`
- `checkRoleRegistrable(roleId)`
- `listRegistrableRoles()`

```ts
await api.auth.login(email, password);
api.permissions.hasAny(['groups:create', 'groups:update']);
```

### Users (`src/api/user.ts`)
- `getUser(id)`
- `listUsers(query?)`
- `createUser(data)`
- `updateUser(id, data)`
- `deleteUser(id)`

```ts
const users = await api.user.listUsers({ limit: 20 });
```

### Tables (`src/api/table.ts`)
- `getTable(id)` / `getTableByName(name)`
- `listTables(query?)`
- `createTable(payload)`
- `updateTable(payload)`
- `deleteTable(id)`

```ts
const table = await api.table.getTable('tbl_123');
await api.table.createTable({
  action: 'create',
  type: 'table',
  body: { name: 'projects', parent: 'root', schema: [] },
});
```

### Base Tables (`groups`, `roles`, `workflows`)
- Roles (`src/api/role.ts`): `getRole`, `listRoles`, `createRole`, `updateRole`, `deleteRole`
- Groups (`src/api/group.ts`): `getGroup`, `listGroups`, `createGroup`, `updateGroup`, `deleteGroup`
- Workflows (`src/api/workflow.ts`): `getWorkflow`, `listWorkflows`, `createWorkflow`, `updateWorkflow`, `deleteWorkflow`

```ts
const roles = await api.roles.listRoles();
await api.groups.createGroup({ name: 'QA', description: 'Testers' });
await api.workflows.updateWorkflow('flow_1', { status: 'active' });
```

### Data & Encoder (`src/api/data.ts`, `src/api/encoder.ts`)
- Data: `listData(tableId, query)`, `getData(id, query)`, `createData(data)`, `updateData(id, data)`, `deleteData(id)`
- Encoder helpers (exposed via Data): `setQueryType`, `setJoinType`, `setTableReference`, `setTargetColumn`, `setLocalColumn`, `setOrderBy`, `setOrderSymbol`, `setLimit`, `setOffset`, `setGroupedBy`, `setCondition`, `setAnd`, `setOr`, `setOpenParentheses`, `setCloseParentheses`, `addJoin`, `getEncoded`, `encoderReset`

```ts
api.data.encoderReset();
api.data.setQueryType('select');
api.data.setTableReference('tasks');
api.data.setCondition({ identifier: 'status', operator: '=', value: 'open' });
const encoded = api.data.getEncoded();

const tasks = await api.data.listData('tasks', { encoded });
```

### Docs (`src/api/docs.ts`)
- `getMermaidDiagram()`
- `getTableMermaidDiagram(tableId)`
- `getOpenAPISchema()`
- `getDBML()`
- `getTableDBML(tableId)`

```ts
const openapi = await api.docs.getOpenAPISchema();
```

### Config (`src/api/config.ts`)
- `getConfig(id)`
- `listConfigs()`
- `createConfig(data)`
- `updateConfig(data, id)`
- `deleteConfig(id)`

### Dynamic Endpoints (`src/api/dynamic.ts`)
- `await api.dynamic.refresh()` pulls OpenAPI and builds functions at `api.dynamic.endpoints`.
- Call signature: `fn({ pathParams?, query?, body? })`.

```ts
await api.dynamic.refresh();
const users = await api.dynamic.endpoints.getApiV1Users();
const user = await api.dynamic.endpoints.getApiV1UsersId({ pathParams: { id: '123' } });
const created = await api.dynamic.endpoints.postApiV1Users({ body: { name: 'Jane' } });
```

### Permissions (`src/core/permissions.ts`)
- `setPermissions(matrixOrList)`
- `has(code)`, `hasAll(list)`, `hasAny(list)`
- `clear()`, `getPermissions()`

```ts
api.permissions.setPermissions({ tables: ['read', 'create'] });
if (api.permissions.has('tables:create')) { /* render */ }
```

### Error Handling
- Requests throw typed errors (`AuthenticationError`, `ClientError`, `ServerError`, `NetworkError`, `API2Error`). Wrap calls with try/catch.

### Tips
- Call `refresh()` on `dynamic` after login if the spec depends on auth.
- Cache your `api` instance; `Config` and `PermissionManager` are singletons.
- `baseURL` defaults to `http://localhost` if not provided.
