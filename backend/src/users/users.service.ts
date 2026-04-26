import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(name: string, email: string, password: string, role: string): Promise<User> {
    const exists = await this.userRepo.findOne({ where: { email } })
    if (exists) throw new ConflictException('Email sudah terdaftar')

    const hashed = await bcrypt.hash(password, 10)
    const user   = this.userRepo.create({ name, email, password: hashed, role })
    return this.userRepo.save(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } })
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } })
  }

  //TODO: delete pw before return -> client
  sanitize(user: User) {
    const { password, ...safe } = user
    return safe
  }
}