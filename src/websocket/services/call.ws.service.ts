import { Injectable } from '@nestjs/common';
import { MessageType, WS_MESSAGE_EVENT } from 'shared';
import { Server } from 'socket.io';
import { UserResDto } from '../../auth/dtos/common/res/user.res.dto';
import { UserProfileRepository } from '../../auth/repositories/user-profile.repository';
import { UserRepository } from '../../auth/repositories/user.repository';
import { ConversationMemberRepository } from '../../conversation/repositories/conversation-member.repository';
import { ConversationRepository } from '../../conversation/repositories/conversation.repository';
import { MessageRepository } from '../../conversation/repositories/message.repository';
import {
  JoinRoomCallReqDto,
  SendReturnSignalCallReqDto,
  SendSignalCallReqDto,
} from '../dtos/call/req/call.req.dto';
import { JoinerInfo } from '../dtos/call/res/call.res.dto';
import { SocketWithAuth } from '../interfaces/websocket.interface';

export const CALL_DATA: {
  [key: string]: JoinerInfo[];
} = {};
const SOCKET_TO_ROOM: { [key: string]: string } = {};

@Injectable()
export class CallWsService {
  server: Server;
  constructor(
    private conversationRepo: ConversationRepository,
    private conversationMemberRepo: ConversationMemberRepository,
    private userRepo: UserRepository,
    private messageRepo: MessageRepository,
    private userProfileRepo: UserProfileRepository,
  ) {}

  async joinRoom(dto: JoinRoomCallReqDto, socket: SocketWithAuth) {
    const { roomId } = dto;

    const users = CALL_DATA[roomId] || [];

    const isInvalid = await this.validateCall(roomId, socket);
    if (isInvalid) return;

    socket.join(roomId.toString());
    socket.emit(WS_MESSAGE_EVENT.JOINED_ROOM, users);
    SOCKET_TO_ROOM[socket.id] = roomId.toString();

    const existedUser = users.find((item) => item.user.id === socket.user.id);

    if (!existedUser) {
      const user = await this.userRepo.findOne({
        where: { id: socket.user.id },
        relations: { userProfile: { avatar: true } },
      });

      users.push({
        user: UserResDto.forUser({ data: user }),
        socketId: socket.id,
      });
    }

    CALL_DATA[roomId] = users;
  }

  async sendSignal(dto: SendSignalCallReqDto, client: SocketWithAuth) {
    const { signal, toSocket } = dto;

    const roomId = SOCKET_TO_ROOM[client.id];

    this.server.to(toSocket).emit(WS_MESSAGE_EVENT.NEW_USER_JOINED, {
      signal,
      newUserData: CALL_DATA[roomId].find(
        (item) => item.socketId === client.id,
      ),
    });
  }

  async sendReturnSignal(
    dto: SendReturnSignalCallReqDto,
    client: SocketWithAuth,
  ) {
    const { signal, toSocket } = dto;

    const roomId = SOCKET_TO_ROOM[client.id];

    this.server.to(toSocket).emit(WS_MESSAGE_EVENT.RECEIVE_RETURN_SIGNAL, {
      signal,
      fromData: CALL_DATA[roomId].find((item) => item.socketId === client.id),
    });
  }

  async handleConnection(client: SocketWithAuth) {
    client.join(client.user.id.toString());
  }

  async handleDisconnect(client: SocketWithAuth) {
    const roomId = SOCKET_TO_ROOM[client.id];
    if (!roomId) return;

    let user: UserResDto;
    CALL_DATA[roomId] = CALL_DATA[roomId].filter((item) => {
      if (item.socketId !== client.id) return true;

      user = item.user;
      return false;
    });

    this.server
      .to(roomId)
      .emit(WS_MESSAGE_EVENT.USER_LEFT_ROOM, { socketId: client.id, user });
  }

  private async validateCall(roomId: string, socket: SocketWithAuth) {
    const conversation = await this.conversationRepo.findOneBy({
      messages: { id: Number(roomId), type: MessageType.CALL },
    });

    if (!conversation) {
      socket.emit(WS_MESSAGE_EVENT.INVALID_CALL);
      return false;
    }

    const conversationMember = await this.conversationMemberRepo.findOneBy({
      conversationId: conversation.id,
      userId: socket.user.id,
    });

    if (!conversationMember) {
      socket.emit(WS_MESSAGE_EVENT.INVALID_CALL);
      return false;
    }

    this.createMsgJoin(socket.user.id, conversation.id).catch((err) =>
      console.log('error happen when create message user joined call', err),
    );
  }

  private async createMsgJoin(userId: number, conversationId: number) {
    const userProfile = await this.userProfileRepo.findOneBy({ userId });

    const message = this.messageRepo.create({
      type: MessageType.SYSTEM,
      content: `${userProfile.name} joined the call.`,
      conversationId,
    });
    await this.messageRepo.save(message);
  }
}
