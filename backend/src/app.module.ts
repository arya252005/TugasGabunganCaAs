import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { databaseConfig } from './config/database.config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { SensorModule } from './sensor/sensor.module'
import { PredictionModule } from './prediction/prediction.module'
import { RiwayatModule } from './riwayat/riwayat.module'
import { NotificationModule } from './notification/notification.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: databaseConfig }),
    AuthModule,
    UsersModule,
    SensorModule,
    PredictionModule,
    RiwayatModule,
    NotificationModule,
  ],
})
export class AppModule {}