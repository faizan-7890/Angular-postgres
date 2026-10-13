import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TechniciansService } from './technicians.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Technicians')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller('api/technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  @ApiOperation({ summary: 'List all active technicians with active work order count' })
  findAll() {
    return this.techniciansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single technician profile and assigned work orders' })
  findOne(@Param('id') id: string) {
    return this.techniciansService.findOne(id);
  }
}
