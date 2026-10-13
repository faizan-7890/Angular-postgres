import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SparePartsService } from './spare-parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Spare Parts')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller('api/parts')
export class SparePartsController {
  constructor(private readonly sparePartsService: SparePartsService) {}

  @Get()
  @ApiOperation({ summary: 'List spare parts inventory with optional low-stock alert filter' })
  @ApiQuery({ name: 'lowStockOnly', required: false, type: Boolean })
  findAll(@Query('lowStockOnly') lowStockOnly?: string) {
    return this.sparePartsService.findAll(lowStockOnly === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single spare part details' })
  findOne(@Param('id') id: string) {
    return this.sparePartsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Add a new spare part to inventory (Admin or Manager only)' })
  create(@Body() dto: CreatePartDto) {
    return this.sparePartsService.create(dto);
  }
}
