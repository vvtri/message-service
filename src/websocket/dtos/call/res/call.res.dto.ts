import { UserResDto } from '../../../../auth/dtos/common/res/user.res.dto';

export interface JoinerInfo {
  user: UserResDto;
  socketId: string;
}

export class JoinedRoomCallResDto implements JoinerInfo {
  user: UserResDto;
  socketId: string;
}

export class NewUserJoinedCallResDto {
  signal: any;
  newUserData: JoinerInfo;
}

export class ReceiveReturnSignalCallReqDto {
  signal: any;

  fromData: JoinerInfo;
}

export class UserLeftRoomCallReqDto {
  socketId: string;
}
