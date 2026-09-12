import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(dueSoonOnly?: boolean) {
    const where: any = {};
    if (dueSoonOnly) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      where.next_due_date = {
        lte: futureDate,
      };
    }

    return this.prisma.maintenance_schedules.findMany({
      where,
      orderBy: { next_due_date: 'asc' },
      include: {
        assets: true,
        work_orders: {
          take: 3,
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  async create(dto: CreateScheduleDto) {
    return this.prisma.maintenance_schedules.create({
      data: {
        asset_id: dto.asset_id,
        task_name: dto.task_name,
        frequency_interval_days: dto.frequency_interval_days,
        next_due_date: new Date(dto.next_due_date),
      },
      include: {
        assets: true,
      },
    });
  }

  /**
   * Scans for schedules with next_due_date <= today and auto-generates
   * PENDING work orders if an open work order does not already exist.
   */
  async processDueSchedules(): Promise<{ generatedCount: number }> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const dueSchedules = await this.prisma.maintenance_schedules.findMany({
      where: {
        next_due_date: {
          lte: today,
        },
      },
      include: {
        assets: true,
        work_orders: {
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
          },
        },
      },
    });

    let generatedCount = 0;

    for (const schedule of dueSchedules) {
      // If there is already an active work order, don't duplicate
      if (schedule.work_orders.length > 0) {
        continue;
      }

      this.logger.log(
        `Auto-generating preventative work order for Asset: ${schedule.assets.name} (Task: ${schedule.task_name})`,
      );

      await this.prisma.work_orders.create({
        data: {
          title: `[Auto-PM] ${schedule.task_name}`,
          description: `Automatically triggered preventative maintenance schedule for ${schedule.assets.name}. Interval: Every ${schedule.frequency_interval_days} days.`,
          priority: 'MEDIUM',
          status: 'PENDING',
          asset_id: schedule.asset_id,
          schedule_id: schedule.id,
          scheduled_date: new Date(),
        },
      });

      generatedCount++;
    }

    return { generatedCount };
  }
}
