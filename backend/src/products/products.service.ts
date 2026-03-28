import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(p: CreateProductDto): Promise<Product> {
    const exist = await this.productRepo.findOne({ where: { name: p.name } });
    if (exist) {
      throw new ConflictException('Product already exists');
    }
    try {
      const product = this.productRepo.create(p);
      return await this.productRepo.save(product);
    } catch (e) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        (e as { code: string }).code === '23503'
      ) {
        throw new NotFoundException(
          `Category with ID ${p.categoryId} does not exist`,
        );
      }
      throw e;
    }
  }

  async update(id: number, p: UpdateProductDto): Promise<Product> {
    const update = await this.productRepo.update(id, p);

    if (update.affected === 0) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return product;
  }

  async delete(id: number) {
    const result = await this.productRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return;
  }

  async adminFindAll({ page, limit, name }: PaginationDto) {
    const [data, total] = await this.productRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: name ? { name: ILike(`%${name}%`) } : {},
      order: { id: 'DESC' },
    });
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findActiveProductsForTelegram(limit = 30): Promise<Product[]> {
    return this.productRepo.find({
      where: { isActive: true },
      order: { id: 'DESC' },
      take: limit,
      relations: { category: true },
    });
  }

  async findByIdForBot(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id, isActive: true },
      relations: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { slug },
      relations: { category: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        imagesAlbum: true,
        prices: true,
        isActive: true,
        features: true,
        badges: true,
        categoryId: true,
        category: {
          id: true,
          name: true,
          slug: true,
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${slug}" not found`);
    }
    return product;
  }
}
