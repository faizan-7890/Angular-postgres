import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkService } from './clerk.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser, UserRole } from './auth.types';

export class UpdateRoleDto {
  userId: string;
  role: UserRole;
}

@ApiTags('Authentication & RBAC')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller('api/auth')
export class AuthController {
  constructor(private readonly clerkService: ClerkService) {}

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Check Clerk configuration and auth health status' })
  getStatus() {
    return {
      status: 'ok',
      clerkConfigured: this.clerkService.isClerkConfigured,
      mode: this.clerkService.isClerkConfigured ? 'production-clerk' : 'development-bypass',
      supportedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'VIEWER'],
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get profile and permissions for currently authenticated user' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return {
      user,
      permissions: {
        canCreateAssets: ['ADMIN', 'MANAGER'].includes(user.role),
        canDeleteAssets: user.role === 'ADMIN',
        canManageWorkOrders: ['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(user.role),
        canApproveWorkOrders: ['ADMIN', 'MANAGER'].includes(user.role),
        canManageInventory: ['ADMIN', 'MANAGER'].includes(user.role),
        canManageUsers: user.role === 'ADMIN',
      },
    };
  }

  @Get('users')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all users in the system (Admin only)' })
  async getUsers() {
    return this.clerkService.listUsers();
  }

  @Patch('role')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign or update a user role in Clerk public metadata (Admin only)' })
  async updateRole(@Body() body: UpdateRoleDto) {
    const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'TECHNICIAN', 'VIEWER'];
    if (!body.userId || !validRoles.includes(body.role)) {
      throw new BadRequestException(
        `Invalid payload. "userId" is required and "role" must be one of: ${validRoles.join(', ')}`,
      );
    }

    const success = await this.clerkService.updateUserRole(body.userId, body.role);
    return {
      success,
      userId: body.userId,
      newRole: body.role,
      message: `Role for user ${body.userId} updated to ${body.role}`,
    };
  }
}
