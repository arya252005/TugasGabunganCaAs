import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('notification')
export class NotificationController {
  constructor(private readonly notifService: NotificationService) {}

  //TODO: GET /notification? isRead=false & (page=1 & limit=30)
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(
    @Query('isRead') isRead?: string,
    @Query('page')   page?: string,
    @Query('limit')  limit?: string,
  ) {
    return this.notifService.getAll({
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      page:   page  ? parseInt(page)  : 1,
      limit:  limit ? parseInt(limit) : 30,
    })
  }

  //TODO: GET /notification/summary (top bar sum)
  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getSummary() {
    return this.notifService.getSummary()
  }

  //TODO: PATCH /notification/:id/read (mark 1 notif read)
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markRead(@Param('id') id: string) {
    return this.notifService.markRead(parseInt(id))
  }

  //TODO: PATCH /notification/read-all (mark all read)
  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllRead() {
    return this.notifService.markAllRead()
  }

  //TODO: DELETE /notification/old (delete old notifications)
  @Delete('old')
  @UseGuards(JwtAuthGuard)
  async deleteOld() {
    return this.notifService.deleteOld()
  }
}