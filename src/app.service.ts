import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! <br> GET api.shopaccgiare.tech/users để lấy thông tin bản user(id, name) <br> GET api.shopaccgiare.tech/users/_id để lấy thong tin 1 user theo _id';
  }
}
