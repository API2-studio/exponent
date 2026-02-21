// Auth API 
import APIClient from '../core/client';
import { PermissionManager, PermissionMatrix } from '../core/permissions';

export interface Role {
    id: string,
    name: string,
    description: string,
    registrable: boolean,
    permissions: [{
        [PermissionName: string]: [
            [Permission: string]
        ] 
    }]
}

export interface UserRegistration {
    id: string,
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    user_roles: [role_id: string],
    avatar: File
}


export interface AuthData {
    token: string
}

export interface Token {
    token: string
}

export interface PasswordReset {
    email: string
}

export interface PasswordResetToken {
    token: string
}

export interface PasswordResetConfirm {
    token: string,
    password: string,
    password_confirmation: string
}

export interface UserRoles {
    user_id: string,
    role_id: string
}

export interface RoleRegistrable {
    registrable: boolean
}

export interface RegistrableRoles {
    roles: [Role]
}

export interface RolePermissions {
    permissions: [{
        [PermissionName: string]: [
            [Permission: string]
        ] 
    }]
}

export interface RolePermission {
    permission: string
}

export interface Password {
    password: string
}

export interface PasswordConfirmation {
    password_confirmation: string
}

export interface AuthUser {
    id: string,
    name: string,
    email: string,
    avatar: string,
    avatar_url: string,
    inserted_at: string,
    updated_at: string,
    deleted_at: string,
    archived_at: string
}

export interface AuthResponse {
    data: {
        token: string,
        permissions: PermissionMatrix | string[],
        user: AuthUser
    }
}



export class AuthAPI {
    constructor(
        private client: APIClient,
        private permissions: PermissionManager,
        private onLogin?: () => Promise<void> | void,
    ) {}

    setToken(token: string) {
        const config = this.client.getConfig();
        config.set('accessToken', token);
    }

    async login(email: string, password: string) {
        const payload = {
            user: {
                email,
                password
            }
        }
        const response = await this.client.request<AuthResponse>('POST', '/api/v1/authentication/identity/callback', payload);
        const { token, permissions } = response.data;
        this.setToken(token);
        this.permissions.setPermissions(permissions);
        if (this.onLogin) {
            await this.onLogin();
        }
        return response;
    }

    logout(token?: string) {
        const config = this.client.getConfig();
        const revokeToken = token || (config.get('accessToken') as string | undefined);

        const clearSession = () => {
            config.set('accessToken', undefined);
            this.permissions.clear();
        };

        if (!revokeToken) {
            clearSession();
            return Promise.resolve();
        }

        return this.client.request('POST', '/api/v1/authentication/identity/revoke', { token: revokeToken })
            .finally(() => {
                clearSession();
            });
    }

    register(userData: UserRegistration) {
        return this.client.request('POST', '/api/v1/users', userData);
    }

    // Check if role is registrable or not 
    checkRoleRegistrable(roleId: string) {
        this.client.request('GET', `/api/v1/roles/${roleId}`).then((role: any) => {
            return role.registrable;
        });    
    }

    // Get all registrable roles
    listRegistrableRoles() {
        return this.client.request('GET', '/api/v1/roles?registrable=true');
    }

    // TODO: Implement the rest of the methods (password reset, etc.)
}
