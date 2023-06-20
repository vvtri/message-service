import { UserResDto } from '../../../auth/dtos/common/res/user.res.dto';

export class CallJoinerInfoIntDto {
  user: UserResDto;
  socketId: string;
  isMuteMic: boolean;
  isOffCamera: boolean;
}
