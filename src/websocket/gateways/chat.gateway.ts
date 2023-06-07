import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WS_MESSAGE_NAMESPACE } from 'shared';
import { Server } from 'socket.io';
import { SocketWithAuth } from '../interfaces/websocket.interface';
import { AuthWsService } from '../services/auth.ws.service';
import { ChatWsService } from '../services/chat.ws.service';

@WebSocketGateway({
  namespace: WS_MESSAGE_NAMESPACE.CHAT,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
    credentials: true,
  },
  allowEIO3: true,
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private authWsService: AuthWsService,
    private chatWsService: ChatWsService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.use(AuthWsService.authMiddlewareFactory(this.authWsService));
    this.chatWsService.server = server;
  }

  handleConnection(client: SocketWithAuth, ...args: any[]) {
    this.chatWsService.handleConnection(client);
  }

  handleDisconnect(client: SocketWithAuth) {
    this.chatWsService.handleDisconnect(client);
  }
}
