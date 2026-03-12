import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo : Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto) {
    const exist = await this.usersRepo.findOne({where: {email: dto.email}});
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
}
