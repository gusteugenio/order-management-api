import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('deve retornar access_token quando credenciais são válidas', async () => {
      const passwordHash = await bcrypt.hash('admin123', 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'admin@orders.com',
        passwordHash,
      });

      const result = await service.login({
        email: 'admin@orders.com',
        password: 'admin123',
      });

      expect(result).toEqual({ access_token: 'mock-token' });
    });

    it('deve lançar UnauthorizedException quando usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'naoexiste@orders.com', password: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando senha está incorreta', async () => {
      const passwordHash = await bcrypt.hash('admin123', 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'admin@orders.com',
        passwordHash,
      });

      await expect(
        service.login({ email: 'admin@orders.com', password: 'senha-errada' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
