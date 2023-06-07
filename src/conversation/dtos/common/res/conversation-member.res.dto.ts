import { ConversationMemberRole } from 'shared';
import { UserResDto } from '../../../../auth/dtos/common/res/user.res.dto';
import { ConversationMember } from '../../../entities/conversation-member.entity';
import { ConversationResDto } from './conversation.res.dto';

export interface ConversationMemberResDtoParams {
  data?: ConversationMember;
}

export class ConversationMemberResDto {
  id: number;
  role: ConversationMemberRole;
  user: UserResDto;
  userId: number;
  added: UserResDto;
  addedId: number;
  conversation: ConversationResDto;

  static mapProperty(
    dto: ConversationMemberResDto,
    { data }: ConversationMemberResDtoParams,
  ) {
    dto.id = data.id;
    dto.role = data.role;
  }

  static forUser(params: ConversationMemberResDtoParams) {
    const { data } = params;

    if (!data) return null;
    const result = new ConversationMemberResDto();

    this.mapProperty(result, params);

    result.user = UserResDto.forUser({ data: data.user });
    result.added = UserResDto.forUser({ data: data.added });
    result.conversation = ConversationResDto.forUser({
      data: data.conversation,
    });

    return result;
  }
}
