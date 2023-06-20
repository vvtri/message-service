import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { User } from '../../auth/entities/user.entity';

export interface SocketWithAuth extends Socket {
  data: {
    user: User;
    [key: string]: any;
  };
}

export type SocketNextFunc = (err?: ExtendedError) => void;
