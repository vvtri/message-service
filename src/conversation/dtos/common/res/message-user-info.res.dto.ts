import { MessageReadInfoStatus } from 'shared';
import { UserResDto } from '../../../../auth/dtos/common/res/user.res.dto';
import { MessageUserInfo } from '../../../entities/message-user-info.entity';
import { MessageResDto } from './message.res.dto';

export interface MessageUserInfoResDtoParams {
  data?: MessageUserInfo;
}

export class MessageUserInfoResDto {
  id: number;
  status: MessageReadInfoStatus;
  user: UserResDto;
  message: MessageResDto;
  createdAt: Date;

  static mapProperty(
    dto: MessageUserInfoResDto,
    { data }: MessageUserInfoResDtoParams,
  ) {
    dto.id = data.id;
    dto.status = data.status;
    dto.createdAt = data.createdAt;
  }

  static forUser(params: MessageUserInfoResDtoParams) {
    const { data } = params;

    if (!data) return null;
    const result = new MessageUserInfoResDto();

    this.mapProperty(result, params);

    result.user = UserResDto.forUser({ data: data.user });
    result.message = MessageResDto.forUser({ data: data.message });

    return result;
  }
}
