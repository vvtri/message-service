import { ConversationResDto } from '../../common/res/conversation.res.dto';

export class ICreateConversationSocketUserResDto {
  conversation: ConversationResDto;
  creatorId: number;
}
