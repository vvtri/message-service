import { IsValidNumber, IsValidText } from 'common';
import { PaginationReqDto } from '../../../../common/dtos/pagination.dto';

export class GetListConversationUserReqDto extends PaginationReqDto {
  @IsValidText({ required: false, minLength: 0 })
  searchText?: string;
}

export class AddPeopleToConversationUserReqDto {
  @IsValidNumber({ min: 0 })
  userId: number;

  @IsValidNumber({ min: 0 })
  conversationId: number;
}
