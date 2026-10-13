import { Module, Global } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthController } from './auth.controller';

@Global()
@Module({
  controllers: [AuthController],
  providers: [ClerkService, ClerkAuthGuard, RolesGuard],
  exports: [ClerkService, ClerkAuthGuard, RolesGuard],
})
export class AuthModule {}
