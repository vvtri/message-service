import { Injectable } from '@nestjs/common';
import {
  EachMessagePayload,
  KafkaListener,
  SubscribeTo,
} from '@vvtri/nestjs-kafka';
import { FriendRequestUpdatedKafkaPayload, KAFKA_TOPIC } from 'common';
import { ConversationMemberRole, FriendRequestStatus } from 'shared';
import { Transactional } from 'typeorm-transactional';
import { ConversationMemberRepository } from '../../conversation/repositories/conversation-member.repository';
import { ConversationRepository } from '../../conversation/repositories/conversation.repository';

@Injectable()
@KafkaListener()
export class FriendListenerService {
  constructor(
    private conversationRepo: ConversationRepository,
    private conversationMemberRepo: ConversationMemberRepository,
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
    const conversationId = this.conversationMemberRepo
      .createQueryBuilder('cm')
      .select('cm.conversationId')
      .groupBy('cm.conversationId')
      .having('count(*) = 2')
      .andHaving(':requesterId = any(array_arr(cm.user_id))', {
        requesterId: friendRequest.requesterId,
      })
      .andHaving(':beRequestedId = any(array_arr(cm.user_id))', {
        beRequestedId: friendRequest.beRequestedId,
      });

    if (conversationId) return;

    const conversation = this.conversationRepo.create({
      isGroup: false,
    });
    const requesterMember = this.conversationMemberRepo.create({
      conversation,
      userId: friendRequest.requesterId,
      role: ConversationMemberRole.MEMBER,
    });
    const beRequestedMember = this.conversationMemberRepo.create({
      conversation,
      userId: friendRequest.requesterId,
      role: ConversationMemberRole.MEMBER,
    });

    await Promise.all([
      this.conversationMemberRepo.save(requesterMember),
      this.conversationMemberRepo.save(beRequestedMember),
    ]);
  }
}
