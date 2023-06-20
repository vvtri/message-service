import { Module } from '@nestjs/common';
import { TypeOrmCustomModule } from 'common';
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
    ]),
  ],
  providers: [FriendListenerService],
})
export class FriendModule {}
