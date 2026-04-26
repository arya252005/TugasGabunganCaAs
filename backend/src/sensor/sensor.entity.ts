import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity('sensor_readings')
export class SensorReading {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 20 })
  sensorId: string

  @Column({ length: 100, nullable: true })
  lokasi: string

  @Column('float')
  temp: number         

  @Column('float')
  hum: number          

  @Column('int')
  soil: number         

  @Column('int')
  moisture: number     

  @Column('int', { default: 0 })
  label: number

  //TODO: condition: 'kering' | 'normal' | 'basah'
  @Column({ length: 20, nullable: true })
  kondisi: string

  @CreateDateColumn()
  createdAt: Date
}