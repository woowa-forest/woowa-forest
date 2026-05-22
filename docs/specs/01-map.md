# 01. 맵 시스템 명세서

> **변경 포인트**: 층 수, 타일 크기, 기물 위치는 `constants/` 상수로만 관리 → 명세 바꿀 때 상수 파일만 수정

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 렌더링 방식 | 2D 탑다운 타일 맵 (포켓몬스터 스타일) |
| 엔진 | Phaser.js 3.x (결정 전: Canvas API도 고려, `11-오픈이슈` 참고) |
| 타일 크기 | 32×32px (변경 시 `TILE_SIZE` 상수 하나만 수정) |
| 맵 단위 | 층(Floor) 단위로 분리, 층마다 독립 씬(Scene) |

---

## 2. 층 구조

### 층 목록

| 층 | 마을명 | 트랙 | 테마 컬러 |
|----|--------|------|-----------|
| 11F | 구리마을 | Android | `#4CAF50` (초록) |
| 12F | 태초마을 | Frontend | `#2196F3` (파랑) |
| 13F | 뽀롱뽀롱마을 | Backend (둠바족) | `#FF9800` (주황) |

### 층 이동

- 계단 타일을 밟으면 → 페이드 아웃 0.3s → 다음 층 로드 → 페이드 인
- 이동 방향: 11F ↔ 12F ↔ 13F (연속 이동 가능)

---

## 3. 맵 레이아웃 (층당)

```
[맵 가로: 40타일 × 세로: 25타일 = 1280×800px 기준]

┌──────────────────────────────────────────────────────────┐
│  복도 (상단 통로)                                         │
│                                                          │
│  [마을 입구]        [우물가]     [게시판]    [계단]       │
│                                                          │
│  [마을 내부 공간]                                         │
│   └ 소품 배치 가능 구역 (타일 타입: DECORATABLE)          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. 타일 타입 정의

```typescript
// shared/types/02-map.ts
type TileType =
  | 'FLOOR'         // 기본 바닥 (이동 가능)
  | 'WALL'          // 벽 (충돌, 이동 불가)
  | 'OBJECT'        // 기물 위치 (상호작용 가능)
  | 'DECORATABLE'   // 소품 배치 가능 구역
  | 'STAIR_UP'      // 위층 계단
  | 'STAIR_DOWN'    // 아래층 계단
  | 'PORTAL'        // 마을 입구/출구
```

---

## 5. 기물 (Object) 명세

### 공통 기물

| 기물 ID | 이름 | 위치 (타일 좌표) | 상호작용 키 | 동작 |
|---------|------|------------------|-------------|------|
| `WELL` | 우물가 | 층별 고정 (상수로 관리) | 근접 시 자동 | 근접 채팅 존 활성화 |
| `BULLETIN` | 게시판 | 층별 고정 | `E` | 게시판 모달 열기 |
| `STAIR` | 계단 | 층별 고정 | 밟으면 자동 | 층 이동 |

### 층별 특색 기물 (장식용, 상호작용 없음)

| 층 | 기물 |
|----|------|
| 11F | 안드로이드 로봇 조형물 |
| 12F | 픽셀 모니터, HTML 나무 |
| 13F | 커피 자판기, 스프링 조형물 |

---

## 6. 상수 파일 구조

```typescript
// shared/constants/01-floors.ts
export const FLOORS = {
  11: { id: 11, name: '구리마을', track: 'ANDROID', theme: '#4CAF50' },
  12: { id: 12, name: '태초마을', track: 'FRONTEND', theme: '#2196F3' },
  13: { id: 13, name: '뽀롱뽀롱마을', track: 'BACKEND', theme: '#FF9800' },
} as const;

export const TILE_SIZE = 32; // px — 변경 시 여기만 수정
export const MAP_WIDTH = 40; // 타일 수
export const MAP_HEIGHT = 25;

// shared/constants/02-villages.ts
export const OBJECTS_BY_FLOOR: Record<number, ObjectConfig[]> = {
  11: [
    { id: 'WELL', x: 10, y: 12, type: 'WELL' },
    { id: 'BULLETIN', x: 20, y: 12, type: 'BULLETIN' },
    { id: 'STAIR_UP', x: 38, y: 12, type: 'STAIR_UP' },
  ],
  // 12, 13층도 동일 구조
};
```

---

## 7. 컴포넌트 / 파일 구조

```
workspace/{닉네임}/
  map/
    01-MapRenderer.tsx     # Phaser Scene 마운트, 층 전환 관리
    02-FloorScene.ts       # 각 층 Scene 클래스 (Phaser.Scene 상속)
    03-TileMap.ts          # 타일맵 데이터 → Phaser 렌더링 변환
    04-ObjectManager.ts    # 기물 배치 및 상호작용 감지
    05-FloorTransition.ts  # 층 전환 페이드 애니메이션
```

---

## 8. 연결 포인트 (다른 명세서와 연결)

| 이벤트 | 발생 위치 | 구독 대상 |
|--------|-----------|-----------|
| `NEAR_WELL` | 우물가 반경 진입 | `05-interaction.md` 근접 채팅 |
| `INTERACT_BULLETIN` | E키 + 게시판 | `03-village.md` 게시판 모달 |
| `FLOOR_CHANGED` | 계단 밟음 | 전체 맵 씬 교체, 캐릭터 위치 초기화 |
| `NEAR_CHARACTER` | 다른 캐릭터 반경 진입 | `05-interaction.md` 프로필 팝업 |

---

## 9. 오픈 이슈

- [ ] 맵 엔진: Phaser.js vs 순수 Canvas API
- [ ] 타일셋: 직접 픽셀 아트 제작 vs 오픈소스 (예: LPC Tileset)
- [ ] 층 이동: 페이드 전환 vs 즉시 텔레포트
- [ ] 맵 데이터 포맷: JSON (Tiled 에디터) vs 코드 내 배열 정의
