import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SparePartsService } from './spare-parts.service';
import { CreatePartDto } from './dto/create-part.dto';

@ApiTags('Spare Parts')
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
  @ApiOperation({ summary: 'Add a new spare part to inventory' })
  create(@Body() dto: CreatePartDto) {
    return this.sparePartsService.create(dto);
  }
}
