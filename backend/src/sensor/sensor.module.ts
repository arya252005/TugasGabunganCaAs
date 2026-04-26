import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SensorReading } from './sensor.entity'
import { Notification } from '../notification/notification.entity'
import { SensorService } from './sensor.service'
import { SensorController } from './sensor.controller'
import { DashboardController } from './dashboard.controller'

@Module({
  imports: [TypeOrmModule.forFeature([SensorReading, Notification])],
  providers: [SensorService],
  controllers: [SensorController, DashboardController],
  exports: [SensorService],
})
export class SensorModule {}