import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'common';
import { DataSource } from 'typeorm';
import { Message } from '../entities/message.entity';

@Injectable()
export class MessageRepository extends BaseRepository<Message> {
  constructor(dataSource: DataSource) {
    super(Message, dataSource);
  }
}
