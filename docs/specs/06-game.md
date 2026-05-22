# 06. 놀이 & 유틸리티 기능 명세서

> **변경 포인트**: 게임별 판돈, 인원 제한은 각 게임 상수로 분리  
> **연결 포인트**: 게임 결과 → `04-economy.md` 우마 트랜잭션으로 연결

---

## 1. 개요

| 기능 | MVP 포함 | 진입 방법 |
|------|----------|-----------|
| 투표 | ✅ | 게시판 내 또는 우물가 상호작용 |
| 점심 메뉴 추천 | ✅ | 우물가 근처 버튼 |
| 커피 내기 | Should | 게시판 내 투표와 연계 |
| 코드 퀴즈 | Could | 마을 내 미니게임 기물 |
| 타이핑 레이스 | Could | 마을 내 미니게임 기물 |
| 버그 잡기 | Could | 마을 내 미니게임 기물 |

---

## 2. 투표 기능

### 개요

마을(층) 단위 또는 전체 투표. 게시판 글 안에 삽입하거나 독립 투표로 생성.

### 투표 생성

| 필드 | 타입 | 제한 |
|------|------|------|
| `title` | string | 최대 50자 |
| `options` | string[] | 2~4개 |
| `villageId` | enum | 마을 또는 전체(`ALL`) |
| `expiresAt` | datetime | 최대 24시간 후 |

### API

```
POST /api/votes
Body: { title, options, villageId, expiresAt? }
Response 201: { voteId }

POST /api/votes/{voteId}/choices
Body: { optionIndex: number }  // 0-based
Response 200: { optionIndex; currentCounts: number[] }
  → 중복 투표: 409 { code: 'ALREADY_VOTED' }
  → 마감된 투표: 409 { code: 'VOTE_CLOSED' }

GET /api/votes/{voteId}
Response 200: {
  id, title, options, counts: number[],
  totalVoters: number, myChoice: number | null,
  expiresAt, isClosed
}
```

### WebSocket 이벤트

```
Server → Client(s in same village):
  VOTE_UPDATED  { voteId; counts: number[]; totalVoters: number }
  → 투표 발생 시 실시간으로 결과 그래프 갱신
```

### UI

```
┌─────────────────────────────────────────┐
│ 📊 오늘 점심 뭐 먹을까요?                │
│                                         │
│ ① 해장국     ████████░░  60% (6명)      │
│ ② 김치찌개   ████░░░░░░  30% (3명)      │
│ ③ 편의점     █░░░░░░░░░  10% (1명)      │
│                                         │
│ 총 10명 참여  · 종료: 13:00             │
└─────────────────────────────────────────┘
```

---

## 3. 점심 메뉴 추천

### 개요

오늘의 구내식당 메뉴를 입력하면 추천 또는 코멘트를 반환. 투표로 연계 가능.

### 플로우

```
1. 유저: 오늘 메뉴 입력 (최대 5개 메뉴, 각 30자)
2. 서버: 입력 메뉴 기반으로 추천 로직 실행
   → MVP: 랜덤 선택 + 재치 있는 코멘트 (하드코딩 문구 목록)
   → 추후: AI API 연동으로 실제 추천
3. 결과: "오늘의 추천 메뉴: 해장국 🍜 — 월요일 해장엔 이게 최고죠!"
4. [바로 투표 만들기] 버튼 → 추천 메뉴를 선택지로 투표 자동 생성
```

### API

```
POST /api/lunch/recommend
Body: { menus: string[] }  // 오늘 메뉴 목록
Response 200: {
  recommended: string;
  comment: string;
  allMenus: string[];
}
```

### 코멘트 템플릿 (하드코딩)

```typescript
// shared/constants/lunch-comments.ts (변경 용이)
export const LUNCH_COMMENTS = [
  '{menu} — 배고플 땐 역시 이게 최고죠 🔥',
  '{menu} — 오늘 하루도 화이팅! 든든하게 먹어요 💪',
  '{menu} — 우마 많이 버셨으니까 맛있는 거 드세요 🌿',
  '{menu} — 코치님도 드실 것 같은 메뉴네요 😎',
];
```

---

## 4. 커피 내기 (미니게임 1)

### 개요

우물가 근처에서 크루들끼리 판돈을 걸고 투표나 간단한 게임으로 승부. 패배자가 커피를 산다 (우마 이동).

### 게임 방식: 숫자 맞추기 (1~10)

```
1. 방장이 [커피 내기] 생성 → 판돈 설정 (예: 500 우마), 참여자 모집
2. 2~4명 참여 (참여 시 우마 차감 → 게임 잔액 보관)
3. 모두 1~10 숫자 선택
4. 랜덤 정답 숫자 공개
5. 정답에 가장 가까운 사람이 전체 판돈 획득
   (동점: 균등 분배)
```

### 상수

```typescript
export const COFFEE_BET_CONFIG = {
  MIN_BET: 100,
  MAX_BET: 5000,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,
  NUMBER_RANGE: [1, 10] as const,
  WAIT_TIMEOUT_SEC: 30, // 30초 내 모두 선택 안 하면 취소
};
```

### API

```
POST /api/games/coffee-bet
Body: { betAmount: number }
Response 201: { gameId; roomCode }

POST /api/games/coffee-bet/{gameId}/join
Response 200: { gameId; players: string[] }
  → 우마 부족: 402 { code: 'INSUFFICIENT_WOOMA' }

POST /api/games/coffee-bet/{gameId}/choose
Body: { number: number }
Response 200: { chosen: number }

WebSocket:
  GAME_STARTED   { gameId; players }
  GAME_RESULT    { gameId; answer; choices: Record<memberId, number>; winner: memberId; woomaDelta: number }
```

---

## 5. 코드 퀴즈 (미니게임 2, Could)

### 개요

CS / 알고리즘 OX 퀴즈 배틀. 가장 많이 맞춘 사람이 우마 획득.

### 퀴즈 데이터 구조

```typescript
interface Quiz {
  id: string;
  question: string;
  answer: 'O' | 'X';
  explanation: string;
  category: 'CS' | 'ALGORITHM' | 'NETWORK' | 'DB';
}
```

### 퀴즈 풀 (초기 세팅, 하드코딩)

```
// shared/constants/quiz-pool.ts
// 최초 20문제 하드코딩 → 추후 DB로 이관
```

---

## 6. 타입 정의

```typescript
// shared/types/05-game.ts

export type GameType = 'COFFEE_BET' | 'CODE_QUIZ' | 'TYPING_RACE' | 'BUG_HUNT';
export type GameStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';

export interface GameRoom {
  id: string;
  type: GameType;
  status: GameStatus;
  hostId: string;
  players: string[];
  betAmount: number;
  createdAt: string;
}

export interface Vote {
  id: string;
  title: string;
  options: string[];
  counts: number[];
  villageId: string;
  myChoice: number | null;
  totalVoters: number;
  isClosed: boolean;
  expiresAt: string | null;
}
```

---

## 7. 컴포넌트 구조

```
workspace/{닉네임}/
  game/
    VoteCard.tsx           # 투표 카드 (게시판/우물가 공용)
    VoteCreateForm.tsx     # 투표 생성 폼
    LunchRecommend.tsx     # 점심 메뉴 추천
    CoffeeBet.tsx          # 커피 내기 게임 룸
    CoffeeBetResult.tsx    # 게임 결과 화면
```

---

## 8. 연결 포인트

| 이벤트 | 출발 | 도착 |
|--------|------|------|
| 게임 결과 | `CoffeeBet.tsx` | `04-economy.md` 우마 트랜잭션 |
| 투표 생성 | `VoteCreateForm.tsx` | 게시판 게시글 또는 독립 표시 |
| 점심 추천 → 투표 | `LunchRecommend.tsx` | `VoteCreateForm.tsx` 자동 세팅 |
| WebSocket 실시간 | 게임 룸 | 같은 층 크루에게 브로드캐스트 |

---

## 9. 오픈 이슈

- [ ] 커피 내기: 우마 부족 시 참여 불가 정책 vs 외상(마이너스) 허용 여부
- [ ] 점심 메뉴 추천: 랜덤 코멘트 vs AI API 연동 (Claude API 등)
- [ ] 투표 종료 방식: 시간 만료 자동 종료 vs 방장 수동 종료
- [ ] 코드 퀴즈 퀴즈 풀: 하드코딩 20개 vs 크루들이 제출한 문제 사용
