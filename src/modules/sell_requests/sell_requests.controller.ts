import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SellRequestsService } from './sell_requests.service';
import { CreateSellRequestDto } from './dto/create-sell-request.dto';
import { UpdateSellRequestDto } from './dto/update-sell-request.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('sell-requests')
@UseGuards(JwtAuthGuard)
export class SellRequestsController {
  constructor(private readonly service: SellRequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSellRequestDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSellRequestDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
