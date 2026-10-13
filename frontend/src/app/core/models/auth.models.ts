export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'VIEWER';

export interface ClerkUserProfile {
  id: string;
  fullName: string;
  email: string;
  imageUrl?: string;
  role: UserRole;
  technicianId?: string;
}

export interface UserPermissions {
  canCreateAssets: boolean;
  canDeleteAssets: boolean;
  canManageWorkOrders: boolean;
  canApproveWorkOrders: boolean;
  canManageInventory: boolean;
  canManageUsers: boolean;
}
