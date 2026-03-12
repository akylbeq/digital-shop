import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({type: 'varchar', length: 255, nullable: true})
  image: string | null;

  @Column({type: 'jsonb',nullable: true})
  imagesAlbum: string[];

  @Column({type: 'jsonb', nullable: true})
  prices: {duration: string, price: number}[];

  @Column({ nullable: true })
  categoryId: number | null;

  @Column({type: 'boolean', default: false})
  isActive: boolean;

  @Column({type: 'jsonb', nullable: true})
  features: {title: string, icon: string, items: string[]}[];

  @Column({type: 'jsonb', nullable: true})
  badges: {icon: string, title: string, color: string}[];


  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}