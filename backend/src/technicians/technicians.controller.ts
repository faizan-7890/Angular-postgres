import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TechniciansService } from './technicians.service';

@ApiTags('Technicians')
@Controller('api/technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  @ApiOperation({ summary: 'List all active technicians with active work order count' })
  findAll() {
    return this.techniciansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single technician profile and assigned work orders' })
  findOne(@Param('id') id: string) {
    return this.techniciansService.findOne(id);
  }
}
