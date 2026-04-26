import {
  Controller, Get, Post, Body, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { SensorService } from './sensor.service'
import { CreateSensorDto } from './sensor.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  //TODO: POST /sensor/data
  @Post('data')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateSensorDto) {
    const data = await this.sensorService.create(dto)
    return { success: true, data }
  }

  //TODO: POST /sensor/batch
  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  async createBatch(@Body() body: { data: CreateSensorDto[] }) {
    return this.sensorService.createBatch(body.data)
  }

  //TODO: GET /sensor/latest
  @Get('latest')
  @UseGuards(JwtAuthGuard)
  async getLatest() {
    return this.sensorService.getLatest()
  }

  //TODO: GET /sensor/history
  // ?sensorId=S-01 & (hours=24 & limit=100)
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Query('sensorId') sensorId?: string,
    @Query('hours') hours?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sensorService.getHistory(
      sensorId,
      hours  ? parseInt(hours)  : 24,
      limit  ? parseInt(limit)  : 100,
    )
  }
}