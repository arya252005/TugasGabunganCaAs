import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'
import { RegisterDto, LoginDto } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(
      dto.name,
      dto.email,
      dto.password,
      'Admin',
    )
    return {
      message: 'Akun berhasil dibuat',
      user: this.usersService.sanitize(user),
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email)
    if (!user) throw new UnauthorizedException('Email atau kata sandi salah')

    const match = await bcrypt.compare(dto.password, user.password)
    if (!match) throw new UnauthorizedException('Email atau kata sandi salah')

    if (!user.isActive) throw new UnauthorizedException('Akun tidak aktif')

    const payload = { sub: user.id, email: user.email, role: user.role }
    const token   = this.jwtService.sign(payload)

    return {
      access_token: token,
      user: this.usersService.sanitize(user),
    }
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId)
    return this.usersService.sanitize(user)
  }
}