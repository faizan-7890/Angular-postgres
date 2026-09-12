import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';

export class ConsumedPartDto {
  @ApiProperty({ example: '55555555-5555-5555-5555-555555555552' })
  @IsString()
  @IsNotEmpty()
  part_id: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  quantity_used: number;
}

export class CompleteWorkOrderDto {
  @ApiPropertyOptional({ type: [ConsumedPartDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsumedPartDto)
  parts_used?: ConsumedPartDto[];
}
