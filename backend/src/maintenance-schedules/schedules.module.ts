import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { SchedulesScheduler } from './schedules.scheduler';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService, SchedulesScheduler],
  exports: [SchedulesService],
})
export class MaintenanceSchedulesModule {}
