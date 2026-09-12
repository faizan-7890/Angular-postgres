import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string, status?: string) {
    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;

    return this.prisma.assets.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        maintenance_schedules: true,
        _count: {
          select: { work_orders: true },
        },
      },
    });
  }

  async search(query: string) {
    if (!query || query.trim() === '') {
      return this.findAll();
    }

    // Leveraging PostgreSQL native tsvector full-text search and ranking
    const cleanQuery = query.trim();
    const results: any[] = await this.prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        serial_number, 
        category, 
        location, 
        status, 
        purchase_date, 
        warranty_expires_at, 
        specs, 
        created_at,
        ts_rank(search_vector, plainto_tsquery('english', ${cleanQuery})) as rank
      FROM assets
      WHERE search_vector @@ plainto_tsquery('english', ${cleanQuery})
      ORDER BY rank DESC;
    `;

    return results;
  }

  async findOne(id: string) {
    const asset = await this.prisma.assets.findUnique({
      where: { id },
      include: {
        maintenance_schedules: true,
        work_orders: {
          include: {
            technicians: true,
            work_order_parts: {
              include: {
                spare_parts: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async create(dto: CreateAssetDto) {
    return this.prisma.assets.create({
      data: {
        name: dto.name,
        serial_number: dto.serial_number,
        category: dto.category,
        location: dto.location,
        status: (dto.status as any) || 'OPERATIONAL',
        purchase_date: dto.purchase_date ? new Date(dto.purchase_date) : null,
        warranty_expires_at: dto.warranty_expires_at ? new Date(dto.warranty_expires_at) : null,
        specs: dto.specs || {},
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.assets.delete({
      where: { id },
    });
  }
}
