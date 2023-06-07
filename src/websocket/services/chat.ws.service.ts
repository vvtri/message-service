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

  async handleConnection(client: SocketWithAuth) {
    const user: User = client.user;
    const conversationMembers = await this.conversationMemberRepo.findBy({
      userId: user.id,
    });

    client.join(
      conversationMembers.map((item) =>
        genWsConversationRoomName(item.conversationId),
      ),
    );
    client.join(String(user.id));
    client.emit('welcome', `user ${user.id} join`);
  }

  async handleDisconnect(client: SocketWithAuth) {}
}
