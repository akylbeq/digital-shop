import { Body, Controller, Post, Get, UseGuards, Patch, Param } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { PermitAuthGuard } from '../auth/permit-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  async createProduct(
    @Body() product: CreateProductDto,
  ) {
    return await this.productsService.create(product);
  }

  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  @Get('admin')
  async getAllAdminProducts() {
    return await this.productsService.adminFindAll();
  }

  @Patch(':id')
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  async updateAdminProduct(
    @Body() dto: UpdateProductDto,
    @Param('id') id: number,
  ) {
    return await this.productsService.update(id, dto);
  }

  @Get(':slug')
  async getProductBySlug(@Param('slug') s: string) {
    return await this.productsService.findBySlug(s)
  }
}
