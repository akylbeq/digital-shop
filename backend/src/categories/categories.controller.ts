import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { PermitAuthGuard } from '../auth/permit-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationDto } from './dto/pagination.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('root')
  getRootCategories() {
    return this.categoriesService.getRootCategories();
  }

  @Get()
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  adminGetAllCategories(@Query() query: PaginationDto) {
    return this.categoriesService.adminGetAllCategories(query);
  }

  @Post()
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  @HttpCode(201)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Patch(':id')
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    await this.categoriesService.updateCategory(id, dto);
    return this.categoriesService.categoryById(id);
  }

  @Get(':slug/products')
  async getCategoryProductsBySlug(@Param('slug') slug: string) {
    return this.categoriesService.getCategoryWithProductsBySlug(slug);
  }

  @Delete(':id')
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  @HttpCode(204)
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteCategory(id);
  }

  @Delete(':id/cascade')
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  @HttpCode(204)
  deleteCategoryWithChildren(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteCategoryWithChildren(id);
  }
}
