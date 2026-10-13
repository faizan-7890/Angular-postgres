import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CompleteWorkOrderDto } from './dto/complete-work-order.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Work Orders')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller('api/work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List all work orders with filters' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'technicianId', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('technicianId') technicianId?: string,
  ) {
    return this.workOrdersService.findAll(status, priority, technicianId);
  }

  @Get('kanban')
  @ApiOperation({ summary: 'Get work orders grouped for Angular Kanban board' })
  getKanbanBoard() {
    return this.workOrdersService.getKanbanBoard();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single work order with asset, technician, and parts' })
  findOne(@Param('id') id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create a new maintenance work order (Admin or Manager only)' })
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER', 'TECHNICIAN')
  @ApiOperation({ summary: 'Update work order status (Admin, Manager, or Technician)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.workOrdersService.updateStatus(id, dto.status);
  }

  @Post(':id/complete')
  @Roles('ADMIN', 'MANAGER', 'TECHNICIAN')
  @ApiOperation({ summary: 'Complete work order and atomically deduct consumed spare parts' })
  complete(@Param('id') id: string, @Body() dto: CompleteWorkOrderDto) {
    return this.workOrdersService.completeWorkOrder(id, dto);
  }
}
