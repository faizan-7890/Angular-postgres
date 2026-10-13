import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClerkService } from '../clerk.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly clerkService: ClerkService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Check if the handler or class is marked as Public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // 2. Extract Bearer token
    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // 3. Dev bypass if Clerk is not yet configured with real API keys
    if (!this.clerkService.isClerkConfigured && (!token || token.startsWith('mock') || token.startsWith('dev'))) {
      request.user = {
        userId: 'dev-admin-user',
        email: 'admin@opstrack.internal',
        fullName: 'Admin User (Dev Mode)',
        role: 'ADMIN',
      };
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Authentication required. Missing Bearer token.');
    }

    // 4. Verify token with Clerk
    const user = await this.clerkService.verifySessionToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired Clerk session token.');
    }

    request.user = user;
    return true;
  }
}
