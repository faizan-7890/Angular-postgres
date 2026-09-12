import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TechniciansService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.technicians.findMany({
      where: { is_active: true },
      orderBy: { full_name: 'asc' },
      include: {
        _count: {
          select: {
            work_orders: {
              where: {
                status: { in: ['PENDING', 'IN_PROGRESS'] },
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const technician = await this.prisma.technicians.findUnique({
      where: { id },
      include: {
        work_orders: {
          include: {
            assets: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!technician) {
      throw new NotFoundException(`Technician with ID ${id} not found`);
    }

    return technician;
  }
}
