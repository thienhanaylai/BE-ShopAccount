import { PrismaClient, TransactionMethod } from '@prisma/client';
import { generateId } from '../common/utils/nanoid.util';

const prisma = new PrismaClient();

async function run(): Promise<void> {
  const suffix = Date.now().toString();

  try {
    await prisma.$connect();

    const user = await prisma.user.create({
      data: {
        id: generateId(),
        username: `smoke_user_${suffix}`,
        email: `smoke_user_${suffix}@local.test`,
        passwordHash: 'smoke_hash',
      },
    });

    const category = await prisma.gameCategory.create({
      data: {
        id: generateId(),
        name: `Smoke Category ${suffix}`,
        slug: `smoke-category-${suffix}`,
        icon: 'icon.png',
      },
    });

    const gameAccount = await prisma.gameAccount.create({
      data: {
        id: generateId(),
        categoryId: category.id,
        username: `ga_${suffix}`,
        email: `ga_${suffix}@local.test`,
        password: 'secret',
        price: 100000,
        images: ['img1.png'],
      },
    });

    const order = await prisma.order.create({
      data: {
        id: generateId(),
        userId: user.id,
        gameAccountId: gameAccount.id,
        price: 100000,
      },
    });

    await prisma.transaction.create({
      data: {
        id: generateId(),
        userId: user.id,
        orderId: order.id,
        method: TransactionMethod.PAYMENT,
        price: 100000,
      },
    });

    await prisma.sellRequest.create({
      data: {
        id: generateId(),
        userId: user.id,
        price: 50000,
        accountUsername: `sell_acc_${suffix}`,
        accountPassword: 'secret',
      },
    });

    await prisma.supportTicket.create({
      data: {
        id: generateId(),
        userId: user.id,
        title: 'Smoke ticket',
        description: 'Schema smoke test',
        category: 'general',
      },
    });

    const check = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        orders: true,
        transactions: true,
        sellRequests: true,
        supportTickets: true,
      },
    });

    if (!check) {
      throw new Error('Smoke test failed: user not found');
    }

    if (check.orders.length !== 1) {
      throw new Error('Smoke test failed: order relation mismatch');
    }

    if (check.transactions.length !== 1) {
      throw new Error('Smoke test failed: transaction relation mismatch');
    }

    if (check.sellRequests.length !== 1) {
      throw new Error('Smoke test failed: sell request relation mismatch');
    }

    if (check.supportTickets.length !== 1) {
      throw new Error('Smoke test failed: support ticket relation mismatch');
    }

    console.log('Schema smoke test passed');
  } finally {
    await prisma.supportTicket.deleteMany({ where: { title: 'Smoke ticket' } });
    await prisma.sellRequest.deleteMany({
      where: { accountUsername: { startsWith: 'sell_acc_' } },
    });
    await prisma.transaction.deleteMany({ where: { price: 100000 } });
    await prisma.order.deleteMany({ where: { price: 100000 } });
    await prisma.gameAccount.deleteMany({
      where: { username: { startsWith: 'ga_' } },
    });
    await prisma.gameCategory.deleteMany({
      where: { slug: { startsWith: 'smoke-category-' } },
    });
    await prisma.user.deleteMany({
      where: { username: { startsWith: 'smoke_user_' } },
    });
    await prisma.$disconnect();
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
