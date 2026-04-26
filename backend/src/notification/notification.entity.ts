import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm'

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number

  //INFO: danger=kering, warning=rendah, info=optimal
  @Column({ type: 'enum', enum: ['danger', 'warning', 'info'], default: 'info' })
  type: string 

  @Column({ length: 300 })
  message: string

  @Column({ length: 20, nullable: true })
  sensorId: string

  @Column({ length: 100, nullable: true })
  lokasi: string

  @Column('int', { nullable: true })
  moisture: number

  @Column({ default: false })
  isRead: boolean

  @Column({ nullable: true })
  userId: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}