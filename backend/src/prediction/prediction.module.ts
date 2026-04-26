import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SensorReading } from '../sensor/sensor.entity'
import { PredictionService } from './prediction.service'
import { PredictionController } from './prediction.controller'

@Module({
  imports: [TypeOrmModule.forFeature([SensorReading])],
  providers: [PredictionService],
  controllers: [PredictionController],
  exports: [PredictionService],
})
export class PredictionModule {}