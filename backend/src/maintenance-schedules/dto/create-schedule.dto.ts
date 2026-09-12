import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  @IsUUID()
  @IsNotEmpty()
  asset_id: string;

  @ApiProperty({ example: 'Oil & Air Filter Replacement' })
  @IsString()
  @IsNotEmpty()
  task_name: string;

  @ApiProperty({ example: 90, description: 'Frequency interval in days' })
  @IsInt()
  @IsPositive()
  frequency_interval_days: number;

  @ApiProperty({ example: '2026-10-01' })
  @IsDateString()
  @IsNotEmpty()
  next_due_date: string;
}
