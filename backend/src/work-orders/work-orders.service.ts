import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { CompleteWorkOrderDto } from './dto/complete-work-order.dto';

@Injectable()
export class WorkOrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string, priority?: string, technicianId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (technicianId) where.assigned_technician_id = technicianId;

    return this.prisma.work_orders.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        assets: true,
        technicians: true,
        maintenance_schedules: true,
        work_order_parts: {
          include: {
            spare_parts: true,
          },
        },
      },
    });
  }

  async getKanbanBoard() {
    const workOrders = await this.findAll();

    return {
      PENDING: workOrders.filter((wo) => wo.status === 'PENDING'),
      IN_PROGRESS: workOrders.filter((wo) => wo.status === 'IN_PROGRESS'),
      COMPLETED: workOrders.filter((wo) => wo.status === 'COMPLETED'),
    };
  }

  async findOne(id: string) {
    const workOrder = await this.prisma.work_orders.findUnique({
      where: { id },
      include: {
        assets: true,
        technicians: true,
        maintenance_schedules: true,
        work_order_parts: {
          include: {
            spare_parts: true,
          },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work Order with ID ${id} not found`);
    }

    return workOrder;
  }

  async create(dto: CreateWorkOrderDto) {
    return this.prisma.work_orders.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: (dto.priority as any) || 'MEDIUM',
        status: (dto.status as any) || 'PENDING',
        asset_id: dto.asset_id,
        assigned_technician_id: dto.assigned_technician_id || null,
        schedule_id: dto.schedule_id || null,
        scheduled_date: dto.scheduled_date ? new Date(dto.scheduled_date) : new Date(),
      },
      include: {
        assets: true,
        technicians: true,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    return this.prisma.work_orders.update({
      where: { id },
      data: {
        status: status as any,
        updated_at: new Date(),
      },
      include: {
        assets: true,
        technicians: true,
      },
    });
  }

  /**
   * Atomic completion transaction:
   * 1. Validates current stock
   * 2. Decrements inventory in spare_parts
   * 3. Creates work_order_parts junction entries
   * 4. Marks work order as COMPLETED with timestamp
   * 5. Advances maintenance_schedules next_due_date if linked
   */
  async completeWorkOrder(id: string, dto: CompleteWorkOrderDto) {
    const workOrder = await this.findOne(id);

    if (workOrder.status === 'COMPLETED') {
      throw new BadRequestException('Work order is already completed');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Process consumed spare parts
      if (dto.parts_used && dto.parts_used.length > 0) {
        for (const item of dto.parts_used) {
          const part = await tx.spare_parts.findUnique({
            where: { id: item.part_id },
          });

          if (!part) {
            throw new NotFoundException(`Spare part with ID ${item.part_id} not found`);
          }

          if (part.stock_quantity < item.quantity_used) {
            throw new BadRequestException(
              `Insufficient stock for "${part.name}". Available: ${part.stock_quantity}, Requested: ${item.quantity_used}`,
            );
          }

          // Decrement stock
          await tx.spare_parts.update({
            where: { id: item.part_id },
            data: {
              stock_quantity: {
                decrement: item.quantity_used,
              },
            },
          });

          // Record consumed part in junction table
          await tx.work_order_parts.upsert({
            where: {
              work_order_id_part_id: {
                work_order_id: id,
                part_id: item.part_id,
              },
            },
            create: {
              work_order_id: id,
              part_id: item.part_id,
              quantity_used: item.quantity_used,
            },
            update: {
              quantity_used: {
                increment: item.quantity_used,
              },
            },
          });
        }
      }

      // 2. Mark work order as completed
      const updatedOrder = await tx.work_orders.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completed_at: new Date(),
          updated_at: new Date(),
        },
        include: {
          assets: true,
          technicians: true,
          work_order_parts: {
            include: {
              spare_parts: true,
            },
          },
        },
      });

      // 3. If tied to a preventative schedule, advance next_due_date
      if (workOrder.schedule_id) {
        const schedule = await tx.maintenance_schedules.findUnique({
          where: { id: workOrder.schedule_id },
        });

        if (schedule) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + schedule.frequency_interval_days);

          await tx.maintenance_schedules.update({
            where: { id: schedule.id },
            data: {
              last_completed_at: new Date(),
              next_due_date: nextDate,
            },
          });
        }
      }

      return updatedOrder;
    });
  }
}
