import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { PermitAuthGuard } from '../auth/permit-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('root')
  getRootCategories() {
    return this.categoriesService.getRootCategories();
  }

  @Get('admin')
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  adminGetAllCategories() {
    return this.categoriesService.adminGetAllCategories();
  }

  @Post()
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  @HttpCode(201)
  createCategory(
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.createCategory(dto);
  }

  @Patch(':id')
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto
  ) {
    const result = await this.categoriesService.updateCategory(id, dto);
    return this.categoriesService.categoryById(id);
  }

  @Get(':slug/products')
  async getCategoryProductsBySlug(@Param('slug') slug: string) {
    // Мы передаем строку (slug), а сервис превратит её в товары
    return this.categoriesService.getCategoryWithProductsBySlug(slug);
  }

  // Удалить категорию (без детей)
  @Delete(':id')
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  @HttpCode(204)
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteCategory(id);
  }

  // Удалить категорию со всеми детьми
  @Delete(':id/cascade')
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  @HttpCode(204)
  deleteCategoryWithChildren(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteCategoryWithChildren(id);
  }
}