import { Global, Module } from '@nestjs/common';
import { TypeOrmCustomModule } from 'common';
import { UserRepository } from '../auth/repositories/user.repository';
import { ConversationMemberRepository } from '../conversation/repositories/conversation-member.repository';
import { ConversationRepository } from '../conversation/repositories/conversation.repository';
import { CallGateway } from './gateways/call.gateway';
import { ChatGateway } from './gateways/chat.gateway';
import { AuthWsService } from './services/auth.ws.service';
import { CallWsService } from './services/call.ws.service';
import { ChatWsService } from './services/chat.ws.service';

@Global()
@Module({
  imports: [
    TypeOrmCustomModule.forFeature([
      UserRepository,
      ConversationMemberRepository,
      ConversationRepository,
    ]),
  ],
  providers: [
    CallGateway,
    ChatGateway,
    AuthWsService,
    ChatWsService,
    CallWsService,
  ],
  exports: [ChatGateway],
})
export class WebsocketModule {}
