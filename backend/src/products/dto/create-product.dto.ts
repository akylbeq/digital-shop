import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min, IsBoolean, IsObject
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductPriceDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Название обязательно' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Описание обязательно' })
  description: string;

  @IsOptional()
  @IsString()
  image: string | null;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsArray()
  prices: {duration: string, price: number}[];

  @IsOptional()
  @IsArray()
  features: {title: string, icon: string, items: string[]}[];

  @IsOptional()
  @IsArray()
  badges: {icon: string, title: string, color: string}[];

  @IsOptional()
  @IsArray()
  imagesAlbum: string[];
}