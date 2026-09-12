import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';

export enum AssetStatusEnum {
  OPERATIONAL = 'OPERATIONAL',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
  IN_STORAGE = 'IN_STORAGE',
}

export class CreateAssetDto {
  @ApiProperty({ example: 'Industrial Air Compressor X500' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'AC-X500-8841' })
  @IsString()
  @IsNotEmpty()
  serial_number: string;

  @ApiProperty({ example: 'Pneumatics' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Building A - Utility Room 2' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ enum: AssetStatusEnum, default: AssetStatusEnum.OPERATIONAL })
  @IsOptional()
  @IsEnum(AssetStatusEnum)
  status?: AssetStatusEnum;

  @ApiPropertyOptional({ example: '2023-01-15' })
  @IsOptional()
  @IsDateString()
  purchase_date?: string;

  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsOptional()
  @IsDateString()
  warranty_expires_at?: string;

  @ApiPropertyOptional({ example: { max_psi: 175, motor_hp: 15 } })
  @IsOptional()
  specs?: any;
}
