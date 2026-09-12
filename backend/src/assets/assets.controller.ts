import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';

@ApiTags('Assets')
@Controller('api/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all assets with optional filtering' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('category') category?: string, @Query('status') status?: string) {
    return this.assetsService.findAll(category, status);
  }

  @Get('search')
  @ApiOperation({ summary: 'Full-Text Search across assets using PostgreSQL tsvector' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query keyword' })
  search(@Query('q') query: string) {
    return this.assetsService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset details including maintenance schedules & work orders' })
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new physical equipment record' })
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset record' })
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}
