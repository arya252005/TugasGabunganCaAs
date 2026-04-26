import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Notification } from './notification.entity'
import { SensorReading } from '../sensor/sensor.entity'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
    @InjectRepository(SensorReading)
    private readonly sensorRepo: Repository<SensorReading>,
  ) {}

  //TODO: Generate notif from data sensor (newest)
  async generateFromSensor(sensor: SensorReading): Promise<void> {
    let type: 'danger' | 'warning' | 'info'
    let message: string

    if (sensor.moisture <= 29 || sensor.label === 1) {
      type    = 'danger'
      message = `${sensor.lokasi || sensor.sensorId} perlu disiram sekarang (${sensor.moisture}%)`
    } else if (sensor.moisture <= 44) {
      type    = 'warning'
      message = `${sensor.lokasi || sensor.sensorId} kelembaban mendekati batas minimum (${sensor.moisture}%)`
    } else {
      type    = 'info'
      message = `${sensor.lokasi || sensor.sensorId} kondisi optimal (${sensor.moisture}%)`
    }

    //TODO: duplikat check, no create same notif: 30m
    const since = new Date(Date.now() - 30 * 60 * 1000)
    const existing = await this.notifRepo.findOne({
      where: { sensorId: sensor.sensorId, type, isRead: false },
      order: { createdAt: 'DESC' },
    })

    if (existing && new Date(existing.createdAt) > since) return

    await this.notifRepo.save(
      this.notifRepo.create({
        type, message,
        sensorId: sensor.sensorId,
        lokasi:   sensor.lokasi,
        moisture: sensor.moisture,
        isRead:   false,
      })
    )
  }

  //TODO: Take all notification
  async getAll(params: { isRead?: boolean; page?: number; limit?: number }) {
    const { isRead, page = 1, limit = 30 } = params
    const where: any = {}
    if (isRead !== undefined) where.isRead = isRead

    const [data, total] = await this.notifRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    })

    return {
      data,
      total,
      unreadCount: await this.notifRepo.count({ where: { isRead: false } }),
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  //TODO:mark one notif read
    async markRead(id: number) {
    await this.notifRepo.update(id, { isRead: true })
    return { success: true }
  }

  //TODO:mark all read
  async markAllRead() {
    await this.notifRepo.update({ isRead: false }, { isRead: true })
    return { success: true }
  }

  //TODO: delete old notif (> 7 hari)
  async deleteOld() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    await this.notifRepo
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoff', { cutoff })
      .andWhere('isRead = true')
      .execute()
    return { success: true }
  }

  //TODO: Summary topbar
  async getSummary() {
    const unreadCount = await this.notifRepo.count({ where: { isRead: false } })
    const latest = await this.notifRepo.find({
      where: { isRead: false },
      order: { createdAt: 'DESC' },
      take: 5,
    })
    return { unreadCount, latest }
  }
}