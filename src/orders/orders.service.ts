import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const existing = await this.prisma.order.findUnique({
      where: { number: dto.number },
    });

    if (existing) {
      throw new ConflictException(`Pedido com número ${dto.number} já existe`);
    }

    return this.prisma.order.create({
      data: {
        number: dto.number,
        estimatedDeliveryDate: new Date(dto.estimatedDeliveryDate),
        customerName: dto.customerName,
        customerDocument: dto.customerDocument,
        deliveryAddress: dto.deliveryAddress,
        items: {
          create: dto.items,
        },
      },
      include: { items: true },
    });
  }

  async findAll(filters: FilterOrderDto) {
    return this.prisma.order.findMany({
      where: {
        deletedAt: null,
        ...(filters.number && { number: filters.number }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate || filters.endDate
          ? {
              estimatedDeliveryDate: {
                ...(filters.startDate && { gte: new Date(filters.startDate) }),
                ...(filters.endDate && { lte: new Date(filters.endDate) }),
              },
            }
          : {}),
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Pedido ${id} não encontrado`);
    }

    return order;
  }

  async update(id: string, dto: UpdateOrderDto) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.estimatedDeliveryDate && {
          estimatedDeliveryDate: new Date(dto.estimatedDeliveryDate),
        }),
        ...(dto.deliveryAddress && { deliveryAddress: dto.deliveryAddress }),
        ...(dto.status && { status: dto.status }),
        ...(dto.items && {
          items: {
            deleteMany: {},
            create: dto.items,
          },
        }),
      },
      include: { items: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
