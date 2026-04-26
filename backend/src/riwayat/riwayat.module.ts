import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SensorReading } from '../sensor/sensor.entity'
import { RiwayatService } from './riwayat.service'
import { RiwayatController } from './riwayat.controller'

@Module({
  imports: [TypeOrmModule.forFeature([SensorReading])],
  providers: [RiwayatService],
  controllers: [RiwayatController],
})
export class RiwayatModule {}