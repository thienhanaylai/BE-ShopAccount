import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  PrismaClient,
  UserRole,
  OrderStatus,
  TransactionStatus,
  SellRequestStatus,
  SupportTicketStatus,
  GameAccountStatus,
} from '@prisma/client';
import { hash } from 'bcrypt';
import { generateId } from '../common/utils/nanoid.util';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();
const hashPassword = async (password: string): Promise<string> =>
  hash(password, 10);

const sampleCategories = [
  {
    id: generateId(),
    name: 'Lien Quan Mobile',
    slug: 'lien-quan-mobile',
    icon: 'https://cdn.shopaccount.local/icons/lq.png',
    description: 'Tai khoan Lien Quan xep hang cao',
  },
  {
    id: generateId(),
    name: 'Free Fire',
    slug: 'free-fire',
    icon: 'https://cdn.shopaccount.local/icons/ff.png',
    description: 'Tai khoan Free Fire rank cao',
  },
  {
    id: generateId(),
    name: 'Genshin Impact',
    slug: 'genshin-impact',
    icon: 'https://cdn.shopaccount.local/icons/gi.png',
    description: 'Tai khoan Genshin co nhieu 5 sao',
  },
];

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL khong duoc cau hinh trong .env');
    process.exit(1);
  }

  try {
    await prisma.$connect();
    console.log('Connected PostgreSQL successfully');

    // Clear old data in FK-safe order.
    await prisma.supportTicket.deleteMany({});
    await prisma.sellRequest.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.gameAccount.deleteMany({});
    await prisma.gameCategory.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Cleared old data');

    const sampleUsers = [
      {
        id: generateId(),
        username: 'admin',
        email: 'admin@shopaccount.local',
        passwordHash: await hashPassword('Admin@123'),
        role: UserRole.ADMIN,
      },
      {
        id: generateId(),
        username: 'customer01',
        email: 'customer01@shopaccount.local',
        passwordHash: await hashPassword('Customer@123'),
        role: UserRole.CUSTOMER,
      },
      {
        id: generateId(),
        username: 'customer02',
        email: 'customer02@shopaccount.local',
        passwordHash: await hashPassword('Customer@123'),
        role: UserRole.CUSTOMER,
      },
    ];

    const insertedUsers = await prisma.user.createMany({ data: sampleUsers });
    const insertedCategories = await prisma.gameCategory.createMany({
      data: sampleCategories,
    });

    const admin = await prisma.user.findUniqueOrThrow({
      where: { username: 'admin' },
    });
    const customer01 = await prisma.user.findUniqueOrThrow({
      where: { username: 'customer01' },
    });
    const customer02 = await prisma.user.findUniqueOrThrow({
      where: { username: 'customer02' },
    });

    const lq = await prisma.gameCategory.findUniqueOrThrow({
      where: { slug: 'lien-quan-mobile' },
    });
    const ff = await prisma.gameCategory.findUniqueOrThrow({
      where: { slug: 'free-fire' },
    });

    await prisma.gameAccount.create({
      data: {
        id: generateId(),
        categoryId: lq.id,
        username: 'lq_vip_001',
        email: 'lq_vip_001@acc.local',
        password: 'acc_secret_001',
        price: 250000,
        status: GameAccountStatus.AVAILABLE,
        level: 30,
        rank: 'Cao Thu',
        images: [
          'https://cdn.shopaccount.local/accounts/lq001-1.png',
          'https://cdn.shopaccount.local/accounts/lq001-2.png',
        ],
        description: 'Skin ngon, tuong da dang',
      },
    });

    const ga2 = await prisma.gameAccount.create({
      data: {
        id: generateId(),
        categoryId: ff.id,
        username: 'ff_pro_002',
        email: 'ff_pro_002@acc.local',
        password: 'acc_secret_002',
        price: 180000,
        status: GameAccountStatus.RESERVED,
        level: 58,
        rank: 'Huyền Thoại',
        images: ['https://cdn.shopaccount.local/accounts/ff002-1.png'],
        description: 'Full nhan vat hot',
      },
    });

    const order1 = await prisma.order.create({
      data: {
        id: generateId(),
        userId: customer01.id,
        gameAccountId: ga2.id,
        price: ga2.price,
        status: OrderStatus.PAID,
      },
    });

    await prisma.transaction.createMany({
      data: [
        {
          id: generateId(),
          userId: customer01.id,
          orderId: order1.id,
          price: ga2.price,
          status: TransactionStatus.SUCCESS,
        },
        {
          id: generateId(),
          userId: customer02.id,
          price: 50000,
          status: TransactionStatus.PENDING,
        },
      ],
    });

    await prisma.sellRequest.createMany({
      data: [
        {
          id: generateId(),
          userId: customer02.id,
          price: 300000,
          status: SellRequestStatus.PENDING,
          description: 'Ban acc Lien Quan rank Chien Tuong',
          accountUsername: 'sell_lq_003',
          accountPassword: 'sell_secret_003',
        },
        {
          id: generateId(),
          userId: customer01.id,
          price: 220000,
          status: SellRequestStatus.REJECTED,
          rejectReason: 'Thong tin acc khong hop le',
          accountUsername: 'sell_ff_004',
          accountPassword: 'sell_secret_004',
        },
      ],
    });

    await prisma.supportTicket.createMany({
      data: [
        {
          id: generateId(),
          userId: customer01.id,
          title: 'Loi dang nhap sau khi mua acc',
          description: 'Toi mua acc ff_pro_002 nhung dang nhap bi sai mat khau',
          category: 'login',
          status: SupportTicketStatus.IN_PROGRESS,
        },
        {
          id: generateId(),
          userId: customer02.id,
          title: 'Yeu cau nap them so du',
          description: 'Can huong dan nap them 500k vao vi',
          category: 'wallet',
          status: SupportTicketStatus.PENDING,
        },
      ],
    });

    console.log(`Inserted ${insertedUsers.count} users`);
    console.log(`Inserted ${insertedCategories.count} categories`);
    console.log(
      'Inserted sample game accounts, orders, transactions, sell requests and support tickets',
    );
    console.log(`Seed done by admin user: ${admin.username}`);
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected');
  }
}

void seed();
