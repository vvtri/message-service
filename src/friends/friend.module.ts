import { Module } from '@nestjs/common';
import { TypeOrmCustomModule } from 'common';
import { UserProfileRepository } from '../auth/repositories/user-profile.repository';
import { ConversationMemberRepository } from '../conversation/repositories/conversation-member.repository';
import { ConversationRepository } from '../conversation/repositories/conversation.repository';
import { MessageRepository } from '../conversation/repositories/message.repository';
import { FriendListenerService } from './services/friend-listener.service';

@Module({
  imports: [
    TypeOrmCustomModule.forFeature([
      ConversationRepository,
      ConversationMemberRepository,
      MessageRepository,
      UserProfileRepository,
    ]),
  ],
  providers: [FriendListenerService],
})
export class FriendModule {}
