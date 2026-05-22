export const WOOMA_REWARD = {
  COMMIT: 1000,           // 커밋 1회당
  CHECKIN_EARLY: 1000,    // 09:00 이전 출근
  CHECKIN_LATE: 500,      // 09:00 이후 출근
  CHECKOUT_NORMAL: 500,   // 18:00~19:00 퇴근
  CHECKOUT_LATE: 1000,    // 19:00 이후 퇴근
  ANSWER_ADOPTED: 2000,   // 답변 채택
} as const;

export const GITHUB_SYNC_COOLDOWN_MS = 60_000; // 1분
export const CHECKIN_EARLY_THRESHOLD = '09:00';
export const CHECKOUT_OPEN_TIME = '18:00';
export const CHECKOUT_LATE_THRESHOLD = '19:00';
