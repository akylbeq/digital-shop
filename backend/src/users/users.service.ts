import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { randomBytes } from 'crypto';
import { ReferralsService } from '../referrals/referrals.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly referralsService: ReferralsService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const exist = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exist) {
      throw new ConflictException('User already exists');
    }
    const user = this.usersRepo.create(dto);
    return this.usersRepo.save(user);
  }

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }

  findByTelegramId(telegramId: string) {
    return this.usersRepo.findOne({ where: { telegramId } });
  }

  async findByReferralCode(code: string): Promise<User | null> {
    if (!code?.trim()) return null;
    return this.usersRepo.findOne({ where: { referralCode: code.trim() } });
  }

  /** Генерирует referralCode, если ещё нет */
  async ensureReferralCode(user: User): Promise<User> {
    if (user.referralCode) return user;
    for (let i = 0; i < 8; i++) {
      const code = randomBytes(6).toString('hex').toUpperCase();
      const taken = await this.usersRepo.findOne({
        where: { referralCode: code },
      });
      if (!taken) {
        user.referralCode = code;
        return this.usersRepo.save(user);
      }
    }
    user.referralCode = randomBytes(12).toString('hex').toUpperCase();
    return this.usersRepo.save(user);
  }

  async getReferralProfileInfo(userId: number) {
    const user = await this.findById(userId);
    if (!user) return null;
    const withCode = await this.ensureReferralCode(user);
    const stats = await this.referralsService.getStatsForUser(userId);
    return { user: withCode, stats };
  }

  async findOrCreateTelegramUser(data: {
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    /** payload из /start (например ref_ABC123) */
    startPayload?: string;
  }) {
    let user = await this.findByTelegramId(data.telegramId);
    if (user) {
      user.telegramUsername = data.username ?? user.telegramUsername;
      user.telegramFirstName = data.firstName ?? user.telegramFirstName;
      user.telegramLastName = data.lastName ?? user.telegramLastName;
      user = await this.usersRepo.save(user);
      return this.ensureReferralCode(user);
    }

    let referredByUserId: number | null = null;
    const raw = data.startPayload?.trim();
    if (raw?.startsWith('ref_')) {
      const code = raw.slice(4);
      const referrer = await this.findByReferralCode(code);
      if (referrer && referrer.telegramId !== data.telegramId) {
        referredByUserId = referrer.id;
      }
    }

    user = this.usersRepo.create({
      telegramId: data.telegramId,
      telegramUsername: data.username ?? null,
      telegramFirstName: data.firstName ?? null,
      telegramLastName: data.lastName ?? null,
      email: null,
      password: null,
      role: Role.USER,
      referredByUserId,
      referralBalance: '0',
      totalReferralEarned: '0',
    });
    user = await this.usersRepo.save(user);
    if (user.referredByUserId === user.id) {
      user.referredByUserId = null;
      await this.usersRepo.save(user);
    }
    return this.ensureReferralCode(user);
  }
}
