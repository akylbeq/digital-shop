import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KeysService } from './keys.service';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { PermitAuthGuard } from '../auth/permit-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateKeyDto } from './dto/create-key.dto';
import { Key } from './key.entity';
import { UpdateKeyDto } from './dto/update-key.dto';

@Controller('keys')
export class KeysController {
  constructor(private readonly keysService: KeysService) {}

  @Post()
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  async create(@Body() createKeyDto: CreateKeyDto): Promise<Key> {
    return this.keysService.create(createKeyDto);
  }

  @Patch(':id')
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateKeyDto: UpdateKeyDto,
  ): Promise<Key> {
    return this.keysService.update(Number(id), updateKeyDto);
  }

  @Get()
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  async getAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('key') key: string,
  ) {
    return this.keysService.findAll(Number(page), Number(limit), key);
  }

  @Delete(':id')
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    return this.keysService.delete(Number(id));
  }
}
