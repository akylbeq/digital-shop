import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateKeyDto } from './dto/create-key.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Key } from './key.entity';
import { Repository } from 'typeorm';
import { UpdateKeyDto } from './dto/update-key.dto';

@Injectable()
export class KeysService {
  constructor(
    @InjectRepository(Key) private readonly keysRepository: Repository<Key>,
  ) {}

  async create(key: CreateKeyDto): Promise<Key> {
    const exist = await this.keysRepository.findOne({
      where: { key: key.key },
    });
    if (exist) {
      throw new ConflictException('Key already exists');
    }
    return await this.keysRepository.save(key);
  }
  async update(id: number, data: UpdateKeyDto): Promise<Key> {
    const key = await this.keysRepository.findOneBy({ id });

    if (!key) {
      throw new NotFoundException('Key not found');
    }

    Object.assign(key, data);

    return await this.keysRepository.save(key);
  }
  async findAll(page = 1, limit = 10, key?: string) {
    const [data, total] = await this.keysRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
      relations: ['product'],
      where: key ? { key } : {},
      select: {
        id: true,
        key: true,
        status: true,
        createdAt: true,
        product: {
          id: true,
          name: true,
        },
      },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async delete(id: number) {
    const result = await this.keysRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return;
  }
}
