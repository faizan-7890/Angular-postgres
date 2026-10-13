import { Injectable, signal, computed } from '@angular/core';
import { Clerk } from '@clerk/clerk-js';
import { environment } from '../../../environments/environment';
import { ClerkUserProfile, UserRole } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class ClerkAuthService {
  private clerkInstance: Clerk | null = null;
  private publishableKey: string = '';

  // Signals
  readonly isLoaded = signal<boolean>(false);
  readonly isSignedIn = signal<boolean>(false);
  readonly isDevMode = signal<boolean>(false);
  readonly user = signal<ClerkUserProfile | null>(null);
  readonly userRole = signal<UserRole>('ADMIN');

  // Computed permissions
  readonly canCreateAssets = computed(() => ['ADMIN', 'MANAGER'].includes(this.userRole()));
  readonly canDeleteAssets = computed(() => this.userRole() === 'ADMIN');
  readonly canManageWorkOrders = computed(() => ['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(this.userRole()));
  readonly canApproveWorkOrders = computed(() => ['ADMIN', 'MANAGER'].includes(this.userRole()));
  readonly canManageInventory = computed(() => ['ADMIN', 'MANAGER'].includes(this.userRole()));
  readonly canManageUsers = computed(() => this.userRole() === 'ADMIN');

  constructor() {
    this.initClerk();
  }

  async initClerk(): Promise<void> {
    // Check environment first, fallback to localStorage if user configured via UI
    this.publishableKey =
      environment.clerkPublishableKey ||
      localStorage.getItem('CLERK_PUBLISHABLE_KEY') ||
      '';

    const isRealKey =
      this.publishableKey &&
      !this.publishableKey.includes('placeholder') &&
      this.publishableKey.startsWith('pk_');

    if (!isRealKey) {
      // Setup Dev Mode default
      this.isDevMode.set(true);
      const savedRole = (localStorage.getItem('DEV_USER_ROLE') as UserRole) || 'ADMIN';
      this.setDevUser(savedRole);
      this.isLoaded.set(true);
      return;
    }

    try {
      this.clerkInstance = new Clerk(this.publishableKey);
      await this.clerkInstance.load({
        // Standard appearance customization for dark/light consistency
      });

      this.isLoaded.set(true);
      this.isDevMode.set(false);
      this.syncClerkState();

      // Listen for Clerk auth state changes (login, logout, session refresh)
      this.clerkInstance.addListener(() => {
        this.syncClerkState();
      });
    } catch (err) {
      console.error('Failed to initialize Clerk. Falling back to Dev Mode:', err);
      this.isDevMode.set(true);
      this.setDevUser('ADMIN');
      this.isLoaded.set(true);
    }
  }

  private syncClerkState(): void {
    if (!this.clerkInstance) return;

    const clerkUser = this.clerkInstance.user;
    if (clerkUser) {
      this.isSignedIn.set(true);
      const meta = (clerkUser.publicMetadata as Record<string, any>) || {};
      const role: UserRole = meta['role'] || 'ADMIN';

      const profile: ClerkUserProfile = {
        id: clerkUser.id,
        fullName:
          `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
          clerkUser.primaryEmailAddress?.emailAddress ||
          'Ops User',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        imageUrl: clerkUser.imageUrl,
        role,
      };

      this.user.set(profile);
      this.userRole.set(role);
    } else {
      this.isSignedIn.set(false);
      this.user.set(null);
      this.userRole.set('VIEWER');
    }
  }

  /**
   * Set developer mock role for rapid local testing
   */
  setDevUser(role: UserRole): void {
    this.userRole.set(role);
    this.isSignedIn.set(true);
    localStorage.setItem('DEV_USER_ROLE', role);

    const names: Record<UserRole, string> = {
      ADMIN: 'Dev Administrator',
      MANAGER: 'Dev Maintenance Supervisor',
      TECHNICIAN: 'Dev Field Technician',
      VIEWER: 'Dev Read-Only Auditor',
    };

    this.user.set({
      id: `dev-${role.toLowerCase()}-id`,
      fullName: names[role],
      email: `${role.toLowerCase()}@opstrack.internal`,
      role,
    });
  }

  /**
   * Returns current JWT session token for API requests
   */
  async getToken(): Promise<string> {
    if (this.isDevMode()) {
      return `dev-token-${this.userRole().toLowerCase()}`;
    }

    if (this.clerkInstance?.session) {
      const token = await this.clerkInstance.session.getToken();
      return token || '';
    }

    return '';
  }

  /**
   * Mount Clerk sign-in card into a DOM element
   */
  mountSignIn(element: HTMLDivElement): void {
    if (this.clerkInstance) {
      this.clerkInstance.mountSignIn(element);
    }
  }

  /**
   * Mount Clerk user button (avatar & profile dropdown) into a DOM element
   */
  mountUserButton(element: HTMLDivElement): void {
    if (this.clerkInstance) {
      this.clerkInstance.mountUserButton(element);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    if (this.clerkInstance) {
      await this.clerkInstance.signOut();
    } else {
      this.isSignedIn.set(false);
      this.user.set(null);
    }
  }

  /**
   * Saves custom publishable key from UI and re-inits
   */
  savePublishableKey(key: string): void {
    localStorage.setItem('CLERK_PUBLISHABLE_KEY', key.trim());
    this.publishableKey = key.trim();
    this.initClerk();
  }

  hasRole(roles: UserRole[]): boolean {
    return roles.includes(this.userRole());
  }
}
