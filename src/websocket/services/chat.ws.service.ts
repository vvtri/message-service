import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { User } from '../../auth/entities/user.entity';
import { genWsConversationRoomName } from '../../common/utils/socket.util';
import { ConversationMemberRepository } from '../../conversation/repositories/conversation-member.repository';
import { SocketWithAuth } from '../interfaces/websocket.interface';

@Injectable()
export class ChatWsService {
  server: Server;
  constructor(private conversationMemberRepo: ConversationMemberRepository) {}

  async handleConnection(socket: SocketWithAuth) {
    const user: User = socket.data.user;
    const conversationMembers = await this.conversationMemberRepo.findBy({
      userId: user.id,
    });

    socket.join(
      conversationMembers.map((item) =>
        genWsConversationRoomName(item.conversationId),
      ),
    );
    socket.join(String(user.id));
    socket.emit('welcome', `user ${user.id} join`);
  }

  async handleDisconnect(client: SocketWithAuth) {}
}
