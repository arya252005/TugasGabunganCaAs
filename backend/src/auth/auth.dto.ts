import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  @IsString()
  name: string

  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string

  @IsNotEmpty({ message: 'Kata sandi wajib diisi' })
  @MinLength(8, { message: 'Kata sandi minimal 8 karakter' })
  password: string
}

export class LoginDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string

  @IsNotEmpty({ message: 'Kata sandi wajib diisi' })
  password: string
}