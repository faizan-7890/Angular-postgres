import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CompleteWorkOrderDto } from './dto/complete-work-order.dto';

@ApiTags('Work Orders')
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
  @ApiOperation({ summary: 'Create a new maintenance work order' })
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update work order status (e.g. dragging across Kanban columns)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.workOrdersService.updateStatus(id, dto.status);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete work order and atomically deduct consumed spare parts' })
  complete(@Param('id') id: string, @Body() dto: CompleteWorkOrderDto) {
    return this.workOrdersService.completeWorkOrder(id, dto);
  }
}
