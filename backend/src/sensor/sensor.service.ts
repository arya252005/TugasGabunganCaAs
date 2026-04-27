import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThanOrEqual } from 'typeorm'
import { SensorReading } from './sensor.entity'
import { Notification } from '../notification/notification.entity'
import { CreateSensorDto } from './sensor.dto'

@Injectable()
export class SensorService {
  constructor(
    @InjectRepository(SensorReading)
    private readonly sensorRepo: Repository<SensorReading>,
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  private getKondisi(moisture: number, temp?: number, hum?: number, soil?: number): string {
    if (soil !== undefined) {
      if (soil > 500) return 'kering'
      return 'normal'
    }
    if (moisture <= 29) return 'kering'
    return 'normal'
  }

  private getRekomendasi(label: number, moisture: number): string {
    if (label === 1)   return 'siram_sekarang'
    if (moisture < 30) return 'siram_sekarang'
    if (moisture < 45) return 'siram_nanti'
    return 'optimal'
  }

  //TODO: call ML API 
  private async callMLApi(dto: CreateSensorDto): Promise<number> {
    const mlUrl = process.env.ML_API_URL
    if (!mlUrl) return dto.label ?? 0

    try {
      const res = await fetch(`${mlUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp: dto.temp,
          hum:  dto.hum,
          soil: dto.soil,
        }),
        signal: AbortSignal.timeout(5000),
      })

      if (!res.ok) return dto.label ?? 0
      const result = await res.json()
      return result?.hasil_prediksi?.kode_label ?? dto.label ?? 0

    } catch (err) {
      console.warn('ML API fallback to label IoT:', err.message)
      return dto.label ?? 0
    }
  }

  private async generateNotification(
    sensor: SensorReading,
    mlLabel: number,
  ): Promise<void> {
    let type: 'danger' | 'warning'
    let message: string

    if (sensor.soil <= 500) {
      return 
    }

    type    = 'danger'
    message = `${sensor.lokasi || sensor.sensorId} perlu disiram — kelembaban ${sensor.moisture}% soil ${sensor.soil}`

    //TODO: no duplicate 30m (no spam notif)
    const since = new Date(Date.now() - 30 * 60 * 1000)
    const exists = await this.notifRepo.findOne({
      where: { sensorId: sensor.sensorId, type, isRead: false },
      order: { createdAt: 'DESC' },
    })
    if (exists && new Date(exists.createdAt) > since) return

    await this.notifRepo.save(
      this.notifRepo.create({
        type,
        message,
        sensorId: sensor.sensorId,
        lokasi:   sensor.lokasi,
        moisture: sensor.moisture,
        isRead:   false,
      })
    )
  }

  async create(dto: CreateSensorDto): Promise<SensorReading> {
    const mlLabel = await this.callMLApi(dto)
    const kondisi = this.getKondisi(dto.moisture, dto.temp, dto.hum, dto.soil)

    const reading = await this.sensorRepo.save(
      this.sensorRepo.create({ ...dto, label: mlLabel, kondisi })
    )

    //TODO: auto generate notif
    await this.generateNotification(reading, mlLabel)

    return reading
  }

  async createBatch(dtos: CreateSensorDto[]): Promise<{ saved: number }> {
    for (const dto of dtos) {
      await this.create(dto)
    }
    return { saved: dtos.length }
  }

  async getLatest(): Promise<any[]> {
    const raw = await this.sensorRepo.query(`
      SELECT s.*
      FROM sensor_readings s
      INNER JOIN (
        SELECT sensorId, MAX(createdAt) as maxDate
        FROM sensor_readings
        GROUP BY sensorId
      ) latest ON s.sensorId = latest.sensorId
              AND s.createdAt = latest.maxDate
      ORDER BY s.sensorId ASC
    `)

    return raw.map(r => ({
      ...r,
      status:      r.soil > 500 ? 'dry' : 'ok',
      kondisi:     this.getKondisi(r.moisture, r.temp, r.hum, r.soil),
      rekomendasi: this.getRekomendasi(r.label, r.moisture),
    }))
  }

  async getHistory(sensorId?: string, hours = 24, limit = 500): Promise<any[]> {
    const since = new Date()
    since.setHours(since.getHours() - hours)

    const where: any = { createdAt: MoreThanOrEqual(since) }
    if (sensorId) where.sensorId = sensorId

    const data = await this.sensorRepo.find({
      where, order: { createdAt: 'ASC' }, take: limit,
    })

    if (!data.length) return []

    const points = data.length <= 20 ? data : data.slice(-20)

    return points.map(r => {
      const d   = new Date(r.createdAt)
      const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000)
      const hh  = String(wib.getUTCHours()).padStart(2, '0')
      const mm  = String(wib.getUTCMinutes()).padStart(2, '0')
      return {
        time:            `${hh}:${mm}`,
        kelembaban:      r.moisture,
        kelembabanUdara: Math.round(r.hum),
        suhu:            r.temp,
        soil:            r.soil,
        sensorId:        r.sensorId,
        timestamp:       r.createdAt,
      }
    })
  }

  async getDashboardSummary(): Promise<any> {
    const latest  = await this.getLatest()
    const history = await this.getHistory(null, 24, 100)

    if (!latest.length) {
      return {
        avgMoisture: 0, avgTemperature: 0,
        activeSensors: 0, sensorsNeedWater: 0,
        sensors: [], prediction: null,
        notifications: [], chartHistory: [],
      }
    }

    const avgMoisture      = Math.round(latest.reduce((a, s) => a + s.moisture, 0) / latest.length)
    const avgTemperature   = parseFloat((latest.reduce((a, s) => a + s.temp, 0) / latest.length).toFixed(1))
    const activeSensors    = Math.min(latest.length, 1) // 1 sensor
    const sensorsNeedWater = latest.some(s => s.label === 1 || s.moisture < 30) ? 1 : 0

    const rekomendasi = sensorsNeedWater > 0 ? 'siram_sekarang'
                      : latest.some(s => s.moisture < 45) ? 'siram_nanti'
                      : 'optimal'

    //TODO: Convert time WIB 
    const toWIB = (date: Date): string => date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour:     '2-digit',
      minute:   '2-digit',
      hour12:   false,
    })

    const getNextTime = (r: string) => {
      const now = new Date()
      if (r === 'siram_sekarang') return `${toWIB(now)} WIB`
      if (r === 'siram_nanti') {
        now.setHours(now.getHours() + 2)
        return `${toWIB(now)} WIB`
      }
      now.setHours(now.getHours() + 6)
      return `${toWIB(now)} WIB`
    }

    const prediction = {
      moistureLevel:    avgMoisture,
      recommendation:   rekomendasi,
      nextWateringTime: getNextTime(rekomendasi),
      confidence:       87,
      modelUsed:        process.env.ML_API_URL ? 'random_forest_ml' : 'threshold',
      timestamp:        new Date().toISOString(),
    }

    const notifications = await this.notifRepo.find({
      order: { createdAt: 'DESC' },
      take: 10,
    })

    return {
      avgMoisture, avgTemperature,
      activeSensors, sensorsNeedWater,
      sensors:      latest,
      prediction,
      notifications,
      chartHistory: history,
    }
  }
}