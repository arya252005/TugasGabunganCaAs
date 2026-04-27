import { NestFactory }     from '@nestjs/core'
import { ValidationPipe }  from '@nestjs/common'
import { AppModule }       from './app.module'
import helmet              from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(helmet())

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3001',
    ],
    methods:     ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: false,
      transform:            true,
    }),
  )

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`API: http://localhost:${port}`)
}

bootstrap()