import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'common';
import { DataSource } from 'typeorm';
import { ConversationMember } from '../entities/conversation-member.entity';

@Injectable()
export class ConversationMemberRepository extends BaseRepository<ConversationMember> {
  constructor(dataSource: DataSource) {
    super(ConversationMember, dataSource);
  }
}
