import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
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
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create a new physical equipment record (Admin or Manager only)' })
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete an asset record (Admin only)' })
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}
