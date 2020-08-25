import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduleModule } from '@nestjs/schedule'
import { config } from '../config'
import { services } from './services'
import { customizeServices } from './customize/services'
import { entities } from './entities'
import { customizeEntities } from './customize/entities'
import { controllers } from './controllers'
import { customizeControllers } from './customize/controllers'

@Module({
  imports: [
    TypeOrmModule.forRoot(config.orm as any),
    TypeOrmModule.forFeature([...entities, ...customizeEntities]),
    ScheduleModule.forRoot(),
  ],
  controllers: [...controllers, ...customizeControllers],
  providers: [...services, ...customizeServices],
})
export class AppModule {}
