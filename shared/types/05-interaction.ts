import { EmojiType } from '../constants/03-interaction';

export interface ChatMessage {
  id: string;
  roomId: string;        // 'floor-{floorId}-well' 형태
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface DmMessage {
  id: string;
  roomId: string;        // 'dm-{sortedMemberId1}-{sortedMemberId2}'
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface FloatingEmoji {
  id: string;
  memberId: string;
  emoji: EmojiType;
  createdAt: number;
}
