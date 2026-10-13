import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser, UserRole } from './auth.types';

@Injectable()
export class ClerkService implements OnModuleInit {
  private readonly logger = new Logger(ClerkService.name);
  private clerkClient: ReturnType<typeof createClerkClient> | null = null;
  private secretKey: string = '';
  private publishableKey: string = '';
  private isConfigured: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.secretKey =
      this.configService.get<string>('CLERK_SECRET_KEY') ||
      process.env.CLERK_SECRET_KEY ||
      '';
    this.publishableKey =
      this.configService.get<string>('CLERK_PUBLISHABLE_KEY') ||
      process.env.CLERK_PUBLISHABLE_KEY ||
      '';

    if (
      this.secretKey &&
      !this.secretKey.includes('placeholder') &&
      this.secretKey.startsWith('sk_')
    ) {
      this.clerkClient = createClerkClient({
        secretKey: this.secretKey,
        publishableKey: this.publishableKey,
      });
      this.isConfigured = true;
      this.logger.log('Clerk Backend Client initialized successfully.');
    } else {
      this.logger.warn(
        'CLERK_SECRET_KEY is not configured or is a placeholder. Running in Development/Dev-Bypass mode.',
      );
      this.isConfigured = false;
    }
  }

  get isClerkConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Verifies an incoming Clerk session JWT token
   */
  async verifySessionToken(token: string): Promise<AuthenticatedUser | null> {
    if (!token) return null;

    // Development bypass mode if Clerk credentials are not yet supplied
    if (!this.isConfigured) {
      if (token.startsWith('dev-token-') || token.startsWith('mock-')) {
        const role = token.includes('admin')
          ? 'ADMIN'
          : token.includes('manager')
            ? 'MANAGER'
            : 'TECHNICIAN';
        return {
          userId: 'dev-user-' + role.toLowerCase(),
          email: `${role.toLowerCase()}@opstrack.internal`,
          fullName: `Dev ${role} User`,
          role: role as UserRole,
        };
      }
      // If dev mode and any token provided, accept as default Admin
      return {
        userId: 'dev-admin-user',
        email: 'admin@opstrack.internal',
        fullName: 'Admin User (Dev Mode)',
        role: 'ADMIN',
      };
    }

    try {
      const verified = await verifyToken(token, {
        secretKey: this.secretKey,
      });

      if (!verified || !verified.sub) {
        return null;
      }

      // Fetch user details from Clerk to get up-to-date role & profile metadata
      let role: UserRole = 'TECHNICIAN';
      let email = '';
      let fullName = '';

      if (this.clerkClient) {
        try {
          const user = await this.clerkClient.users.getUser(verified.sub);
          email = user.emailAddresses?.[0]?.emailAddress || '';
          fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || email;

          const metadata = (user.publicMetadata as Record<string, any>) || {};
          if (metadata.role && ['ADMIN', 'MANAGER', 'TECHNICIAN', 'VIEWER'].includes(metadata.role)) {
            role = metadata.role as UserRole;
          } else {
            // If first user or no role assigned, check if email matches admin
            if (email.includes('admin')) {
              role = 'ADMIN';
              await this.updateUserRole(user.id, 'ADMIN');
            }
          }
        } catch (fetchErr) {
          this.logger.warn(`Could not fetch Clerk user profile: ${fetchErr.message}`);
        }
      }

      // Look up linked technician profile in PostgreSQL by email
      let technicianId: string | undefined;
      if (email) {
        const technician = await this.prisma.technicians.findUnique({
          where: { email },
        });
        if (technician) {
          technicianId = technician.id;
        }
      }

      return {
        userId: verified.sub,
        email,
        fullName,
        role,
        technicianId,
      };
    } catch (err) {
      this.logger.error(`Failed to verify Clerk token: ${err.message}`);
      return null;
    }
  }

  /**
   * Updates user role in Clerk public metadata
   */
  async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    if (!this.clerkClient) {
      this.logger.log(`[DevMode] Mock updated user ${userId} to role ${role}`);
      return true;
    }

    try {
      await this.clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: { role },
      });
      return true;
    } catch (err) {
      this.logger.error(`Error updating Clerk user role: ${err.message}`);
      return false;
    }
  }

  /**
   * Retrieves all users registered in Clerk
   */
  async listUsers(limit = 50) {
    if (!this.clerkClient) {
      return [
        {
          id: 'dev-admin-user',
          fullName: 'Admin User (Dev Mode)',
          email: 'admin@opstrack.internal',
          role: 'ADMIN',
        },
        {
          id: 'dev-manager-user',
          fullName: 'Maintenance Manager',
          email: 'manager@opstrack.internal',
          role: 'MANAGER',
        },
        {
          id: 'dev-tech-user',
          fullName: 'John Doe (Technician)',
          email: 'tech@opstrack.internal',
          role: 'TECHNICIAN',
        },
      ];
    }

    const users = await this.clerkClient.users.getUserList({ limit });
    return users.data.map((u) => {
      const metadata = (u.publicMetadata as Record<string, any>) || {};
      return {
        id: u.id,
        fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unnamed User',
        email: u.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: u.imageUrl,
        role: metadata.role || 'TECHNICIAN',
        createdAt: new Date(u.createdAt),
      };
    });
  }
}
