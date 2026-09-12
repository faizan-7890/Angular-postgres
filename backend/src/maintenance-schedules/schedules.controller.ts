import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@ApiTags('Maintenance Schedules')
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
  @ApiOperation({ summary: 'Create a new maintenance schedule rule' })
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @Post('trigger-due-check')
  @ApiOperation({ summary: 'Manually trigger the preventative maintenance evaluation worker' })
  triggerCheck() {
    return this.schedulesService.processDueSchedules();
  }
}
