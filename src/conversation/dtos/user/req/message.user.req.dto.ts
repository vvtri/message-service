import { ValidateIf } from 'class-validator';
import {
  IsValidArrayNumber,
  IsValidEnum,
  IsValidNumber,
  IsValidText,
} from 'common';
import { MessageReactionType, MessageType } from 'shared';
import { PaginationReqDto } from '../../../../common/dtos/pagination.dto';

export class GetListMessageUserReqDto extends PaginationReqDto {
  @IsValidNumber({ min: 1 })
  conversationId: number;
}

export class SendMessageUserReqDto {
  @IsValidNumber({ required: true })
  @ValidateIf(({ userIds }) => !userIds?.length)
  conversationId?: number;

  @IsValidArrayNumber({ minSize: 1 })
  @ValidateIf(({ conversationId }) => !conversationId)
  userIds: number[];

  @IsValidEnum({ enum: MessageType })
  type: MessageType;

  @IsValidText({ maxLength: 100000 })
  @ValidateIf(({ type }) => type === MessageType.TEXT)
  content?: string;

  @IsValidNumber({ min: 0 })
  @ValidateIf(({ type }) =>
    [MessageType.FILE, MessageType.IMAGE].includes(type),
  )
  fileId: number;
}

export class ReactToMessageUserReqDto {
  @IsValidNumber({ min: 1 })
  messageId: number;

  @IsValidEnum({ enum: MessageReactionType })
  reaction: MessageReactionType;
}
