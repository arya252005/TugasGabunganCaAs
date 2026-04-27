import { Module }           from '@nestjs/common'
import { APP_GUARD }        from '@nestjs/core'
import { TypeOrmModule }    from '@nestjs/typeorm'
import { ConfigModule }     from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { databaseConfig }   from './config/database.config'
import { AuthModule }       from './auth/auth.module'
import { UsersModule }      from './users/users.module'
import { SensorModule }     from './sensor/sensor.module'
import { PredictionModule } from './prediction/prediction.module'
import { RiwayatModule }    from './riwayat/riwayat.module'
import { NotificationModule } from './notification/notification.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: databaseConfig }),

    //TODO: Rate limiting max 100 request/60s per IP
    ThrottlerModule.forRoot([{
      ttl:   60000,
      limit: 100,
    }]),

    AuthModule,
    UsersModule,
    SensorModule,
    PredictionModule,
    RiwayatModule,
    NotificationModule,
  ],
  providers: [
    //TODO: Activated limit
    {
      provide:  APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}