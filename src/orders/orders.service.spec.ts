/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockOrder = {
  id: 'order-id',
  number: 'ORD-001',
  estimatedDeliveryDate: new Date('2026-07-10'),
  customerName: 'João Silva',
  customerDocument: '123.456.789-00',
  deliveryAddress: 'Rua das Flores, 123',
  status: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  items: [],
};

const mockPrismaService = {
  order: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('deve criar um pedido com sucesso', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.create({
        number: 'ORD-001',
        estimatedDeliveryDate: '2026-07-10',
        customerName: 'João Silva',
        customerDocument: '123.456.789-00',
        deliveryAddress: 'Rua das Flores, 123',
        items: [],
      });

      expect(result).toEqual(mockOrder);
    });

    it('deve lançar ConflictException quando número já existe', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.create({
          number: 'ORD-001',
          estimatedDeliveryDate: '2026-07-10',
          customerName: 'João Silva',
          customerDocument: '123.456.789-00',
          deliveryAddress: 'Rua das Flores, 123',
          items: [],
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('deve retornar um pedido pelo id', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(mockOrder);

      const result = await service.findOne('order-id');

      expect(result).toEqual(mockOrder);
    });

    it('deve lançar NotFoundException quando pedido não existe', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deve fazer soft delete do pedido', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        deletedAt: new Date(),
      });

      await service.remove('order-id');

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-id' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('findAll', () => {
    it('deve listar pedidos sem filtros', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([mockOrder]);

      const result = await service.findAll({});

      expect(result).toEqual([mockOrder]);
    });

    it('deve filtrar pedidos por status', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([mockOrder]);

      const result = await service.findAll({ status: 'PENDING' });

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
      expect(result).toEqual([mockOrder]);
    });
  });
});
