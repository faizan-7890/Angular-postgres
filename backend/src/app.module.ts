import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AssetsModule } from './assets/assets.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { MaintenanceSchedulesModule } from './maintenance-schedules/schedules.module';
import { SparePartsModule } from './spare-parts/spare-parts.module';
import { TechniciansModule } from './technicians/technicians.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AssetsModule,
    WorkOrdersModule,
    MaintenanceSchedulesModule,
    SparePartsModule,
    TechniciansModule,
  ],
})
export class AppModule {}
