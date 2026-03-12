import { IsBoolean, IsBooleanString, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsNumber()
  parentCategoryId?: number | null;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


  @IsOptional()
  image?: string | null;
}