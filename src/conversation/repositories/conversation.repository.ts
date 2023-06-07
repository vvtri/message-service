import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'common';
import { DataSource } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';

@Injectable()
export class ConversationRepository extends BaseRepository<Conversation> {
  constructor(dataSource: DataSource) {
    super(Conversation, dataSource);
  }
}
