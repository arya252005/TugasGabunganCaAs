import { Controller, Get, UseGuards } from '@nestjs/common'
import { SensorService } from './sensor.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly sensorService: SensorService) {}

  //TODO: GET /dashboard/summary
  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getSummary() {
    return this.sensorService.getDashboardSummary()
  }
}