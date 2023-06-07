import { Module } from '@nestjs/common';
import { TypeOrmCustomModule } from 'common';
import { UserProfileRepository } from '../auth/repositories/user-profile.repository';
import { UserRepository } from '../auth/repositories/user.repository';
import { FileRepository } from '../file/repositories/file.repository';
import { ConversationUserController } from './controllers/user/conversation.user.controller';
import { MessageUserController } from './controllers/user/message.user.controller';
import { ConversationMemberRepository } from './repositories/conversation-member.repository';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageUserInfoRepository } from './repositories/message-user-info.repository';
import { MessageRepository } from './repositories/message.repository';
import { ConversationUserService } from './services/user/conversation.user.service';
import { MessageUserService } from './services/user/message.user.service';

@Module({
  imports: [
    TypeOrmCustomModule.forFeature([
      MessageRepository,
      ConversationRepository,
      MessageUserInfoRepository,
      ConversationMemberRepository,
      FileRepository,
      UserProfileRepository,
      UserRepository,
    ]),
  ],
  controllers: [ConversationUserController, MessageUserController],
  providers: [ConversationUserService, MessageUserService],
})
export class ConversationModule {}
