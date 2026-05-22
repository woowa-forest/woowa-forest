export const INTERACTION_CONFIG = {
  WELL_RADIUS_TILES: 5,          // 우물가 근접 반경
  CHAT_MAX_LENGTH: 200,          // 채팅 최대 글자 수
  CHAT_HISTORY_LIMIT: 50,        // 화면에 표시할 최근 메시지 수
  CHARACTER_INTERACT_RADIUS: 2,  // 캐릭터 프로필 열기 반경
  EMOJI_DURATION_MS: 2000,       // 이모지 표시 지속 시간
};

export const EMOJI_LIST = ['👋', '❓', '✅', '😂', '🔥'] as const;
export type EmojiType = (typeof EMOJI_LIST)[number];
