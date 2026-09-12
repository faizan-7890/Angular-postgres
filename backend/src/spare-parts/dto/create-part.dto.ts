import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreatePartDto {
  @ApiProperty({ example: 'Synthetic Air Filter AF-200' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'PART-AF-200' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 14 })
  @IsInt()
  @Min(0)
  stock_quantity: number;

  @ApiPropertyOptional({ example: 5, default: 5 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  min_threshold?: number;

  @ApiPropertyOptional({ example: 24.50, default: 0 })
  @IsOptional()
  @IsNumber()
  unit_cost?: number;
}
