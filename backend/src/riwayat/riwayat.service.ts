import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, Like } from 'typeorm'
import { SensorReading } from '../sensor/sensor.entity'

@Injectable()
export class RiwayatService {
  constructor(
    @InjectRepository(SensorReading)
    private readonly repo: Repository<SensorReading>,
  ) {}

  async getHistory(params: {
    sensorId?: string
    startDate?: string
    endDate?: string
    kondisi?: string
    page?: number
    limit?: number
  }) {
    const { sensorId, startDate, endDate, kondisi, page = 1, limit = 50 } = params

    const where: any = {}
    if (sensorId) where.sensorId = sensorId
    if (kondisi)  where.kondisi  = kondisi
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate))
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    })

    return {
      data: data.map(r => this.format(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getStats(sensorId?: string, days: number = 7) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const where: any = { createdAt: Between(since, new Date()) }
    if (sensorId) where.sensorId = sensorId

    const data = await this.repo.find({ where, order: { createdAt: 'ASC' } })

    if (!data.length) return { avg: 0, min: 0, max: 0, totalRecords: 0, trend: [] }

    const moistures = data.map(d => d.moisture)
    const avg       = Math.round(moistures.reduce((a, b) => a + b, 0) / moistures.length)
    const min       = Math.min(...moistures)
    const max       = Math.max(...moistures)

    //TODO: max 20 data
    const points = data.length <= 20 ? data : (() => {
      const step = Math.floor(data.length / 20)
      return data.filter((_, i) => i % step === 0).slice(0, 20)
    })()

    const trend = points.map(d => {
      const utc = new Date(d.createdAt)
      const wib = new Date(utc.getTime() + 7 * 60 * 60 * 1000)
      const hh  = String(wib.getUTCHours()).padStart(2, '0')
      const mm  = String(wib.getUTCMinutes()).padStart(2, '0')
      return {
        date:        `${hh}:${mm}`,
        avgMoisture: d.moisture,
        count:       1,
      }
    })

    return { avg, min, max, totalRecords: data.length, trend }
  }

  async getSensorList() {
    const raw = await this.repo.query(
      'SELECT DISTINCT sensorId, lokasi FROM sensor_readings ORDER BY sensorId'
    )
    return raw
  }

  private format(r: SensorReading) {
    return {
      id:        r.id,
      sensorId:  r.sensorId,
      lokasi:    r.lokasi,
      moisture:  r.moisture,
      temp:      r.temp,
      hum:       r.hum,
      soil:      r.soil,
      label:     r.label,
      kondisi:   r.kondisi,
      status:    r.moisture <= 29 ? 'dry' : r.moisture <= 59 ? 'warn' : 'ok',
      createdAt: r.createdAt,
    }
  }
}