import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'common';
import { DataSource } from 'typeorm';
import { MessageUserInfo } from '../entities/message-user-info.entity';

@Injectable()
export class MessageUserInfoRepository extends BaseRepository<MessageUserInfo> {
  constructor(dataSource: DataSource) {
    super(MessageUserInfo, dataSource);
  }
}
