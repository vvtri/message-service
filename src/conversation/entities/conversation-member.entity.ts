import { BaseEntity } from 'common';
import { ConversationMemberRole } from 'shared';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Conversation } from './conversation.entity';

@Entity()
export class ConversationMember extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ConversationMemberRole,
    default: ConversationMemberRole.MEMBER,
  })
  role: ConversationMemberRole;

  // join user
  @Column()
  userId: number;

  @ManyToOne(() => User, (u) => u.conversationMemberUsers)
  @JoinColumn()
  user: User;
  // end join user

  // join user
  @Column({ nullable: true })
  addedId: number;

  @ManyToOne(() => User, (u) => u.conversationMemberUsers)
  @JoinColumn()
  added: User;
  // end join user

  // join conversation
  @Column()
  conversationId: number;

  @ManyToOne(() => Conversation, (c) => c.conversationMembers)
  @JoinColumn()
  conversation: Conversation;
  // end join conversation
}
