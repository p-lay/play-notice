import './resolveAliasPath'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './module/app.module'
import { config } from './config'
import { ExceptionFilter } from './filter/exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalFilters(new ExceptionFilter())

  await app.listen(config.port, config.hostName, () => {
    console.log(
      `justPlay server has been started on http://${config.hostName}:${config.port}`,
    )
  })
}
bootstrap()
