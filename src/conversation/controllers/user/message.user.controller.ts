import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { ApiTags } from '@nestjs/swagger';
import { PrefixType } from 'common';
import { User } from '../../../auth/entities/user.entity';
import {
  AuthenticateUser,
  CurrentUser,
} from '../../../common/decorators/auth.decorator';
import {
  GetListMessageUserReqDto,
  ReactToMessageUserReqDto,
  SendMessageUserReqDto,
} from '../../dtos/user/req/message.user.req.dto';
import { MessageUserService } from '../../services/user/message.user.service';

@Controller(`${PrefixType.USER}/message`)
@AuthenticateUser()
@ApiTags('Message User')
export class MessageUserController {
  constructor(private messageUserService: MessageUserService) {}

  @Get()
  getList(@Query() query: GetListMessageUserReqDto, @CurrentUser() user: User) {
    return this.messageUserService.getMessages(query, user);
  }

  @Post('react')
  reactToMessage(
    @Body() body: ReactToMessageUserReqDto,
    @CurrentUser() user: User,
  ) {
    return this.messageUserService.reactToMessage(body, user);
  }

  @Post()
  sendMessage(@Body() query: SendMessageUserReqDto, @CurrentUser() user: User) {
    return this.messageUserService.sendMessage(query, user);
  }

  @Patch(':id/read')
  readMessage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.messageUserService.readMessage(id, user);
  }
}
