export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'VIEWER';

export interface AuthenticatedUser {
  userId: string;
  email?: string;
  fullName?: string;
  role: UserRole;
  technicianId?: string;
}
