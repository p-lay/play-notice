import {
  Catch,
  ArgumentsHost,
  HttpException,
  ExceptionFilter as NestExceptionFilter,
  HttpStatus,
} from '@nestjs/common'
import { Exception } from '../util/exception'

@Catch()
export class ExceptionFilter implements NestExceptionFilter {
  async catch(exception: Exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    if (exception instanceof Exception) {
      response.status(200)
      response.header('Content-Type', 'application/json; charset=utf-8')
      response.send({
        code: exception.code,
        message: exception.message,
      })
    } else {
      const otherException = exception as any
      response.status(HttpStatus.INTERNAL_SERVER_ERROR)
      response.header('Content-Type', 'application/json; charset=utf-8')
      response.send({
        message: otherException.message,
      })
    }
  }
}
