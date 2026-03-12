import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { IsNull, Not, Repository } from 'typeorm'; // ← Импортируй IsNull
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Product } from '../products/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {
  }

  async getRootCategories(): Promise<Category[]> {
    return this.categoriesRepo.find({
      where: {
        parentCategoryId: IsNull(),
        isActive: true
      },
      relations: ['children'],
      order: {name: 'ASC'}
    });
  }

  async getCategoryWithProductsBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepo.findOne({
      where: { slug, isActive: true },
      relations: ['products']
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }

  private async loadChildren(category: Category): Promise<void> {
    const children = await this.categoriesRepo.find({
      where: {
        parentCategoryId: category.id, // ← Здесь number, всё ОК
        isActive: true
      },
      order: {name: 'ASC'}
    });

    category.children = children;

    for (const child of children) {
      await this.loadChildren(child);
    }
  }

  async hasChildren(id: number): Promise<boolean> {
    const count = await this.categoriesRepo.count({
      where: {parentCategoryId: id},
    });
    return count > 0;
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    try {
      const exist = await this.categoriesRepo.findOne({
        where: {name: data.name}
      });

      if (exist) {
        throw new ConflictException('Category already exists');
      }

      const slug = await this.categoriesRepo.findOne({
        where: {slug: data.slug}
      });

      if (slug) {
        throw new ConflictException('Category with this slug already exists');
      }

      if (data.parentCategoryId) {
        const parent = await this.categoriesRepo.findOne({
          where: {id: data.parentCategoryId},
        });

        if (!parent) {
          throw new NotFoundException(
            `Parent category with ID ${data.parentCategoryId} not found`
          );
        }
      }

      const category = this.categoriesRepo.create(data);
      return await this.categoriesRepo.save(category);
    } catch (e) {
      if (e.code === '23503') {
        throw new ConflictException(
          `Parent category with ID ${data.parentCategoryId} does not exist`
        );
      }
      throw e;
    }
  }

  async updateCategory(id: number, data: UpdateCategoryDto): Promise<Category> {
    if (data.parentCategoryId) {
      await this.checkCircularReference(id, data.parentCategoryId);
    }

    const slug = await this.categoriesRepo.findOne({
      where: {slug: data.slug, id: Not(id)}
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
          'Cannot set a descendant category as parent'
        );
      }

      visited.add(currentId);

      const parent = await this.categoriesRepo.findOne({
        where: {id: currentId},
      });

      if (!parent) break;
      currentId = parent.parentCategoryId;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    const hasChildren = await this.hasChildren(id);

    if (hasChildren) {
      throw new ConflictException(
        'Cannot delete category with subcategories. Delete subcategories first.'
      );
    }

    const result = await this.categoriesRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
  }

  async deleteCategoryWithChildren(id: number): Promise<void> {
    const category = await this.categoriesRepo.findOne({
      where: {id},
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    await this.categoriesRepo.remove(category);
  }


  async adminGetAllCategories(): Promise<Category[]> {
    return this.categoriesRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async categoryById(id: number): Promise<Category> {
    const category = await this.categoriesRepo.findOne({
      where: {id},
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return category;
  }
}