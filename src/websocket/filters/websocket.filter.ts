import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class WebSocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
    const ctx = host.switchToWs();
    const client = ctx.getClient();

    console.log('host.getArgs()', host.getArgs());
    console.log('exception', exception);
  }
}
