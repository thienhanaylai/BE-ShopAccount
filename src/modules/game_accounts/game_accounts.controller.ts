import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GameAccountsService } from './game_accounts.service';
import { CreateGameAccountDto } from './dto/create-game-account.dto';
import { QueryGameAccountsDto } from './dto/query-game-accounts.dto';
import { UpdateGameAccountDto } from './dto/update-game-account.dto';

@Controller('game-accounts')
export class GameAccountsController {
  constructor(private readonly service: GameAccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('imageFiles', 10, {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  create(
    @Body(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    dto: CreateGameAccountDto,
    @UploadedFiles() imageFiles?: Express.Multer.File[],
  ) {
    return this.service.create(dto, imageFiles);
  }

  @Get()
  findAll(@Query() query: QueryGameAccountsDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGameAccountDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
