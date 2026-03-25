import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'GAMES' })
  name: string;

  @ApiProperty({ example: 'Description', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'games' })
  slug: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({
    example: '/images/2088055f47994883c5b1e9c0ec2e8463',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({ example: null, nullable: true, type: Number })
  parentCategoryId: number | null;

  @ApiProperty({ type: () => [CategoryResponseDto], example: [] })
  children: CategoryResponseDto[];

  @ApiProperty({ example: '2026-03-07T07:02:53.600Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-07T07:02:53.600Z' })
  updatedAt: Date;
}
