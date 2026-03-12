import { IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Название категории обязательно' })
  name: string;

  @IsNumber() // Исправлено: если ID — число
  @IsOptional() // Позволяет полю быть null или отсутствовать
  parentCategoryId: number | null;

  @IsString()
  @IsOptional()
  description: string;

  @IsString() // Исправлено: slug — это всегда строка
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  image: string | null;
}