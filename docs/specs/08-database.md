# 08. 데이터베이스 명세서

> **변경 포인트**: 필드 추가/변경은 `schema.prisma` 수정 후 `prisma migrate dev` 한 번  
> **호스팅**: Supabase (PostgreSQL 15, 무료 500MB)

---

## 1. Prisma 스키마 전체

```prisma
// server/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ──────────────────────────────────────────
// 회원
// ──────────────────────────────────────────
model Member {
  id                  String    @id @default(cuid())
  crewName            String    @unique
  field               Field
  githubId            String    @unique
  village             Village
  bio                 String    @default("") @db.VarChar(100)
  wooMaBalance        Int       @default(0)
  avatarCostumeId     String?
  lastGithubSyncTime  DateTime?
  createdAt           DateTime  @default(now())

  attendances         Attendance[]
  posts               Post[]
  answers             Answer[]
  transactions        WoomaMaTransaction[]
  sentMessages        ChatMessage[]         @relation("SentMessages")
  voteChoices         VoteChoice[]
  gameParticipants    GameParticipant[]
}

enum Field {
  AN
  FE
  BE
}

enum Village {
  GURI
  TAECHO
  PPOLONG
  COACH
}

// ──────────────────────────────────────────
// 출퇴근
// ──────────────────────────────────────────
model Attendance {
  id            String    @id @default(cuid())
  memberId      String
  date          String    // yyyy-MM-dd (KST 기준)
  checkedInAt   DateTime?
  checkInReward Int?
  checkedOutAt  DateTime?
  checkOutReward Int?

  member        Member    @relation(fields: [memberId], references: [id])

  @@unique([memberId, date])
}

// ──────────────────────────────────────────
// 게시판
// ──────────────────────────────────────────
model Post {
  id        String     @id @default(cuid())
  authorId  String
  villageId Village
  title     String     @db.VarChar(100)
  body      String     @db.Text
  tag       PostTag
  status    PostStatus @default(OPEN)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  author    Member   @relation(fields: [authorId], references: [id])
  answers   Answer[]
}

enum PostTag {
  QUESTION
  SHARE
  CHAT
}

enum PostStatus {
  OPEN
  RESOLVED
}

model Answer {
  id        String   @id @default(cuid())
  postId    String
  authorId  String
  body      String   @db.Text
  isAdopted Boolean  @default(false)
  createdAt DateTime @default(now())

  post      Post     @relation(fields: [postId], references: [id])
  author    Member   @relation(fields: [authorId], references: [id])
}

// ──────────────────────────────────────────
// 우마 트랜잭션
// ──────────────────────────────────────────
model WoomaMaTransaction {
  id        String      @id @default(cuid())
  memberId  String
  amount    Int         // 양수: 획득, 음수: 사용
  reason    WoomaReason
  refId     String?     // 연관 엔티티 ID
  createdAt DateTime    @default(now())

  member    Member      @relation(fields: [memberId], references: [id])
}

enum WoomaReason {
  GITHUB_COMMIT
  CHECKIN
  CHECKOUT
  ANSWER_ADOPTED
  SHOP_PURCHASE
  GAME_WIN
  GAME_LOSE
}

// ──────────────────────────────────────────
// 채팅 메시지 (선택적 DB 저장)
// ──────────────────────────────────────────
model ChatMessage {
  id        String   @id @default(cuid())
  roomId    String
  senderId  String
  content   String   @db.VarChar(200)
  createdAt DateTime @default(now())

  sender    Member   @relation("SentMessages", fields: [senderId], references: [id])

  @@index([roomId, createdAt])
}

// ──────────────────────────────────────────
// 투표
// ──────────────────────────────────────────
model Vote {
  id        String    @id @default(cuid())
  creatorId String
  villageId String    // Village enum 또는 'ALL'
  title     String    @db.VarChar(50)
  options   String[]  // PostgreSQL 배열
  isClosed  Boolean   @default(false)
  expiresAt DateTime?
  createdAt DateTime  @default(now())

  choices   VoteChoice[]
}

model VoteChoice {
  id          String   @id @default(cuid())
  voteId      String
  memberId    String
  optionIndex Int
  createdAt   DateTime @default(now())

  vote        Vote     @relation(fields: [voteId], references: [id])
  member      Member   @relation(fields: [memberId], references: [id])

  @@unique([voteId, memberId])  // 1인 1투표
}

// ──────────────────────────────────────────
// 미니게임
// ──────────────────────────────────────────
model Game {
  id        String      @id @default(cuid())
  type      GameType
  status    GameStatus  @default(WAITING)
  hostId    String
  betAmount Int         @default(0)
  result    Json?       // 게임별 결과 자유 형식
  createdAt DateTime    @default(now())
  endedAt   DateTime?

  participants GameParticipant[]
}

model GameParticipant {
  id       String  @id @default(cuid())
  gameId   String
  memberId String
  isWinner Boolean @default(false)

  game     Game    @relation(fields: [gameId], references: [id])
  member   Member  @relation(fields: [memberId], references: [id])

  @@unique([gameId, memberId])
}

enum GameType {
  COFFEE_BET
  CODE_QUIZ
  TYPING_RACE
  BUG_HUNT
}

enum GameStatus {
  WAITING
  IN_PROGRESS
  FINISHED
  CANCELLED
}
```

---

## 2. 인덱스 전략

| 테이블 | 인덱스 | 이유 |
|--------|--------|------|
| `Attendance` | `(memberId, date)` UNIQUE | 중복 출퇴근 원천 차단 |
| `VoteChoice` | `(voteId, memberId)` UNIQUE | 중복 투표 방지 |
| `Post` | `villageId`, `status`, `createdAt` | 마을별 목록 필터 성능 |
| `ChatMessage` | `(roomId, createdAt)` | 채팅 기록 조회 |
| `GameParticipant` | `(gameId, memberId)` UNIQUE | 중복 참여 방지 |

---

## 3. 마이그레이션 절차

```bash
# 1. 스키마 작성 후
cd server
npx prisma migrate dev --name init

# 2. 스키마 변경 시
npx prisma migrate dev --name add_vote_table

# 3. Supabase 배포 시
npx prisma migrate deploy

# 4. Prisma Studio (DB 시각화)
npx prisma studio
```

---

## 4. 우마 잔액 원자적 업데이트

잔액 변경은 반드시 트랜잭션으로 처리 (레이스 컨디션 방지):

```typescript
// server/src/services/woomaService.ts
async function grantWooma(memberId: string, amount: number, reason: WoomaReason, refId?: string) {
  return await prisma.$transaction([
    prisma.member.update({
      where: { id: memberId },
      data: { wooMaBalance: { increment: amount } },
    }),
    prisma.woomaMaTransaction.create({
      data: { memberId, amount, reason, refId },
    }),
  ]);
}
```

---

## 5. Seed 데이터 (개발용)

```typescript
// server/prisma/seed.ts
// 테스트용 크루 4명 (팀원 닉네임)
const crews = [
  { crewName: 'snowshower', field: 'FE', githubId: 'snowshower', village: 'TAECHO' },
  { crewName: 'soojin',     field: 'FE', githubId: 'soojin',     village: 'TAECHO' },
  { crewName: 'eian',       field: 'BE', githubId: 'eian',       village: 'PPOLONG' },
  { crewName: 'mychan',     field: 'FE', githubId: 'mychan',     village: 'TAECHO' },
];
```

```bash
npx prisma db seed
```

---

## 6. 연결 포인트

| 테이블 | 연결 명세서 |
|--------|-------------|
| `Member` | `02-member.md` |
| `Attendance` | `04-economy.md` 출퇴근 |
| `Post`, `Answer` | `03-village.md` 게시판 |
| `WoomaMaTransaction` | `04-economy.md` 우마 전체 |
| `ChatMessage` | `05-interaction.md` 채팅 |
| `Vote`, `VoteChoice` | `06-game.md` 투표 |
| `Game`, `GameParticipant` | `06-game.md` 미니게임 |

---

## 7. 오픈 이슈

- [ ] ChatMessage: DB 저장 여부 (저장 시 비용 vs 새로고침 시 기록 유지)
- [ ] Member.wooMaBalance: DB 원장 단일 관리 vs 캐시(Redis) 병용
- [ ] 소프트 삭제: `deletedAt` 컬럼 추가 여부 (게시글/답변)
- [ ] 아바타 코스튬: 별도 `Costume` / `MemberCostume` 테이블 추가 여부
