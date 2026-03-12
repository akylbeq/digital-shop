import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Product } from '../products/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string | null;

  @Column({ type: 'int', nullable: true })
  parentCategoryId: number | null;

  @ManyToOne(() => Category, category => category.children, {
    nullable: true,
    onDelete: 'CASCADE'
  })

  @JoinColumn({ name: 'parentCategoryId' })
  parent: Category | null;

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  @OneToMany(() => Category, category => category.parent)
  children: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}