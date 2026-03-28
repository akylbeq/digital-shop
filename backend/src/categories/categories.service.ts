import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { ILike, IsNull, Not, QueryFailedError, Repository } from 'typeorm'; // ← Импортируй IsNull
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async getRootCategories(): Promise<Category[]> {
    return this.categoriesRepo.find({
      where: {
        parentCategoryId: IsNull(),
        isActive: true,
      },
      relations: ['children'],
      order: { id: 'DESC' },
    });
  }

  async getCategoryWithProductsBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepo.findOne({
      where: { slug, isActive: true },
      relations: ['products', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    if (category.products?.length) {
      category.products = category.products.filter((p) => p.isActive);
    }

    return category;
  }

  async getCategoryByIdWithChildren(id: number): Promise<Category> {
    const category = await this.categoriesRepo.findOne({
      where: { id, isActive: true },
      relations: ['children'],
    });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    return category;
  }

  async listActiveProductsForCategory(categoryId: number): Promise<Category> {
    const category = await this.categoriesRepo.findOne({
      where: { id: categoryId, isActive: true },
      relations: ['products'],
    });
    if (!category) {
      throw new NotFoundException(`Category with id "${categoryId}" not found`);
    }
    if (category.products?.length) {
      category.products = category.products.filter((p) => p.isActive);
    }
    return category;
  }

  async hasChildren(id: number): Promise<boolean> {
    const count = await this.categoriesRepo.count({
      where: { parentCategoryId: id },
    });
    return count > 0;
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const exist = await this.categoriesRepo.findOne({
      where: { name: data.name },
    });

    if (exist) {
      throw new ConflictException('Category already exists');
    }

    const slug = await this.categoriesRepo.findOne({
      where: { slug: data.slug },
    });

    if (slug) {
      throw new ConflictException('Category with this slug already exists');
    }
    if (data.parentCategoryId) {
      const parent = await this.categoriesRepo.findOne({
        where: { id: data.parentCategoryId },
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${data.parentCategoryId} not found`,
        );
      }
    }
    try {
      const category = this.categoriesRepo.create(data);
      return await this.categoriesRepo.save(category);
    } catch (e) {
      if (e instanceof QueryFailedError) {
        const err = e as { code?: string };
        if (err.code === '23503') {
          throw new ConflictException(
            `Parent category with ID ${data.parentCategoryId} does not exist`,
          );
        }
      }
      throw e;
    }
  }

  async updateCategory(id: number, data: UpdateCategoryDto): Promise<Category> {
    if (data.parentCategoryId) {
      await this.checkCircularReference(id, data.parentCategoryId);
    }

    const slug = await this.categoriesRepo.findOne({
      where: { slug: data.slug, id: Not(id) },
    });

    if (slug) {
      throw new ConflictException('Category with this slug already exists');
    }

    const result = await this.categoriesRepo.update(id, data);

    if (result.affected === 0) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return this.categoryById(id);
  }

  private async checkCircularReference(
    categoryId: number,
    newParentId: number,
  ): Promise<void> {
    if (categoryId === newParentId) {
      throw new ConflictException('Category cannot be its own parent');
    }

    let currentId: number | null = newParentId;
    const visited = new Set<number>();

    while (currentId) {
      if (visited.has(currentId)) {
        throw new ConflictException('Circular reference detected');
      }

      if (currentId === categoryId) {
        throw new ConflictException(
          'Cannot set a descendant categories as parent',
        );
      }

      visited.add(currentId);

      const parent = await this.categoriesRepo.findOne({
        where: { id: currentId },
      });

      if (!parent) break;
      currentId = parent.parentCategoryId;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    const hasChildren = await this.hasChildren(id);

    if (hasChildren) {
      throw new ConflictException(
        'Cannot delete categories with subcategories. Delete subcategories first.',
      );
    }

    const result = await this.categoriesRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
  }

  async deleteCategoryWithChildren(id: number): Promise<void> {
    const category = await this.categoriesRepo.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    await this.categoriesRepo.remove(category);
  }

  async adminGetAllCategories({ page, limit, name }: PaginationDto) {
    const [data, total] = await this.categoriesRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: name ? { name: ILike(`%${name}%`) } : {},
      order: { id: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async categoryById(id: number): Promise<Category> {
    const category = await this.categoriesRepo.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return category;
  }
}
