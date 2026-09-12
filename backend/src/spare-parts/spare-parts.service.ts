import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';

@Injectable()
export class SparePartsService {
  constructor(private prisma: PrismaService) {}

  async findAll(lowStockOnly?: boolean) {
    if (lowStockOnly) {
      // Find parts where stock_quantity <= min_threshold
      const parts = await this.prisma.spare_parts.findMany({
        orderBy: { stock_quantity: 'asc' },
      });
      return parts.filter((part) => part.stock_quantity <= part.min_threshold);
    }

    return this.prisma.spare_parts.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const part = await this.prisma.spare_parts.findUnique({
      where: { id },
      include: {
        work_order_parts: {
          include: {
            work_orders: true,
          },
        },
      },
    });

    if (!part) {
      throw new NotFoundException(`Spare part with ID ${id} not found`);
    }

    return part;
  }

  async create(dto: CreatePartDto) {
    return this.prisma.spare_parts.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        stock_quantity: dto.stock_quantity,
        min_threshold: dto.min_threshold ?? 5,
        unit_cost: dto.unit_cost ?? 0,
      },
    });
  }
}
