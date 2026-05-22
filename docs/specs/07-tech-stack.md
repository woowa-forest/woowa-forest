# 07. 기술 스택 명세서

> 해커톤 시간 제약을 최우선으로 고려한 선택. 각 결정의 대안도 병기.

---

## 1. Frontend

### 핵심 스택

| 영역 | 선택 | 버전 | 대안 | 선택 이유 |
|------|------|------|------|-----------|
| 프레임워크 | **React** | 18.x | Next.js | SSR 불필요, 빠른 세팅 |
| 번들러 | **Vite** | 5.x | CRA | 빌드 속도 |
| 언어 | **TypeScript** | 5.x | — | 팀 컨벤션 |
| 맵 엔진 | **Phaser.js** | 3.x | Canvas API | 타일맵/스프라이트 내장 |
| 스타일링 | **Tailwind CSS** | 3.x | styled-components | UI 빠른 개발 |
| 상태관리 | **Zustand** | 4.x | Jotai / Redux | 경량, 보일러플레이트 없음 |
| 실시간 | **Socket.io-client** | 4.x | Supabase Realtime | 서버 WebSocket과 페어 |
| HTTP | **Axios** | 1.x | fetch | 인터셉터로 토큰 자동 첨부 |
| 마크다운 | **react-markdown** | — | — | 게시판 본문 렌더링 |

### 패키지 설치 명령 (참고)

```bash
npm create vite@latest woowa-forest -- --template react-ts
npm install phaser zustand axios socket.io-client
npm install tailwindcss @tailwindcss/typography
npm install react-markdown
```

### 주요 설정 파일 위치

```
vite.config.ts          # 프록시 설정 (API → 백엔드)
tailwind.config.ts      # 테마 컬러 (마을별 색상 추가)
tsconfig.json           # 경로 alias: @shared → shared/
```

### Tailwind 마을 테마 컬러 추가

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      guri:    '#4CAF50',
      taecho:  '#2196F3',
      ppolong: '#FF9800',
    }
  }
}
```

---

## 2. Backend

### 핵심 스택

| 영역 | 선택 | 버전 | 대안 | 선택 이유 |
|------|------|------|------|-----------|
| 런타임 | **Node.js** | 20.x LTS | — | JS 통일 |
| 프레임워크 | **Express** | 4.x | NestJS | 빠른 세팅, 해커톤 적합 |
| WebSocket | **Socket.io** | 4.x | ws | room, namespace 내장 |
| ORM | **Prisma** | 5.x | TypeORM | TypeScript 친화, 마이그레이션 |
| DB | **PostgreSQL** | 15.x | SQLite | Supabase 무료 제공 |
| 인증 | **jsonwebtoken** | 9.x | passport-jwt | 직접 구현, 의존 최소화 |
| 외부 API | **GitHub REST API** | v3 | GraphQL v4 | 단순 조회, REST로 충분 |
| 환경변수 | **dotenv** | — | — | 표준 |

### 패키지 설치 명령 (참고)

```bash
mkdir server && cd server
npm init -y
npm install express socket.io prisma @prisma/client
npm install jsonwebtoken bcryptjs axios dotenv cors
npm install -D typescript @types/express @types/node ts-node-dev
```

### 폴더 구조

```
server/
  src/
    routes/
      auth.ts
      members.ts
      posts.ts
      economy.ts
      games.ts
      votes.ts
    services/
      githubService.ts     # GitHub API 호출
      woomaService.ts      # 우마 지급/차감 공통 로직
    socket/
      index.ts             # Socket.io 이벤트 등록
      chatHandler.ts       # 채팅 이벤트
      gameHandler.ts       # 미니게임 이벤트
    middleware/
      auth.ts              # JWT 검증 미들웨어
    prisma/
      schema.prisma        # DB 스키마
  .env
  tsconfig.json
```

---

## 3. 인프라 / 배포

| 영역 | 선택 | 무료 티어 | 대안 |
|------|------|-----------|------|
| Frontend 배포 | **Vercel** | ✅ | Netlify |
| Backend 배포 | **Railway** | ✅ (500시간/월) | Render |
| DB 호스팅 | **Supabase** | ✅ (500MB) | Railway PostgreSQL |
| 도메인 | Vercel 자동 `.vercel.app` | ✅ | — |

### 환경변수 목록

```bash
# server/.env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GITHUB_API_TOKEN="..."        # 서버 공용 토큰 (Rate Limit 5000/h)
CLIENT_URL="http://localhost:5173"

# Frontend (.env)
VITE_API_URL="http://localhost:3000"
VITE_SOCKET_URL="http://localhost:3000"
```

---

## 4. WebSocket 아키텍처

### Room 구조

```
floors
  └ floor-{11|12|13}               # 층별 위치 동기화, 이모지 브로드캐스트
      └ floor-{floorId}-well       # 우물가 근접 채팅 (반경 내 크루만)

dm
  └ dm-{memberId1}-{memberId2}     # 1:1 DM
```

### 공통 이벤트 목록

```
Client → Server:
  JOIN_FLOOR      { floorId }
  MOVE            { floorId; x; y }
  SEND_CHAT       { roomId; content }
  SEND_EMOJI      { floorId; emoji }
  JOIN_DM         { targetMemberId }
  SEND_DM         { roomId; content }
  JOIN_GAME       { gameId }
  GAME_ACTION     { gameId; action; payload }

Server → Client:
  PLAYERS_UPDATE  { floorId; players: PlayerPosition[] }
  RECEIVE_CHAT    ChatMessage
  RECEIVE_EMOJI   { memberId; emoji }
  RECEIVE_DM      ChatMessage
  GAME_STATE      { gameId; state }
  GAME_RESULT     { gameId; result }
```

---

## 5. API 공통 규칙

### 기본 URL

```
개발: http://localhost:3000/api
프로덕션: https://{railway-domain}/api
```

### 인증 헤더

```
Authorization: Bearer {accessToken}
```

### 공통 에러 응답 형식

```typescript
interface ApiError {
  code: string;      // 'DUPLICATE_CREW_NAME', 'UNAUTHORIZED' 등
  message: string;   // 사람이 읽을 수 있는 설명
}
```

### HTTP 상태 코드 규칙

| 코드 | 용도 |
|------|------|
| 200 | 조회/수정 성공 |
| 201 | 생성 성공 |
| 204 | 삭제 성공 |
| 400 | 유효성 검사 실패 |
| 401 | 미인증 |
| 402 | 우마 부족 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복, 이미 채택 등) |
| 429 | 요청 과다 (쿨타임) |
| 503 | 외부 API 오류 |

---

## 6. 개발 순서 권장

```
1단계 (기반):
  - Prisma 스키마 작성 + 마이그레이션
  - Express 기본 서버 + JWT 인증

2단계 (맵):
  - Phaser.js 타일맵 렌더링
  - 캐릭터 이동 (단일 유저)
  - Socket.io 위치 동기화

3단계 (콘텐츠):
  - 게시판 CRUD
  - 우마 시스템 (출퇴근 + GitHub 수확)

4단계 (재미):
  - 투표, 점심 추천
  - 커피 내기 미니게임
```

---

## 7. 오픈 이슈

- [ ] Backend 필요 여부: Supabase BaaS로 대체 가능한 기능 범위 파악
- [ ] GitHub OAuth vs 간소화 로그인: 해커톤 시간 내 OAuth 구현 가능 여부
- [ ] Phaser.js vs Canvas: Phaser 러닝커브 vs Canvas 직접 제어
- [ ] Monorepo 구조: `workspace/` 내 각자 작업 vs 별도 repo 분리
