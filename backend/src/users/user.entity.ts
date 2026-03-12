import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ unique: true})
    email: string;
    @Column()
    password: string;
    @Column({ type: 'enum', enum: Role, default: Role.USER})
    role: string;
    @CreateDateColumn({ name: 'created_at', type: 'timestamptz'})
    created_at: Date;

    @BeforeInsert()
    async hashPassword() {
      if (!this.password) return;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
}
