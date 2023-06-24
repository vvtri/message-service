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
import { In } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { UserProfileRepository } from '../../auth/repositories/user-profile.repository';
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
    private userProfileRepo: UserProfileRepository,
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
    const userIds = [friendRequest.beRequestedId, friendRequest.requesterId];

    const qb = this.conversationRepo
      .createQueryBuilder('c')
      .innerJoin('c.conversationMembers', 'cm')
      .groupBy('c.id')
      .having('count(*) = 2')
      .andHaving('array_agg(cm.userId) @> array[:...userIds]::int[]', {
        userIds,
      })
      .andWhere('c.isGroup = :false');

    let conversation = await qb.getOne();

    if (conversation) return;

    const users = await this.userProfileRepo.findBy({ userId: In(userIds) });

    conversation = this.conversationRepo.create({
      isGroup: false,
      name: users
        .map((item) => item.name)
        .filter(Boolean)
        .join(', '),
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

    const firstMessage = this.messageRepo.create({
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
