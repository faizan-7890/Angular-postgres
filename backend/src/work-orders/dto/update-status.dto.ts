import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { WorkOrderStatusEnum } from './create-work-order.dto';

export class UpdateStatusDto {
  @ApiProperty({ enum: WorkOrderStatusEnum, example: WorkOrderStatusEnum.IN_PROGRESS })
  @IsEnum(WorkOrderStatusEnum)
  @IsNotEmpty()
  status: WorkOrderStatusEnum;
}
