import { MessageType } from 'shared';
import { UserResDto } from '../../../../auth/dtos/common/res/user.res.dto';
import { FileResDto } from '../../../../file/dtos/common/file.res.dto';
import { Message } from '../../../entities/message.entity';
import { ConversationResDto } from './conversation.res.dto';
import { MessageUserInfoResDto } from './message-user-info.res.dto';

export interface MessageResDtoParams {
  data?: Message;
}

export class MessageResDto {
  id: number;
  content: string;
  type: MessageType;
  user: UserResDto;
  conversation: ConversationResDto;
  conversationId: number;
  file: FileResDto;
  messageUserInfos: MessageUserInfoResDto[];
  createdAt: Date;

  static mapProperty(dto: MessageResDto, { data }: MessageResDtoParams) {
    dto.id = data.id;
    dto.content = data.content;
    dto.type = data.type;
    dto.content = data.content;
    dto.createdAt = data.createdAt;
    dto.conversationId = data.conversationId;
  }

  static forUser(params: MessageResDtoParams) {
    const { data } = params;

    if (!data) return null;
    const result = new MessageResDto();

    this.mapProperty(result, params);

    result.user = UserResDto.forUser({ data: data.user });
    result.conversation = ConversationResDto.forUser({
      data: data.conversation,
    });
    result.file = FileResDto.forUser({ data: data.file });
    result.messageUserInfos = data.messageUserInfos?.map((item) =>
      MessageUserInfoResDto.forUser({ data: item }),
    );

    return result;
  }
}
