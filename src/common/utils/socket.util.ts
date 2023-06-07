import { CONVERSATION_ROOM_PREFIX } from '../constants/socket.constant';

export function genWsConversationRoomName(conversationId: number) {
  return `${CONVERSATION_ROOM_PREFIX}-${conversationId}`;
}
