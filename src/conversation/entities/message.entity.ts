import { BaseEntity } from 'common';
import { MessageType } from 'shared';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { File } from '../../file/entities/file.entity';
import { Conversation } from './conversation.entity';
import { MessageUserInfo } from './message-user-info.entity';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  content: string;

  @Column({ type: 'enum', enum: MessageType })
  type: MessageType;

  // join user
  @Column()
  userId: number;

  @ManyToOne(() => User, (u) => u.messages)
  @JoinColumn()
  user: User;
  // end join user

  // join conversation
  @Column()
  conversationId: number;

  @ManyToOne(() => Conversation, (c) => c.messages)
  @JoinColumn()
  conversation: Conversation;
  // end join conversation

  // join file
  @Column({ nullable: true })
  fileId: number;

  @ManyToOne(() => File, (f) => f.messages)
  @JoinColumn()
  file: File;
  // end join file

  @OneToMany(() => MessageUserInfo, (mri) => mri.message)
  messageUserInfos: MessageUserInfo[];
}
