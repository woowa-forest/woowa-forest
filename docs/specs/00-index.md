# 우아한 숲 — 기능 명세서 인덱스

> **읽는 순서**: 09(디자인) → 07(기술스택) → 08(DB) → 01(맵) → 02(회원) → 03(마을/게시판) → 04(경제) → 05(상호작용) → 06(게임)

---

## 명세서 목록

| 파일 | 담당 기능 | 핵심 결정 사항 |
|------|-----------|----------------|
| [09-design.md](./09-design.md) | 비주얼 컨셉, 팔레트, 타일·캐릭터·UI 디자인 | 픽셀 아트 직접 제작 vs 오픈소스 |
| [01-map.md](./01-map.md) | 2D 타일 맵, 층 구조, 기물 배치 | 맵 엔진 (Phaser vs Canvas) |
| [02-member.md](./02-member.md) | 회원가입, 로그인, 마이페이지 | 인증 방식 (GitHub OAuth vs 폼) |
| [03-village.md](./03-village.md) | 마을 게시판, Q&A, 답변 채택 | 질문 등록 방식 (A안 vs B안) |
| [04-economy.md](./04-economy.md) | 우마 획득/사용, 출퇴근, GitHub 수확 | 우마 지급 상수 (`WOOMA_REWARD`) |
| [05-interaction.md](./05-interaction.md) | 근접 채팅, 이모지, DM | DM MVP 포함 여부 |
| [06-game.md](./06-game.md) | 투표, 점심 추천, 커피 내기 | 점심 추천 로직 (랜덤 vs AI) |
| [07-tech-stack.md](./07-tech-stack.md) | 기술 스택, API 규칙, 개발 순서 | Backend 필요 여부 |
| [08-database.md](./08-database.md) | Prisma 스키마, 인덱스, 마이그레이션 | ChatMessage DB 저장 여부 |

---

## MVP 우선순위 요약

### Core (반드시)
- 회원가입 / 로그인 → `02-member.md`
- 2D 맵 + 캐릭터 이동 → `01-map.md`
- 게시판 CRUD → `03-village.md`

### Should (시간 여유 시)
- 실시간 멀티유저 위치 동기화 → `01-map.md` + `07-tech-stack.md`
- 우마 경제 시스템 → `04-economy.md`
- 근접 채팅 → `05-interaction.md`

### Could (데모 완성도용)
- 투표 + 점심 추천 → `06-game.md`
- 커피 내기 미니게임 → `06-game.md`
- 아바타 코스튬 상점 → `02-member.md`

---

## 공통 상수 파일 위치

```
shared/
  types/
    01-member.ts     # Member, Field, Village
    02-map.ts        # TileType, Floor, Position
    03-post.ts       # Post, Answer, PostTag
    04-economy.ts    # WoomaTransaction, WoomaReason
    05-game.ts       # GameRoom, Vote
  constants/
    01-floors.ts     # FLOORS, TILE_SIZE, MAP_WIDTH/HEIGHT
    02-villages.ts   # OBJECTS_BY_FLOOR (기물 위치)
    03-economy.ts    # WOOMA_REWARD, 쿨타임 상수
```

---

## 연결 관계도

```
01-map ──NEAR_WELL──────────────────▶ 05-interaction (근접 채팅)
01-map ──INTERACT_BULLETIN──────────▶ 03-village (게시판 모달)
01-map ──NEAR_CHARACTER─────────────▶ 02-member (프로필 팝업)

02-member ──wooMaBalance────────────▶ 04-economy (잔액 표시)
02-member ──githubId────────────────▶ 04-economy (수확 API)

03-village ──답변 채택──────────────▶ 04-economy (우마 +2000)

04-economy ──트랜잭션──────────────▶ 08-database (WoomaMaTransaction)

06-game ──게임 결과─────────────────▶ 04-economy (우마 증감)
06-game ──투표 생성─────────────────▶ 05-interaction (실시간 결과)
```
