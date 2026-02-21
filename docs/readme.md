## API2 SDK Reference & Examples

### Quickstart
```ts
import API2 from '../src';

const api = new API2({
  apiKey: 'YOUR_TOKEN',
  baseURL: 'https://api2.example.com',
  timeout: 10000,
});

await api.auth.login('user@example.com', 'password'); // sets access token + permissions
```

### Core Concepts
- `api.client`: Axios-backed client; sends `x-api-key` from config and `Authorization: Bearer <accessToken>` after login.
- SDK auto-initializes via `POST /api/v1/sdk/init` using `x-api-key: <apiKey>`. Requests are blocked unless init returns HTTP `200` with `{ status: 'ok' }`.
- All requests require login first, except SDK init and the login endpoint itself.
- `Config` singleton stores `apiKey`, `baseURL`, `timeout`, and cached `permissions`.
- `accessToken` is persisted in browser `localStorage` after login and restored on page refresh until `logout()` is called.
- Permission checks before rendering UI:
  ```ts
  if (api.permissions.has('tables:create')) showCreateButton();
  if (api.permissions.hasAll(['tables:read', 'tables:create'])) renderTable();
  ```

---

### Auth (`src/api/auth.ts`)
- `login(email, password)` → sets access token + permissions, then auto-refreshes dynamic endpoints.
- `logout(token?)`
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
  type: 'structure',
  body: { name: 'projects', parent: 'root', schema: [] },
});
```

### Base Tables (`groups`, `roles`, `workflows`)
- Roles (`src/api/role.ts`): `getRole`, `listRoles`, `createRole`, `updateRole`, `deleteRole`
- Groups (`src/api/group.ts`): `getGroup`, `listGroups`, `createGroup`, `updateGroup`, `deleteGroup`
- Workflows (`src/api/workflow.ts`): `getWorkflow`, `listWorkflows`, `createWorkflow`, `updateWorkflow`, `deleteWorkflow`

```ts
const roles = await api.roles.listRoles();
await api.groups.createGroup({ name: 'QA' });
await api.workflows.updateWorkflow('9cac5fac-e862-4f90-ab04-c6e023a87313', { status: 'active' });
```

### Data & Encoder (`src/api/data.ts`, `src/api/encoder.ts`)
- Data: `listData(tableId, query)`, `getData(id, query)`, `createData(data)`, `updateData(id, data)`, `deleteData(id)`
- Encoder helpers (exposed via Data): `setQueryType`, `setJoinType`, `setTableReference`, `setTargetColumn`, `setLocalColumn`, `setOrderBy`, `setOrderSymbol`, `setLimit`, `setOffset`, `setGroupedBy`, `setCondition`, `setAnd`, `setOr`, `setOpenParentheses`, `setCloseParentheses`, `addJoin`, `getEncoded`, `encoderReset`

```ts
api.data.encoderReset();
api.data.setQueryType('condition');
api.data.setTableReference('tasks');
api.data.setCondition({ identifier: 'status', operator: '=', value: 'open' });
const encoded = api.data.getEncoded();

const tasks = await api.data.listData('9cac5fac-e862-4f90-ab04-c6e023a87313', { encoded });
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
- `login()` automatically calls `dynamic.refresh()` after successful authentication.
- `await api.dynamic.refresh()` is still available to manually re-sync endpoint definitions from `/api/v1/endpoints`.
- `refresh()` includes required list params: `limit`, `offset`, `page`, `page_size`, `sort_field`, `sort_direction`.
- `refresh()` requires an auth access token (call `api.auth.login(...)` first).
- Dynamic endpoint definitions are cached in browser `localStorage`, so generated functions are restored after page refresh.
- Call signature: `fn({ pathParams?, query?, body? })`.
- Function names are generated from endpoint descriptions (fallback: method + path).

```ts
await api.auth.login('user@example.com', 'password');

// Optional manual re-sync if endpoints changed server-side
await api.dynamic.refresh({
  page: 1,
  page_size: 50,
  sort_field: 'inserted_at',
  sort_direction: 'asc',
});

// GET example
const users = await api.dynamic.endpoints.getAllUsers({
  query: { limit: 2000, offset: 0, page: 1, page_size: 20, sort_field: 'name', sort_direction: 'asc' },
});

// GET with filters example
const filteredUsers = await api.dynamic.endpoints.getAllUsers({
  query: {
    limit: 2000,
    offset: 0,
    page: 1,
    page_size: 20,
    sort_field: 'inserted_at',
    sort_direction: 'desc',
    name: 'Jane',
  },
});

// GET with path params example
const role = await api.dynamic.endpoints.getARolesById({
  pathParams: { id: '9cac5fac-e862-4f90-ab04-c6e023a87313' },
});

// POST example
const created = await api.dynamic.endpoints.createARole({
  body: { name: 'Editor', permissions: { users: ['read'] }, registerable: false },
});

// PUT example
const replaced = await api.dynamic.endpoints.updateARole({
  pathParams: { id: '9cac5fac-e862-4f90-ab04-c6e023a87313' },
  body: { name: 'Editor', permissions: { users: ['read', 'update'] }, registerable: false },
});

// PATCH example
const patched = await api.dynamic.endpoints.patchARole({
  pathParams: { id: '9cac5fac-e862-4f90-ab04-c6e023a87313' },
  body: { registerable: true },
});

// DELETE example
await api.dynamic.endpoints.deleteARole?.({
  pathParams: { id: '9cac5fac-e862-4f90-ab04-c6e023a87313' },
});

// OPTIONS example (only if such an endpoint exists)
const optionsMeta = await api.dynamic.endpoints.optionsRoles();

// HEAD example (only if such an endpoint exists)
const headMeta = await api.dynamic.endpoints.headRoles();
```

### Permissions (`src/core/permissions.ts`)
- `hasAll(list)`, `hasAny(list)`
- `clear()`, `getPermissions()`

### Error Handling
- Requests throw typed errors (`AuthenticationError`, `ClientError`, `ServerError`, `NetworkError`, `API2Error`). Wrap calls with try/catch.

### Tips
- Call `refresh()` on `dynamic` after login if endpoint visibility depends on auth.
- Cache your `api` instance; `Config` and `PermissionManager` are singletons.
- `baseURL` defaults to `http://localhost` if not provided.
