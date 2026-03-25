import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Название категории обязательно' })
  name: string;

  @IsNumber()
  @IsOptional()
  parentCategoryId: number | null;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  image: string | null;
}
