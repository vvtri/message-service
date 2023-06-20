import { Injectable } from '@nestjs/common';
import {
  EachMessagePayload,
  KafkaListener,
  SubscribeTo,
} from '@vvtri/nestjs-kafka';
import { FriendRequestUpdatedKafkaPayload, KAFKA_TOPIC } from 'common';
import {
  ConversationMemberRole,
  FriendRequestStatus,
  MessageType,
} from 'shared';
import { Transactional } from 'typeorm-transactional';
import { ConversationMemberRepository } from '../../conversation/repositories/conversation-member.repository';
import { ConversationRepository } from '../../conversation/repositories/conversation.repository';
import { MessageRepository } from '../../conversation/repositories/message.repository';

@Injectable()
@KafkaListener()
export class FriendListenerService {
  constructor(
    private conversationRepo: ConversationRepository,
    private conversationMemberRepo: ConversationMemberRepository,
    private messageRepo: MessageRepository,
  ) {}

  @Transactional()
  @SubscribeTo(KAFKA_TOPIC.FRIEND_REQUEST_UPDATED)
  async onFriendRequestUpdated({
    message,
  }: EachMessagePayload<FriendRequestUpdatedKafkaPayload>) {
    const friendRequest = message.value;
    switch (friendRequest.status) {
      case FriendRequestStatus.ACCEPTED:
        await this.handleAddedFriend(friendRequest);
        break;
      case FriendRequestStatus.PENDING:
        break;

      default:
        throw new Error(
          `Friend request status unimplemented ${friendRequest.status}`,
        );
    }
  }

  private async handleAddedFriend(
    friendRequest: FriendRequestUpdatedKafkaPayload,
  ) {
    console.log(
      'query',
      this.conversationMemberRepo
        .createQueryBuilder('cm')
        .select('cm.conversationId')
        .groupBy('cm.conversationId')
        .having('count(*) = 2')
        .andHaving(':requesterId = any(array_arr(cm.user_id))', {
          requesterId: friendRequest.requesterId,
        })
        .andHaving(':beRequestedId = any(array_arr(cm.user_id))', {
          beRequestedId: friendRequest.beRequestedId,
        })
        .getQueryAndParameters(),
    );

    const existed = await this.conversationMemberRepo
      .createQueryBuilder('cm')
      .select('cm.conversationId')
      .groupBy('cm.conversationId')
      .having('count(*) = 2')
      .andHaving(':requesterId = any(array_agg(cm.user_id))', {
        requesterId: friendRequest.requesterId,
      })
      .andHaving(':beRequestedId = any(array_agg(cm.user_id))', {
        beRequestedId: friendRequest.beRequestedId,
      })
      .getExists();

    console.log('conversationId', existed);
    if (existed) return;

    const conversation = this.conversationRepo.create({
      isGroup: false,
    });
    await this.conversationRepo.save(conversation);
    const requesterMember = this.conversationMemberRepo.create({
      conversation,
      userId: friendRequest.requesterId,
      role: ConversationMemberRole.MEMBER,
    });
    const beRequestedMember = this.conversationMemberRepo.create({
      conversation,
      userId: friendRequest.beRequestedId,
      role: ConversationMemberRole.MEMBER,
    });

    const firstMessage = await this.messageRepo.create({
      content: `You are now connected on SimFri`,
      conversation,
      type: MessageType.SYSTEM,
    });

    await Promise.all([
      this.conversationMemberRepo.save(requesterMember),
      this.conversationMemberRepo.save(beRequestedMember),
      this.messageRepo.save(firstMessage),
    ]);
  }
}
