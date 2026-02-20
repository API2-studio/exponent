import { Config } from './config';

export type PermissionMatrix = Record<string, string[]>;

/**
 * Lightweight permission helper to be used by UI code before rendering components.
 *
 * Permissions are stored as a matrix: `{ resource: ['create', 'read'] }`.
 * Callers can also pass flattened strings like `resource:create`; they will be normalised.
 */
export class PermissionManager {
  private matrix: PermissionMatrix = {};

  constructor(private config: Config = Config.getInstance()) {
    const existing = this.config.get('permissions');
    if (existing) {
      this.setPermissions(existing);
    }
  }

  /**
   * Replace the permission set with a matrix or flat string list.
   * Examples:
   *   setPermissions({ tables: ['read', 'create'] });
   *   setPermissions(['tables:create', 'users.read']);
   */
  setPermissions(permissions: PermissionMatrix | string[]): void {
    this.matrix = this.normalize(permissions);
    this.config.set('permissions', this.matrix);
  }

  /** Get the current permission matrix. */
  getPermissions(): PermissionMatrix {
    return this.matrix;
  }

  /** Remove all permissions. */
  clear(): void {
    this.matrix = {};
    this.config.set('permissions', {});
  }

  /** True if user has the given permission (resource or resource:action). */
  has(permission: string): boolean {
    const { resource, action } = this.parse(permission);
    const actions = this.matrix[resource];
    if (!actions || actions.length === 0) return false;
    if (!action) return true;
    return actions.includes(action) || actions.includes('*');
  }

  /** True if the user has every permission in the list. */
  hasAll(permissions: string[]): boolean {
    return permissions.every((perm) => this.has(perm));
  }

  /** True if the user has at least one permission in the list. */
  hasAny(permissions: string[]): boolean {
    return permissions.some((perm) => this.has(perm));
  }

  private normalize(permissions: PermissionMatrix | string[]): PermissionMatrix {
    if (!Array.isArray(permissions)) {
      return permissions;
    }

    return permissions.reduce<PermissionMatrix>((acc, code) => {
      const { resource, action } = this.parse(code);
      if (!acc[resource]) acc[resource] = [];
      if (action && !acc[resource].includes(action)) {
        acc[resource].push(action);
      }
      return acc;
    }, {});
  }

  private parse(code: string): { resource: string; action?: string } {
    const [resource, action] = code.split(/[:.]/);
    return { resource, action };
  }
}

