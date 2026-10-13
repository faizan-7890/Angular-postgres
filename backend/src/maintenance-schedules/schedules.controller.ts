import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Maintenance Schedules')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller('api/schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'List all recurring preventative maintenance schedules' })
  @ApiQuery({ name: 'dueSoonOnly', required: false, type: Boolean })
  findAll(@Query('dueSoonOnly') dueSoonOnly?: string) {
    return this.schedulesService.findAll(dueSoonOnly === 'true');
  }

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create a new maintenance schedule rule (Admin or Manager only)' })
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @Post('trigger-due-check')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Manually trigger the preventative maintenance evaluation worker (Admin or Manager only)' })
  triggerCheck() {
    return this.schedulesService.processDueSchedules();
  }
}
