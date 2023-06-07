import { BaseEntity } from 'common';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { File } from '../../file/entities/file.entity';
import { ConversationMember } from './conversation-member.entity';
import { Message } from './message.entity';

@Entity()
export class Conversation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'bool' })
  isGroup: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastActivityTime: Date;

  @OneToMany(() => Message, (m) => m.conversation)
  messages: Message[];

  // join file
  @Column({ nullable: true })
  avatarId: number;

  @ManyToOne(() => File, (f) => f.conversations)
  @JoinColumn()
  avatar: File;
  // end join file

  @OneToMany(() => ConversationMember, (cm) => cm.conversation)
  conversationMembers: ConversationMember[];
}
