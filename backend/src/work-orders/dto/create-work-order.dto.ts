import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsEnum, IsDateString } from 'class-validator';

export enum WorkOrderPriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum WorkOrderStatusEnum {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateWorkOrderDto {
  @ApiProperty({ example: 'Emergency Hydraulic Pressure Drop Repair' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Technician reported fluid seepage on primary piston cylinder.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: WorkOrderPriorityEnum, default: WorkOrderPriorityEnum.MEDIUM })
  @IsOptional()
  @IsEnum(WorkOrderPriorityEnum)
  priority?: WorkOrderPriorityEnum;

  @ApiPropertyOptional({ enum: WorkOrderStatusEnum, default: WorkOrderStatusEnum.PENDING })
  @IsOptional()
  @IsEnum(WorkOrderStatusEnum)
  status?: WorkOrderStatusEnum;

  @ApiProperty({ example: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' })
  @IsString()
  @IsNotEmpty()
  asset_id: string;

  @ApiPropertyOptional({ example: '22222222-2222-2222-2222-222222222222' })
  @IsOptional()
  @IsString()
  assigned_technician_id?: string;

  @ApiPropertyOptional({ example: '90000002-0000-0000-0000-000000000002' })
  @IsOptional()
  @IsString()
  schedule_id?: string;

  @ApiPropertyOptional({ example: '2026-09-15' })
  @IsOptional()
  @IsDateString()
  scheduled_date?: string;
}
