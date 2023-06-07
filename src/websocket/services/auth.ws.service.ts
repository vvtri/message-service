import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';
import { UserRepository } from '../../auth/repositories/user.repository';
import { JwtAuthPayload } from '../../auth/types/jwt-payload.type';
import { GlobalConfig } from '../../common/configs/global.config';
import {
  SocketNextFunc,
  SocketWithAuth,
} from '../interfaces/websocket.interface';

@Injectable()
export class AuthWsService {
  constructor(
    private configService: ConfigService<GlobalConfig>,
    private userRepo: UserRepository,
  ) {}

  static authMiddlewareFactory(authWsService: AuthWsService) {
    return async (socket: SocketWithAuth, next: SocketNextFunc) => {
      try {
        const token = socket.handshake.headers.authorization;
        const user = await authWsService.verifyToken(token);

        if (!user) throw new Error('User not found');

        socket.user = user;
        next();
      } catch (error) {
        console.log('error', error);
        next(error);
      }
    };
  }

  async verifyToken(token: string) {
    const { userId } = verify(
      token,
      this.configService.get('auth.accessToken.secret'),
    ) as JwtAuthPayload;

    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new WsException('User not found');
    }

    return user;
  }
}
