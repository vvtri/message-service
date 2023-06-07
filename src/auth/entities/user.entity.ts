import { BaseEntity } from 'common';
import { UserStatus } from 'shared';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { ConversationMember } from '../../conversation/entities/conversation-member.entity';
import { MessageUserInfo } from '../../conversation/entities/message-user-info.entity';
import { Message } from '../../conversation/entities/message.entity';
import { File } from '../../file/entities/file.entity';
import { UserProfile } from './user-profile.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'enum', enum: UserStatus })
  status: UserStatus;

  @Column({ name: 'phone_number', length: 50, nullable: true })
  phoneNumber: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @OneToMany(() => File, (f) => f.user)
  files: File[];

  @OneToOne(() => UserProfile, (up) => up.user)
  userProfile: UserProfile;

  @OneToMany(() => Message, (m) => m.user)
  messages: Message[];

  @OneToMany(() => ConversationMember, (cm) => cm.user)
  conversationMemberUsers: ConversationMember[];

  @OneToMany(() => ConversationMember, (cm) => cm.added)
  conversationMemberAdders: ConversationMember[];

  @OneToMany(() => MessageUserInfo, (mr) => mr.user)
  messageUserInfos: MessageUserInfo[];
}
