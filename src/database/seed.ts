import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const UserSchema = new mongoose.Schema(
  { name: { type: String, required: true } },
  { timestamps: true },
);

const UserModel = mongoose.model('User', UserSchema);

const sampleUsers = [
  { name: 'Nguyễn Văn An' },
  { name: 'Trần Thị Bình' },
  { name: 'Lê Văn Cường' },
  { name: 'Phạm Thị Dung' },
  { name: 'Hoàng Văn Em' },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI không được cấu hình trong .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Kết nối MongoDB thành công');

    await UserModel.deleteMany({});
    console.log('🗑️  Đã xóa dữ liệu cũ');

    const inserted = await UserModel.insertMany(sampleUsers);
    console.log(`✅ Đã thêm ${inserted.length} users mẫu:`);
    inserted.forEach((u) =>
      console.log(`   - id: ${u._id}  name: ${(u as any).name}`),
    );
  } catch (err) {
    console.error('❌ Lỗi:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối');
  }
}

seed();
