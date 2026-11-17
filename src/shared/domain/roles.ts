export const UserRole = {
  User: 'user',
  Admin: 'admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const USER_ROLES: UserRole[] = [UserRole.User, UserRole.Admin];

export function isAdminRole(role: string | undefined): boolean {
  return role === UserRole.Admin;
}
