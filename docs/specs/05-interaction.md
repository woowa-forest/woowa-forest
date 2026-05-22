# 05. 상호작용 명세서

> **변경 포인트**: 근접 반경, 채팅 최대 길이는 `INTERACTION_CONFIG` 상수로만 관리  
> **연결 포인트**: 맵 이벤트(`NEAR_WELL`, `NEAR_CHARACTER`)를 구독해 UI 활성화

---

## 1. 개요

| 기능 | 트리거 | UI 형태 |
|------|--------|---------|
| 근접 채팅 | 우물가 반경 진입 | 채팅 말풍선 오버레이 |
| 이모지 반응 | 단축키 또는 버튼 | 캐릭터 위 이모지 플로팅 |
| 프로필 보기 | 다른 캐릭터에 E키 | 프로필 팝업 |
| DM | 프로필 팝업 내 버튼 | 우측 DM 사이드패널 |

---

## 2. 근접 채팅

### 동작 방식

```
1. 캐릭터가 우물가(WELL) 기물 반경 5타일 이내 진입
   → 맵에서 NEAR_WELL 이벤트 발생
2. 하단에 채팅 입력창 오버레이 활성화
3. 같은 반경 내 모든 크루가 같은 채팅 채널 공유 (WebSocket room)
4. 반경 이탈 시 채팅창 비활성화, 이전 메시지는 유지
```

### 채팅 메시지 구조

```typescript
interface ChatMessage {
  id: string;
  roomId: string;        // 'floor-{floorId}-well' 형태
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}
```

### 상수

```typescript
// shared/constants/03-economy.ts 또는 별도 상수
export const INTERACTION_CONFIG = {
  WELL_RADIUS_TILES: 5,          // 우물가 근접 반경
  CHAT_MAX_LENGTH: 200,          // 채팅 최대 글자 수
  CHAT_HISTORY_LIMIT: 50,        // 화면에 표시할 최근 메시지 수
  CHARACTER_INTERACT_RADIUS: 2,  // 캐릭터 프로필 열기 반경
  EMOJI_DURATION_MS: 2000,       // 이모지 표시 지속 시간
};
```

### WebSocket 이벤트

```
Client → Server:
  SEND_CHAT  { roomId, content }

Server → Client(s in same room):
  RECEIVE_CHAT  { id, roomId, senderId, senderName, content, createdAt }

Server → Client:
  CHAT_ERROR    { code: 'TOO_LONG' | 'EMPTY_CONTENT' }
```

### UI

```
┌─────────────────────────────────────────────────┐
│ [캐릭터 목록: 우물가 주변 크루들]                  │
│                                                  │
│ snowshower: 점심 뭐 먹지...       12:30          │
│ soojin: 저 해장국 먹고 싶어요!     12:30          │
│ mychan: 투표 ㄱ?                  12:31          │
│                                                  │
│ [메시지 입력.........................] [전송]      │
└─────────────────────────────────────────────────┘
```

---

## 3. 이모지 반응

### 동작 방식

```
1. 단축키 (1~5) 또는 이모지 팔레트 버튼 클릭
2. 본인 캐릭터 위에 이모지 2초간 표시 후 사라짐
3. WebSocket으로 같은 층 모든 유저에게 브로드캐스트
```

### 이모지 목록 (변경 가능)

```typescript
export const EMOJI_LIST = ['👋', '❓', '✅', '😂', '🔥'] as const;
// 단축키: 1=👋, 2=❓, 3=✅, 4=😂, 5=🔥
```

### WebSocket 이벤트

```
Client → Server:
  SEND_EMOJI  { floorId, emoji }

Server → Client(s on same floor):
  RECEIVE_EMOJI  { memberId, emoji }
  → 해당 memberId 캐릭터 위에 이모지 렌더링
```

---

## 4. 다른 크루 프로필 보기

> 상세 UI는 `02-member.md` 6절 참고.

### 동작 방식

```
1. 다른 캐릭터 반경 2타일 이내 진입 → E키 안내 표시
2. E키 입력 → GET /api/members/{memberId}/profile
3. 프로필 팝업 오버레이 표시
4. ESC 또는 맵 클릭 시 닫힘
```

---

## 5. DM (다이렉트 메시지)

### 동작 방식

```
1. 크루 프로필 팝업 → [DM 보내기] 버튼
2. 우측에 DM 사이드패널 슬라이드인
3. 해당 크루와의 1:1 채팅 채널 열림
4. 실시간 메시지 송수신 (WebSocket)
```

### WebSocket Room 명명

```
dm-{sortedMemberId1}-{sortedMemberId2}
// ID 정렬로 항상 동일한 room ID 보장
```

### WebSocket 이벤트

```
Client → Server:
  JOIN_DM    { targetMemberId }
  SEND_DM    { roomId, content }

Server → Client:
  RECEIVE_DM { id, roomId, senderId, senderName, content, createdAt }
```

### DM 미읽음 알림

- 우측 하단 알림 뱃지 (미읽음 수 표시)
- 마이페이지 또는 맵 오버레이 HUD에 표시

---

## 6. 컴포넌트 구조

```
workspace/{닉네임}/
  interaction/
    NearbyChat.tsx      # 우물가 근접 채팅 오버레이
    EmojiPalette.tsx    # 이모지 팔레트 UI
    EmojiFloat.tsx      # 캐릭터 위 이모지 플로팅 애니메이션
    DmPanel.tsx         # DM 사이드패널
    DmMessage.tsx       # DM 메시지 카드
```

---

## 7. 연결 포인트

| 이벤트 | 출발 | 도착 |
|--------|------|------|
| `NEAR_WELL` | `01-map.md` 맵 | `NearbyChat.tsx` 활성화 |
| `LEAVE_WELL` | `01-map.md` 맵 | `NearbyChat.tsx` 비활성화 |
| `NEAR_CHARACTER` | `01-map.md` 맵 | E키 안내 표시 |
| `INTERACT_CHARACTER` | E키 입력 | `02-member.md` 프로필 팝업 |
| `OPEN_DM` | 프로필 팝업 버튼 | `DmPanel.tsx` 열기 |

---

## 8. 오픈 이슈

- [ ] DM: MVP 범위 포함 여부 (WebSocket + 채팅 구현 비용 고려)
- [ ] 근접 채팅 영속성: 채팅 기록 DB 저장 vs 메모리(세션 중만 유지)
- [ ] 이모지 팔레트: 고정 5개 vs 우마로 추가 구매 가능 이모지 확장
- [ ] DM 미읽음 알림: 브라우저 푸시 알림 연동 여부
