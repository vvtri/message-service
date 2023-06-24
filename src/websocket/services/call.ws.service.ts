import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { tryParseJson } from 'common';
import Redis from 'ioredis';
import { MessageType, WS_MESSAGE_EVENT } from 'shared';
import { Server } from 'socket.io';
import { UserResDto } from '../../auth/dtos/common/res/user.res.dto';
import { UserProfileRepository } from '../../auth/repositories/user-profile.repository';
import { UserRepository } from '../../auth/repositories/user.repository';
import { REDIS_KEY } from '../../common/constants/redis.constant';
import { ConversationMemberRepository } from '../../conversation/repositories/conversation-member.repository';
import { ConversationRepository } from '../../conversation/repositories/conversation.repository';
import { MessageRepository } from '../../conversation/repositories/message.repository';
import { CALL_ROOM_KEY } from '../constants/websocket.constant';
import {
  JoinRoomCallReqDto,
  SendReturnSignalCallReqDto,
  SendSignalCallReqDto,
  ToggleCameraCallReqDto,
  ToggleMicCallReqDto,
} from '../dtos/call/req/call.req.dto';
import {
  ToggleCameraCallResDto,
  ToggleMicCallResDto,
} from '../dtos/call/res/call.res.dto';
import { CallJoinerInfoIntDto } from '../dtos/int/joiner-info.int.dto';
import { SocketWithAuth } from '../interfaces/websocket.interface';

@Injectable()
export class CallWsService {
  server: Server;
  constructor(
    @InjectRedis() private redis: Redis,

    private conversationRepo: ConversationRepository,
    private conversationMemberRepo: ConversationMemberRepository,
    private userRepo: UserRepository,
    private messageRepo: MessageRepository,
    private userProfileRepo: UserProfileRepository,
  ) {}

  async joinRoom(dto: JoinRoomCallReqDto, socket: SocketWithAuth) {
    const { roomId } = dto;

    const isValid = await this.validateCall(roomId, socket);
    if (!isValid) return;

    const joinerData = await this.getAllRoomJoinerData(roomId);

    socket.join(roomId);
    socket.emit(WS_MESSAGE_EVENT.JOINED_ROOM, joinerData);

    this.setCallRoomId(socket, roomId);

    const user = await this.userRepo.findOne({
      where: { id: socket.data.user.id },
      relations: { userProfile: { avatar: true } },
    });

    const joinerInfo: CallJoinerInfoIntDto = {
      socketId: socket.id,
      user: UserResDto.forUser({ data: user }),
      isMuteMic: false,
      isOffCamera: false,
    };

    await this.setRoomJoinerData(socket, joinerInfo);
  }

  async sendSignal(dto: SendSignalCallReqDto, socket: SocketWithAuth) {
    const { signal, toSocket } = dto;

    const roomId = this.getCallRoomId(socket);

    const newUserData = await this.getRoomJoinerData(roomId, socket.id);

    this.server
      .to(toSocket)
      .emit(WS_MESSAGE_EVENT.NEW_USER_JOINED, { signal, newUserData });
  }

  async sendReturnSignal(
    dto: SendReturnSignalCallReqDto,
    socket: SocketWithAuth,
  ) {
    const { signal, toSocket } = dto;

    const roomId = this.getCallRoomId(socket);

    const senderData = await this.getRoomJoinerData(roomId, socket.id);

    this.server.to(toSocket).emit(WS_MESSAGE_EVENT.RECEIVE_RETURN_SIGNAL, {
      signal,
      fromData: senderData,
    });
  }

  async toggleMic(dto: ToggleMicCallReqDto, socket: SocketWithAuth) {
    const { isMuteMic } = dto;

    const roomId = this.getCallRoomId(socket);

    const joinerInfo = await this.getRoomJoinerData(roomId, socket.id);
    const newJoinerInfo = { ...joinerInfo, isMuteMic };
    await this.setRoomJoinerData(socket, newJoinerInfo);

    const res: ToggleMicCallResDto = { joinerInfo: newJoinerInfo };
    socket.to(roomId).emit(WS_MESSAGE_EVENT.TOGGLE_MIC, res);
  }

  async toggleCamera(dto: ToggleCameraCallReqDto, socket: SocketWithAuth) {
    const { isOffCamera } = dto;

    const roomId = this.getCallRoomId(socket);

    const joinerInfo = await this.getRoomJoinerData(roomId, socket.id);
    const newJoinerInfo = { ...joinerInfo, isOffCamera };
    await this.setRoomJoinerData(socket, newJoinerInfo);

    const res: ToggleCameraCallResDto = { joinerInfo: newJoinerInfo };
    socket.to(roomId).emit(WS_MESSAGE_EVENT.TOGGLE_CAMERA, res);
  }

  async handleConnection(socket: SocketWithAuth) {
    console.log('socket connected', socket.id);
  }

  async handleDisconnect(socket: SocketWithAuth) {
    const roomId = this.getCallRoomId(socket);
    if (!roomId) return;

    const joinerInfo = await this.getRoomJoinerData(roomId, socket.id);

    await this.delRoomJoinerData(socket);
    console.log(
      'WS_MESSAGE_EVENT.USER_LEFT_ROOM',
      WS_MESSAGE_EVENT.USER_LEFT_ROOM,
    );
    this.server.to(roomId).emit(WS_MESSAGE_EVENT.USER_LEFT_ROOM, {
      socketId: socket.id,
      user: joinerInfo.user,
    });
  }

  // handler function
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
      userId: socket.data.user.id,
    });

    if (!conversationMember) {
      socket.emit(WS_MESSAGE_EVENT.INVALID_CALL);
      return false;
    }

    // this.createMsgJoin(socket.data.user.id, conversation.id).catch((err) =>
    //   console.log('error happen when create message user joined call', err),
    // );

    return true;
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

  private async getAllRoomJoinerData(roomId: string) {
    const roomJoinerKey = this.genRedisRoomJoinerKey(roomId);

    const joinerDataStrs = await this.redis.hgetall(roomJoinerKey);

    const joinerData =
      Object.values(joinerDataStrs)?.map<CallJoinerInfoIntDto>((item) =>
        tryParseJson(item),
      ) || [];

    return joinerData;
  }

  private async getRoomJoinerData(roomId: string, socketId: string) {
    const roomJoinerKey = this.genRedisRoomJoinerKey(roomId);

    const joinerDataStrs = await this.redis.hget(roomJoinerKey, socketId);

    const joinerData = tryParseJson(joinerDataStrs) as CallJoinerInfoIntDto;

    return joinerData;
  }

  private async setRoomJoinerData(
    socket: SocketWithAuth,
    data: CallJoinerInfoIntDto,
  ) {
    const roomId = this.getCallRoomId(socket);
    const roomJoinerKey = this.genRedisRoomJoinerKey(roomId);

    return await this.redis.hset(
      roomJoinerKey,
      socket.id,
      JSON.stringify(data),
    );
  }

  private async delRoomJoinerData(socket: SocketWithAuth) {
    const roomId = this.getCallRoomId(socket);
    const roomJoinerKey = this.genRedisRoomJoinerKey(roomId);

    return await this.redis.hdel(roomJoinerKey, socket.id);
  }

  private genRedisRoomJoinerKey(roomId: string) {
    return `${REDIS_KEY.ROOM_JOINERS}:${roomId}`;
  }

  private getCallRoomId(socket: SocketWithAuth) {
    return socket.data[CALL_ROOM_KEY];
  }

  private setCallRoomId(socket: SocketWithAuth, roomId: string) {
    socket.data[CALL_ROOM_KEY] = roomId;
  }
}
