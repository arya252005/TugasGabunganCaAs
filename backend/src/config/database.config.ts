import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { User } from '../users/user.entity'
import { SensorReading } from '../sensor/sensor.entity'
import { Notification } from '../notification/notification.entity'

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'caas02',
  database: process.env.DB_NAME || 'caas3_agriculture',
  entities: [User, SensorReading, Notification],
  synchronize: true,
  logging: false,
})