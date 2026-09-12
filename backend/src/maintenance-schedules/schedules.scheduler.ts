import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SchedulesService } from './schedules.service';

@Injectable()
export class SchedulesScheduler {
  private readonly logger = new Logger(SchedulesScheduler.name);

  constructor(private readonly schedulesService: SchedulesService) {}

  // Run automatically every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyMaintenanceCheck() {
    this.logger.log('Executing automated daily preventative maintenance check...');
    const result = await this.schedulesService.processDueSchedules();
    this.logger.log(`Daily check complete: Generated ${result.generatedCount} preventative work order(s).`);
  }
}
