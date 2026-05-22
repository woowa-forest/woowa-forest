# 04. 경제 시스템 (우마) 명세서

> **변경 포인트**: 지급량은 `WOOMA_REWARD` 상수 하나만 수정  
> **변경 포인트**: 쿨타임·제한 정책은 각 방어 로직 상수로 분리

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 화폐명 | 우마 (Woo-Ma, 🌿) |
| 획득 수단 | GitHub 커밋 수확, 출퇴근, Q&A 채택 |
| 사용처 | 아바타 코스튬, 마을 소품, 미니게임 판돈 |
| 잔액 저장 | `Member.wooMaBalance` (DB 원장) |
| 내역 저장 | `WoomaMaTransaction` 테이블 (reason 포함) |

---

## 2. 우마 지급 상수

```typescript
// shared/constants/03-economy.ts
export const WOOMA_REWARD = {
  COMMIT: 1000,           // 커밋 1회당
  CHECKIN_EARLY: 1000,    // 09:00 이전 출근
  CHECKIN_LATE: 500,      // 09:00 이후 출근
  CHECKOUT_NORMAL: 500,   // 18:00~19:00 퇴근
  CHECKOUT_LATE: 1000,    // 19:00 이후 퇴근
  ANSWER_ADOPTED: 2000,   // 답변 채택
} as const;

export const GITHUB_SYNC_COOLDOWN_MS = 60_000; // 1분 (변경 시 여기만)
export const CHECKIN_EARLY_THRESHOLD = '09:00';
export const CHECKOUT_OPEN_TIME = '18:00';
export const CHECKOUT_LATE_THRESHOLD = '19:00';
```

---

## 3. GitHub 커밋 수확

### 플로우

```
1. 유저: [우마 수확] 버튼 클릭
2. 프론트: POST /api/economy/github-sync 요청
3. 백엔드:
   a. last_github_sync_time 조회
   b. 1분 이내 재요청이면 → 429 반환
   c. GitHub API: GET /users/{githubId}/events/public
   d. PushEvent 중 last_github_sync_time 이후 커밋만 카운트
   e. 커밋 수 × 1,000 우마 지급
   f. last_github_sync_time = NOW() 업데이트
   g. WoomaMaTransaction 기록
4. 프론트: 지급된 우마 양 토스트 메시지 표시
```

### API

```
POST /api/economy/github-sync
Response 200: { commitCount: number; woomaEarned: number; newBalance: number }
Response 429: { code: 'SYNC_TOO_FREQUENT'; retryAfterMs: number }
Response 503: { code: 'GITHUB_API_ERROR'; message: string }
```

### 방어 로직

| 케이스 | 처리 |
|--------|------|
| 1분 이내 재요청 | 429 반환, 재시도 버튼 비활성화 |
| GitHub API Rate Limit | 503 + "잠시 후 다시 수확해주세요" 메시지 |
| GitHub API 타임아웃 | 503 + 동일 메시지, DB 변경 없음 |
| 커밋 0개 | 200 반환, woomaEarned: 0 (지급 없음) |

---

## 4. 출퇴근 시스템

### 플로우

```
1. 유저: [출근] 또는 [퇴근] 버튼 클릭
2. 프론트: POST /api/economy/attendance { type: 'CHECKIN' | 'CHECKOUT' }
3. 백엔드:
   a. 서버 현재 시간(UTC→KST) 기준으로 보상 계산 (클라이언트 시간 무시)
   b. Attendance 테이블에서 오늘 날짜(yyyy-MM-dd) + member_id 조회
   c. 중복/비순서 요청이면 → 409 반환
   d. 통과 시: Attendance 기록 + 우마 지급 + 트랜잭션 기록
4. 프론트: 버튼 상태 업데이트 (출근 후 비활성화)
```

### 시간 기준 지급표

| 버튼 | 서버 시간 조건 | 지급 | 클릭 가능 여부 |
|------|--------------|------|----------------|
| 출근 | 09:00 이전 | 1,000 우마 | 오늘 출근 전까지 |
| 출근 | 09:00 이후 | 500 우마 | 오늘 출근 전까지 |
| 퇴근 | 18:00 이전 | — | ❌ 비활성화 |
| 퇴근 | 18:00 ~ 19:00 | 500 우마 | 오늘 퇴근 전까지 |
| 퇴근 | 19:00 이후 | 1,000 우마 | 오늘 퇴근 전까지 |

### API

```
POST /api/economy/attendance
Body: { type: 'CHECKIN' | 'CHECKOUT' }
Response 200: { type; woomaEarned; newBalance; checkedAt }
Response 409: {
  code:
    | 'ALREADY_CHECKED_IN'
    | 'ALREADY_CHECKED_OUT'
    | 'CHECKOUT_NOT_AVAILABLE_YET'   // 18:00 이전 퇴근 시도
    | 'CHECKIN_REQUIRED'             // 출근 없이 퇴근 시도
}
```

### 방어 로직

| 케이스 | 처리 |
|--------|------|
| 클라이언트 시간 조작 | 서버 시간만 사용, 클라이언트 값 완전 무시 |
| 하루 2회 이상 출근 | DB UNIQUE(member_id, date) 제약으로 차단 |
| 출근 없이 퇴근 | 백엔드 검증 후 409 반환 |

---

## 5. Q&A 채택 보상

> 상세 플로우는 `03-village.md` 6절 참고. 여기서는 경제 처리만 기술.

### 우마 지급 트리거

```
POST /api/posts/{postId}/answers/{answerId}/adopt 성공 시
  → 백엔드: Member.wooMaBalance += 2,000 (답변자)
            WoomaMaTransaction 기록 (reason: 'ANSWER_ADOPTED', refId: answerId)
```

---

## 6. 우마 트랜잭션 내역

### API

```
GET /api/economy/transactions?page={page}&size=20
Response 200: {
  transactions: WoomaTransaction[];
  totalCount: number;
  hasNext: boolean;
}
```

### 타입

```typescript
// shared/types/04-economy.ts

export type WoomaReason =
  | 'GITHUB_COMMIT'
  | 'CHECKIN'
  | 'CHECKOUT'
  | 'ANSWER_ADOPTED'
  | 'SHOP_PURCHASE'   // 코스튬 구매 시 차감
  | 'GAME_WIN'
  | 'GAME_LOSE';      // 미니게임 판돈

export interface WoomaTransaction {
  id: string;
  memberId: string;
  amount: number;        // 양수: 획득, 음수: 사용
  reason: WoomaReason;
  refId: string | null;  // 관련 엔티티 ID (answerId, gameId 등)
  createdAt: string;
}
```

---

## 7. 컴포넌트 구조

```
workspace/{닉네임}/
  economy/
    06-EconomyPanel.tsx      # 우마 잔액 HUD + 출퇴근 버튼
    06-GithubHarvest.tsx     # 수동 수확 버튼 + 쿨타임 카운트다운
    06-TransactionHistory.tsx # 내역 목록 (마이페이지 내)
```

---

## 8. 연결 포인트

| 이벤트 | 출발 | 도착 |
|--------|------|------|
| 우마 지급/차감 | 모든 수단 | `useAuthStore.updateWooma()` → HUD 즉시 반영 |
| 답변 채택 | `03-village.md` | 우마 트랜잭션 생성 |
| 코스튬 구매 | `07-아바타 상점` | 우마 차감 트랜잭션 |
| 미니게임 결과 | `06-game.md` | 우마 증감 트랜잭션 |

---

## 9. 오픈 이슈

- [ ] GitHub API 토큰: 유저별 OAuth 토큰 저장 vs 서버 공용 토큰 (Rate Limit 차이)
- [ ] 우마 상한선: 무제한 vs 일일 최대 획득 한도 설정
- [ ] 트랜잭션 내역 노출 범위: 본인만 vs 마을 내 리더보드 공개
- [ ] 출근 기능: 해커톤 당일 시간상 제외 여부 검토
