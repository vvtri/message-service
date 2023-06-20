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
  ToggleCameraCallReqDto,
  ToggleMicCallReqDto,
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
    @ConnectedSocket() socket: SocketWithAuth,
  ) {
    console.log('WS_MESSAGE_EVENT.JOIN_ROOM', socket.data.user.id);
    console.log('time', new Date().toISOString());
    return this.callWsService.joinRoom(body, socket);
  }

  @SubscribeMessage(WS_MESSAGE_EVENT.SEND_SIGNAL)
  sendSignal(
    @MessageBody() body: SendSignalCallReqDto,
    @ConnectedSocket() socket: SocketWithAuth,
  ) {
    console.log('WS_MESSAGE_EVENT.SEND_SIGNAL', socket.data.user.id);
    console.log('time', new Date().toISOString());
    return this.callWsService.sendSignal(body, socket);
  }

  @SubscribeMessage(WS_MESSAGE_EVENT.SEND_RETURN_SIGNAL)
  sendReturnSignal(
    @MessageBody() body: SendReturnSignalCallReqDto,
    @ConnectedSocket() socket: SocketWithAuth,
  ) {
    console.log('WS_MESSAGE_EVENT.SEND_RETURN_SIGNAL', socket.data.user.id);
    console.log('time', new Date().toISOString());
    return this.callWsService.sendReturnSignal(body, socket);
  }

  @SubscribeMessage(WS_MESSAGE_EVENT.TOGGLE_MIC)
  toggleMic(
    @MessageBody() body: ToggleMicCallReqDto,
    @ConnectedSocket() socket: SocketWithAuth,
  ) {
    console.log('WS_MESSAGE_EVENT.TOGGLE_MIC', socket.data.user.id);
    console.log('time', new Date().toISOString());
    return this.callWsService.toggleMic(body, socket);
  }

  @SubscribeMessage(WS_MESSAGE_EVENT.TOGGLE_CAMERA)
  toggleCamera(
    @MessageBody() body: ToggleCameraCallReqDto,
    @ConnectedSocket() socket: SocketWithAuth,
  ) {
    console.log('WS_MESSAGE_EVENT.TOGGLE_CAMERA', socket.data.user.id);
    console.log('time', new Date().toISOString());
    return this.callWsService.toggleCamera(body, socket);
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
