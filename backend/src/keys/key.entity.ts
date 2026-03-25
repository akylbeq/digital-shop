import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';

export enum KeyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD = 'sold',
}

@Entity('keys')
export class Key {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  key: string;

  @Column({
    type: 'enum',
    enum: KeyStatus,
    default: KeyStatus.ACTIVE,
  })
  status: KeyStatus;

  @ManyToOne(() => Product, (p) => p.keys, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;
  @CreateDateColumn()
  createdAt: Date;
}
