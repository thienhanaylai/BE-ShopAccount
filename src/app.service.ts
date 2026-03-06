import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! Truy cập GET api.shopaccgiare.tech/users để lấy thông tin bản user(id, name)';
  }
}
