import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

const saltRounds = 10;

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /** Web-регистрация; для пользователей только из Telegram может быть null */
  @Column({ type: 'varchar', length: 320, unique: true, nullable: true })
  email: string | null;

  /** Для входа через сайт; у Telegram-пользователей null */
  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  /** Telegram user id (строка, т.к. значения могут быть > 2^53) */
  @Column({ type: 'varchar', length: 32, unique: true, nullable: true })
  telegramId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  telegramUsername: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  telegramFirstName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  telegramLastName: string | null;

  /** Уникальный код для deep-link t.me/bot?start=ref_<code> */
  @Column({ type: 'varchar', length: 32, unique: true, nullable: true })
  referralCode: string | null;

  @Column({ type: 'int', nullable: true })
  referredByUserId: number | null;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'referredByUserId' })
  referredBy: User | null;

  @Column('decimal', { precision: 12, scale: 2, default: '0' })
  referralBalance: string;

  @Column('decimal', { precision: 12, scale: 2, default: '0' })
  totalReferralEarned: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @BeforeInsert()
  async hashPassword() {
    if (!this.password) return;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
}
