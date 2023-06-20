import { CallJoinerInfoIntDto } from '../../int/joiner-info.int.dto';

export class JoinedRoomCallResDto extends Array<CallJoinerInfoIntDto> {}

export class NewUserJoinedCallResDto {
  signal: any;
  newUserData: CallJoinerInfoIntDto;
}

export class ReceiveReturnSignalCallReqDto {
  signal: any;

  fromData: CallJoinerInfoIntDto;
}

export class UserLeftRoomCallReqDto {
  socketId: string;
}

export class ToggleMicCallResDto {
  joinerInfo: CallJoinerInfoIntDto;
}

export class ToggleCameraCallResDto {
  joinerInfo: CallJoinerInfoIntDto;
}
