import { PrimaryGeneratedColumn } from 'typeorm';

export class Order {
  @PrimaryGeneratedColumn()
  id: number;
}
