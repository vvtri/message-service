export class JoinRoomCallReqDto {
  roomId: string;
}

export class SendSignalCallReqDto {
  signal: any;

  toSocket: string;
}

export class SendReturnSignalCallReqDto {
  signal: any;

  toSocket: string;
}

export class ToggleMicCallReqDto {
  isMuteMic: boolean;
}

export class ToggleCameraCallReqDto {
  isOffCamera: boolean;
}
