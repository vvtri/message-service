import { Injectable } from '@nestjs/common';
import { ExpectationFailedExc } from 'common';
import { paginate } from 'nestjs-typeorm-paginate';
import { Pagination } from 'nestjs-typeorm-paginate/dist/pagination';
import { Transactional } from 'typeorm-transactional';
import { User } from '../../../auth/entities/user.entity';
import { FileRepository } from '../../../file/repositories/file.repository';
import { ConversationResDto } from '../../dtos/common/res/conversation.res.dto';
import { GetListConversationUserReqDto } from '../../dtos/user/req/conversation.user.req.dto';
import { ConversationMemberRepository } from '../../repositories/conversation-member.repository';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { MessageRepository } from '../../repositories/message.repository';

@Injectable()
export class ConversationUserService {
  constructor(
    private conversationRepo: ConversationRepository,
    private fileRepo: FileRepository,
    private messageRepo: MessageRepository,
    private conversationMemberRepo: ConversationMemberRepository,
  ) {}

  @Transactional()
  async getList(dto: GetListConversationUserReqDto, user: User) {
    const { limit, page, isGroup } = dto;
    let { searchText } = dto;

    const qbCheckIsConversationMember = this.conversationMemberRepo
      .createQueryBuilder('cm')
      .where('cm.userId = :userId')
      .andWhere('cm.conversationId = c.id');

    const qb = this.conversationRepo
      .createQueryBuilder('c')
      .orderBy('c.lastActivityTime', 'DESC')
      .groupBy('c.id')
      .select('c')
      .whereExists(qbCheckIsConversationMember)
      .setParameter('userId', user.id);

    if (searchText) {
      searchText = `%${searchText}%`;

      const qbSearchText = this.conversationMemberRepo
        .createQueryBuilder('cm')
        .innerJoin('cm.user', 'u')
        .innerJoin('u.userProfile', 'up')
        .where('cm.conversationId = c.id')
        .andWhere('cm.userId != :userId')
        .andWhere(
          'case c.isGroup when true then c.name ilike :searchText else up.name ilike :searchText end',
        );

      qb.andWhereExists(qbSearchText).setParameter('searchText', searchText);
    }

    if (typeof isGroup === 'boolean') {
      qb.andWhere('c.isGroup = :isGroup', { isGroup });
    }

    const { items, meta } = await paginate(qb, { page, limit });

    const result = await Promise.all(
      items.map(async (item) => {
        const [conversation, latestMessage] = await Promise.all([
          this.conversationRepo.findOne({
            where: { id: item.id },
            relations: {
              avatar: true,
              conversationMembers: item.isGroup
                ? true
                : { user: { userProfile: { avatar: true } } },
            },
          }),
          this.messageRepo.findFirst({
            where: { conversationId: item.id },
            relations: {
              user: { userProfile: true },
              messageUserInfos: { user: true },
            },
            order: { createdAt: 'DESC' },
          }),
        ]);

        return ConversationResDto.forUser({
          data: conversation,
          latestMessage,
        });
      }),
    );

    return new Pagination(result, meta);
  }

  @Transactional()
  async getDetail(id: number, user: User) {
    await this.conversationMemberRepo.findOneByOrThrowNotFoundExc({
      conversationId: id,
      userId: user.id,
    });

    const conversation = await this.conversationRepo.findOneOrThrowNotFoundExc({
      where: { id },
      relations: {
        avatar: true,
        conversationMembers: { user: { userProfile: { avatar: true } } },
      },
    });

    return ConversationResDto.forUser({ data: conversation });
  }

  @Transactional()
  async countUnreadConversation(user: User) {
    const qbCheckIsConversationMember = this.conversationMemberRepo
      .createQueryBuilder('cm')
      .where('cm.userId = :userId')
      .andWhere('cm.conversationId = c.id');
  }

  @Transactional()
  async getByUser(userId: number, user: User) {
    if (userId === user.id)
      throw new ExpectationFailedExc({ statusCode: 1000 });

    let conversation = await this.conversationRepo
      .createQueryBuilder('c')
      .innerJoin('c.conversationMembers', 'cm')
      .groupBy('c.id')
      .having(':userId = any(array_agg(cm.userId))', { userId })
      .andHaving(':myUserId = any(array_agg(cm.userId))', {
        myUserId: user.id,
      })
      .where('c.isGroup = false')
      .select('c.id')
      .getOne();

    if (!conversation) return null;

    conversation = await this.conversationRepo.findOneOrThrowNotFoundExc({
      where: { id: conversation.id },
      relations: {
        avatar: true,
        conversationMembers: { user: { userProfile: { avatar: true } } },
      },
    });

    return ConversationResDto.forUser({ data: conversation });
  }
}
