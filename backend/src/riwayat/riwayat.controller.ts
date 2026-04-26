import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { RiwayatService } from './riwayat.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('riwayat')
export class RiwayatController {
  constructor(private readonly riwayatService: RiwayatService) {}

  //TODO: GET /riwayat
  // ?sensorId=S-001 & startDate=2026-04-01 & endDate=2026-04-22 & kondisi=kering & (page=1 & limit=50)
  @Get()
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Query('sensorId')  sensorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate')   endDate?: string,
    @Query('kondisi')   kondisi?: string,
    @Query('page')      page?: string,
    @Query('limit')     limit?: string,
  ) {
    return this.riwayatService.getHistory({
      sensorId, startDate, endDate, kondisi,
      page:  page  ? parseInt(page)  : 1,
      limit: limit ? parseInt(limit) : 50,
    })
  }

  //TODO: GET /riwayat/stats? sensorId=S-01 & days=7
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(
    @Query('sensorId') sensorId?: string,
    @Query('days')     days?: string,
  ) {
    return this.riwayatService.getStats(sensorId, days ? parseInt(days) : 7)
  }

  //TODO: GET /riwayat/sensors, sensor list
  @Get('sensors')
  @UseGuards(JwtAuthGuard)
  async getSensors() {
    return this.riwayatService.getSensorList()
  }
}