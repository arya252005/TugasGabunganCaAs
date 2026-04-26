import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { PredictionService } from './prediction.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  //TODO: GET /prediction/latest (predict all newest sensor)
  @Get('latest')
  @UseGuards(JwtAuthGuard)
  async getLatest() {
    return this.predictionService.getLatestPrediction()
  }

  //TODO: POST /prediction/manual (manual input test)
  @Post('manual')
  @UseGuards(JwtAuthGuard)
  async predictManual(@Body() body: { moisture: number; temp: number; hum: number; soil: number }) {
    return this.predictionService.predictManual(
      body.moisture, body.temp, body.hum, body.soil
    )
  }
}