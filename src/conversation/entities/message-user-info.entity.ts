import { BaseEntity, PartialIndexWithSoftDelete } from 'common';
import { MessageReactionType, MessageReadInfoStatus } from 'shared';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Message } from './message.entity';

@Entity()
@PartialIndexWithSoftDelete(['messageId', 'userId'], { unique: true })
export class MessageUserInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MessageReadInfoStatus })
  status: MessageReadInfoStatus;

  @Column({ nullable: true, type: 'enum', enum: MessageReactionType })
  reaction: MessageReactionType;

  // join user
  @Column()
  userId: number;

  @ManyToOne(() => User, (u) => u.messageUserInfos)
  @JoinColumn()
  user: User;
  // end join user

  // join message
  @Column()
  messageId: number;

  @ManyToOne(() => Message, (c) => c.messageUserInfos)
  @JoinColumn()
  message: Message;
  // end join message
}
