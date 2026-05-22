import { create } from 'zustand';
import type { ChatMessage, DmMessage, FloatingEmoji } from '@shared/types/05-interaction';
import type { EmojiType } from '@shared/constants/03-interaction';
import { INTERACTION_CONFIG } from '@shared/constants/03-interaction';

interface InteractionStore {
  nearbyMessages: ChatMessage[];
  dmMessages: Record<string, DmMessage[]>; // roomId -> messages
  activeEmojis: FloatingEmoji[];
  unreadDmCounts: Record<string, number>; // roomId -> count

  sendNearbyChat: (roomId: string, senderId: string, senderName: string, content: string) => void;
  sendDm: (roomId: string, senderId: string, senderName: string, content: string) => void;
  emitEmoji: (memberId: string, emoji: EmojiType) => void;
  clearUnread: (roomId: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export const useInteractionStore = create<InteractionStore>((set, get) => ({
  nearbyMessages: [
    { id: '1', roomId: 'floor-12-well', senderId: 'user1', senderName: 'snowshower', content: '점심 뭐 먹지... 🍜', createdAt: new Date().toISOString() },
    { id: '2', roomId: 'floor-12-well', senderId: 'user2', senderName: 'soojin', content: '해장국이요!', createdAt: new Date().toISOString() },
  ],
  dmMessages: {},
  activeEmojis: [],
  unreadDmCounts: {},

  sendNearbyChat: (roomId, senderId, senderName, content) => {
    const msg: ChatMessage = {
      id: uid(),
      roomId,
      senderId,
      senderName,
      content,
      createdAt: new Date().toISOString(),
    };
    set(s => ({
      nearbyMessages: [...s.nearbyMessages, msg].slice(-INTERACTION_CONFIG.CHAT_HISTORY_LIMIT)
    }));
  },

  sendDm: (roomId, senderId, senderName, content) => {
    const msg: DmMessage = {
      id: uid(),
      roomId,
      senderId,
      senderName,
      content,
      createdAt: new Date().toISOString(),
    };
    set(s => ({
      dmMessages: {
        ...s.dmMessages,
        [roomId]: [...(s.dmMessages[roomId] || []), msg]
      }
    }));
  },

  emitEmoji: (memberId, emoji) => {
    const newEmoji: FloatingEmoji = {
      id: uid(),
      memberId,
      emoji,
      createdAt: Date.now(),
    };
    set(s => ({ activeEmojis: [...s.activeEmojis, newEmoji] }));
    
    // Auto remove after duration
    setTimeout(() => {
      set(s => ({ activeEmojis: s.activeEmojis.filter(e => e.id !== newEmoji.id) }));
    }, INTERACTION_CONFIG.EMOJI_DURATION_MS);
  },

  clearUnread: (roomId) => {
    set(s => ({
      unreadDmCounts: { ...s.unreadDmCounts, [roomId]: 0 }
    }));
  },
}));
