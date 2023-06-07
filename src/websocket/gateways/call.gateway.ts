import { UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WS_MESSAGE_EVENT, WS_MESSAGE_NAMESPACE } from 'shared';
import { Server } from 'socket.io';
import {
  JoinRoomCallReqDto,
  SendReturnSignalCallReqDto,
  SendSignalCallReqDto,
} from '../dtos/call/req/call.req.dto';
import { WebSocketExceptionsFilter } from '../filters/websocket.filter';
import { SocketWithAuth } from '../interfaces/websocket.interface';
import { AuthWsService } from '../services/auth.ws.service';
import { CallWsService } from '../services/call.ws.service';

@WebSocketGateway({
  namespace: WS_MESSAGE_NAMESPACE.CALL,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
    credentials: true,
  },
  allowEIO3: true,
})
@UseFilters(WebSocketExceptionsFilter)
export class CallGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private authWsService: AuthWsService,
    private callWsService: CallWsService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage(WS_MESSAGE_EVENT.JOIN_ROOM)
  joinRoom(
    @MessageBody() body: JoinRoomCallReqDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    return this.callWsService.joinRoom(body, client);
  }

  @SubscribeMessage(WS_MESSAGE_EVENT.SEND_SIGNAL)
  sendSignal(
    @MessageBody() body: SendSignalCallReqDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    return this.callWsService.sendSignal(body, client);
  }

  @SubscribeMessage(WS_MESSAGE_EVENT.SEND_RETURN_SIGNAL)
  sendReturnSignal(
    @MessageBody() body: SendReturnSignalCallReqDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    return this.callWsService.sendReturnSignal(body, client);
  }

  afterInit(server: Server) {
    server.use(AuthWsService.authMiddlewareFactory(this.authWsService));
    this.callWsService.server = server;
  }

  async handleConnection(client: SocketWithAuth, ...args: any[]) {
    try {
      await this.callWsService.handleConnection(client);
    } catch (error) {
      console.log('error', error);
    }
  }

  async handleDisconnect(client: SocketWithAuth) {
    try {
      await this.callWsService.handleDisconnect(client);
    } catch (error) {
      console.log('error', error);
    }
  }
}
