export type WoomaReason =
  | 'GITHUB_COMMIT'
  | 'CHECKIN'
  | 'CHECKOUT'
  | 'ANSWER_ADOPTED'
  | 'SHOP_PURCHASE'
  | 'GAME_WIN'
  | 'GAME_LOSE';

export interface WoomaTransaction {
  id: string;
  memberId: string;
  amount: number;        // 양수: 획득, 음수: 사용
  reason: WoomaReason;
  refId: string | null;  // 관련 엔티티 ID
  createdAt: string;
}

export interface Attendance {
  memberId: string;
  date: string;          // yyyy-MM-dd
  checkInAt: string | null;
  checkOutAt: string | null;
}
