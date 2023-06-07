import { FileResDto } from '../../../../file/dtos/common/file.res.dto';
import { Conversation } from '../../../entities/conversation.entity';
import { Message } from '../../../entities/message.entity';
import { ConversationMemberResDto } from './conversation-member.res.dto';
import { MessageResDto } from './message.res.dto';

export interface ConversationResDtoParams {
  data?: Conversation;
  latestMessage?: Message;
}

export class ConversationResDto {
  id: number;
  name: string;
  isGroup: boolean;
  messages: MessageResDto[];
  avatar: FileResDto;
  conversationMembers: ConversationMemberResDto[];
  latestMessage: MessageResDto;

  static mapProperty(
    dto: ConversationResDto,
    { data }: ConversationResDtoParams,
  ) {
    dto.id = data.id;
    dto.name = data.name;
    dto.isGroup = data.isGroup;
  }

  static forUser(params: ConversationResDtoParams) {
    const { data, latestMessage } = params;

    if (!data) return null;
    const result = new ConversationResDto();

    this.mapProperty(result, params);

    result.messages = data.messages?.map((item) =>
      MessageResDto.forUser({ data: item }),
    );
    result.avatar = FileResDto.forUser({ data: data.avatar });
    result.conversationMembers = data.conversationMembers?.map((item) =>
      ConversationMemberResDto.forUser({ data: item }),
    );
    result.latestMessage = MessageResDto.forUser({ data: latestMessage });

    return result;
  }
}
