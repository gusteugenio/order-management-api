import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('-- Iniciando seed...');

  await prisma.user.upsert({
    where: { email: 'admin@orders.com' },
    update: {},
    create: {
      email: 'admin@orders.com',
      passwordHash: await bcrypt.hash('admin123', 10),
    },
  });

  console.log('-- Usuário admin criado: admin@orders.com / admin123');

  await prisma.order.createMany({
    skipDuplicates: true,
    data: [
      {
        number: 'ORD-001',
        estimatedDeliveryDate: new Date('2026-06-10'),
        customerName: 'João Silva',
        customerDocument: '123.456.789-00',
        deliveryAddress: 'Rua das Flores, 123 - São Paulo, SP',
        status: 'PENDING',
      },
      {
        number: 'ORD-002',
        estimatedDeliveryDate: new Date('2026-06-15'),
        customerName: 'Maria Souza',
        customerDocument: '987.654.321-00',
        deliveryAddress: 'Av. Paulista, 1000 - São Paulo, SP',
        status: 'PROCESSING',
      },
      {
        number: 'ORD-003',
        estimatedDeliveryDate: new Date('2026-05-30'),
        customerName: 'Carlos Oliveira',
        customerDocument: '111.222.333-44',
        deliveryAddress: 'Rua XV de Novembro, 50 - Curitiba, PR',
        status: 'DELIVERED',
      },
      {
        number: 'ORD-004',
        estimatedDeliveryDate: new Date('2026-06-20'),
        customerName: 'Ana Lima',
        customerDocument: '555.666.777-88',
        deliveryAddress: 'Rua da Consolação, 200 - São Paulo, SP',
        status: 'CANCELED',
      },
      {
        number: 'ORD-005',
        estimatedDeliveryDate: new Date('2026-07-01'),
        customerName: 'Pedro Costa',
        customerDocument: '999.888.777-66',
        deliveryAddress: 'Av. Brasil, 500 - Rio de Janeiro, RJ',
        status: 'PENDING',
      },
    ],
  });

  console.log('-- Pedidos criados');

  const orders = await prisma.order.findMany({
    select: { id: true, number: true },
  });

  const itemsData = orders.flatMap((order) => [
    {
      orderId: order.id,
      description: `Produto A - ${order.number}`,
      quantity: 2,
      unitPrice: 49.9,
    },
    {
      orderId: order.id,
      description: `Produto B - ${order.number}`,
      quantity: 1,
      unitPrice: 199.9,
    },
  ]);

  await prisma.orderItem.createMany({ data: itemsData });

  console.log('-- Itens criados');
  console.log('-- Seed finalizado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
