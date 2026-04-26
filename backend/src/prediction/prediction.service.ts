import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SensorReading } from '../sensor/sensor.entity'

export interface PredictionResult {
  sensorId:         string
  lokasi:           string
  moisture:         number
  temp:             number
  hum:              number
  kondisi:          string
  label:            number
  recommendation:   string   // siram_sekarang | siram_nanti | optimal
  nextWateringTime: string
  confidence:       number
  urgent:           boolean
  timestamp:        string
}

export interface PredictionSummary {
  avgMoisture:      number
  recommendation:   string
  nextWateringTime: string
  confidence:       number
  modelUsed:        string
  urgentCount:      number
  details:          PredictionResult[]
  timestamp:        string
}

@Injectable()
export class PredictionService {
  constructor(
    @InjectRepository(SensorReading)
    private readonly sensorRepo: Repository<SensorReading>,
  ) {}

  //TODO: count predict per sensor
  private predict(sensor: SensorReading): PredictionResult {
    const { moisture, temp, hum, label } = sensor

    //TODO: rec based on label from iot anjay
    let recommendation: string
    let confidence: number
    let urgent = false

    if (label === 1 || moisture <= 15) {
      recommendation = 'siram_sekarang'
      confidence     = 95
      urgent         = true
    } else if (moisture <= 29) {
      recommendation = 'siram_sekarang'
      confidence     = 90
      urgent         = true
    } else if (moisture <= 44) {
      recommendation = 'siram_nanti'
      confidence     = 82
    } else if (moisture <= 59) {
      recommendation = 'optimal'
      confidence     = 88
    } else {
      recommendation = 'optimal'
      confidence     = 92
    }

    //TODO: Logic calculate watering time WIB
    const toWIB = (d: Date) => d.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour:     '2-digit',
      minute:   '2-digit',
      hour12:   false,
    })
    const now = new Date()
    let nextWIB: string
    if (recommendation === 'siram_sekarang') {
      nextWIB = `${toWIB(now)} WIB`
    } else if (recommendation === 'siram_nanti') {
      now.setHours(now.getHours() + 2)
      nextWIB = `${toWIB(now)} WIB`
    } else {
      now.setHours(now.getHours() + 8)
      nextWIB = `${toWIB(now)} WIB`
    }

    return {
      sensorId:         sensor.sensorId,
      lokasi:           sensor.lokasi || sensor.sensorId,
      moisture,
      temp,
      hum,
      kondisi:          sensor.kondisi || this.getKondisi(moisture),
      label,
      recommendation,
      nextWateringTime: nextWIB,
      confidence,
      urgent,
      timestamp:        sensor.createdAt?.toISOString() || new Date().toISOString(),
    }
  }

  private getKondisi(moisture: number): string {
    if (moisture <= 29) return 'kering'
    if (moisture <= 63) return 'normal'
    return 'basah'
  }

  //TODO: new predict
  async getLatestPrediction(): Promise<PredictionSummary> {
    //TODO: retrieve the latest data
    const latest = await this.sensorRepo.query(`
      SELECT s.*
      FROM sensor_readings s
      INNER JOIN (
        SELECT sensorId, MAX(createdAt) as maxDate
        FROM sensor_readings
        GROUP BY sensorId
      ) t ON s.sensorId = t.sensorId AND s.createdAt = t.maxDate
      ORDER BY s.sensorId ASC
    `)

    if (!latest.length) {
      return {
        avgMoisture:      0,
        recommendation:   'optimal',
        nextWateringTime: '—',
        confidence:       0,
        modelUsed:        'random_forest',
        urgentCount:      0,
        details:          [],
        timestamp:        new Date().toISOString(),
      }
    }

    const details    = latest.map(s => this.predict(s))
    const avgMoist   = Math.round(details.reduce((a, d) => a + d.moisture, 0) / details.length)
    const urgentList = details.filter(d => d.urgent)

    //TODO: take worst rec as summary
    let topRec = 'optimal'
    if (urgentList.length > 0){
      topRec = 'siram_sekarang'
    } else if (details.some(d => d.recommendation === 'siram_nanti')){
       topRec = 'siram_nanti'
    }
    const topDetail = details.find(d => d.recommendation === topRec) || details[0]

    return {
      avgMoisture:      avgMoist,
      recommendation:   topRec,
      nextWateringTime: topDetail.nextWateringTime,
      confidence:       topDetail.confidence,
      modelUsed:        'random_forest',
      urgentCount:      urgentList.length,
      details,
      timestamp:        new Date().toISOString(),
    }
  }

  //TODO: predict manual input
  async predictManual(moisture: number, temp: number, hum: number, soil: number): Promise<any> {
    const label = moisture <= 29 ? 1 : 0
    const fake  = { sensorId: 'MANUAL', lokasi: 'Input Manual', moisture, temp, hum, soil, label, kondisi: this.getKondisi(moisture), createdAt: new Date() } as any
    return this.predict(fake)
  }
}