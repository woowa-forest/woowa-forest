# 02. 회원 관리 명세서

> **변경 포인트**: 필드 추가/삭제는 `shared/types/01-member.ts` 타입과 DB 스키마만 수정  
> **연결 포인트**: 로그인 상태는 Zustand `useAuthStore`로 전역 관리

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 인증 방식 | GitHub OAuth 2.0 (MVP 간소화: 폼 기반 로그인도 가능) |
| 세션 관리 | JWT (AccessToken 15분 + RefreshToken 7일) |
| 수정 불가 필드 | 크루명, 분야, 마을 (가입 후 고정) |

---

## 2. 화면 목록

| 화면 ID | 화면명 | 경로 |
|---------|--------|------|
| `AUTH-01` | 랜딩 / 로그인 | `/` |
| `AUTH-02` | 회원가입 | `/signup` |
| `AUTH-03` | 마이페이지 | `/mypage` |
| `AUTH-04` | 크루 프로필 팝업 | 맵 위 오버레이 (라우팅 없음) |

---

## 3. 회원가입 (AUTH-02)

### 입력 필드

| 필드명 | 타입 | 필수 | 유효성 검사 | 비고 |
|--------|------|------|-------------|------|
| `crewName` | string | ✅ | 2~20자, 특수문자 불가 | 닉네임 |
| `field` | enum | ✅ | AN / FE / BE 중 택1 | 드롭다운 |
| `githubId` | string | ✅ | GitHub 사용자명 형식 | 우마 수확에 사용 |
| `village` | enum | ✅ | GURI / TAECHO / PPOLONG / COACH | 드롭다운 |
| `bio` | string | ❌ | 최대 100자 | 한 마디 |

### 유효성 규칙

```typescript
// 프론트 + 백엔드 동일 규칙
const VALIDATION = {
  crewName: { min: 2, max: 20, regex: /^[a-zA-Z가-힣0-9_-]+$/ },
  githubId: { regex: /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/ },
  bio: { max: 100 },
};
```

### API

```
POST /api/auth/signup
Body: { crewName, field, githubId, village, bio? }
Response 201: { memberId, accessToken, refreshToken }
Response 409: { code: 'DUPLICATE_CREW_NAME' }
```

---

## 4. 로그인 (AUTH-01)

### MVP 간소화 방식 (해커톤 기본)

- 크루명 입력 → 비밀번호 없이 입장 (데모 목적)
- 또는 GitHub OAuth 버튼 → GitHub 인증 → 자동 가입/로그인

### OAuth 플로우 (GitHub)

```
1. 프론트: GET /api/auth/github → GitHub 인증 페이지 리다이렉트
2. GitHub: 콜백 GET /api/auth/github/callback?code=xxx
3. 백엔드: code로 accessToken 교환 → GitHub 사용자 정보 조회
4. 백엔드: 신규 유저면 가입 화면으로 리다이렉트 (githubId 자동 세팅)
           기존 유저면 JWT 발급 후 맵으로 이동
```

### API

```
GET  /api/auth/github          → GitHub OAuth 시작
GET  /api/auth/github/callback → OAuth 콜백 처리
POST /api/auth/login           → 간소화 로그인 (크루명만)
POST /api/auth/refresh         → AccessToken 갱신
POST /api/auth/logout          → 로그아웃 (RefreshToken 무효화)
```

---

## 5. 마이페이지 (AUTH-03)

### 표시 정보

| 항목 | 수정 가능 | 비고 |
|------|-----------|------|
| 크루명 | ❌ | 읽기 전용 |
| 분야 | ❌ | 읽기 전용 |
| 마을 | ❌ | 읽기 전용 |
| 한 마디 (bio) | ✅ | textarea, 최대 100자 |
| 아바타 코스튬 | ✅ | 상점 연결 (`07-아바타` 참고) |
| 우마 잔액 | ❌ | 읽기 전용, 실시간 표시 |

### API

```
GET  /api/members/me            → 내 정보 조회
PATCH /api/members/me           → bio 수정
Body: { bio: string }
Response 200: { memberId, crewName, field, village, bio, wooma }
```

---

## 6. 다른 크루 프로필 팝업 (AUTH-04)

- 맵에서 다른 캐릭터에 E키 접근 시 오버레이로 표시
- 라우팅 없음, 컴포넌트 상태로 관리

### 표시 항목

```typescript
type CrewProfilePopup = {
  crewName: string;
  field: 'AN' | 'FE' | 'BE';
  village: string;
  bio: string;
  githubUrl: string;  // https://github.com/{githubId}
};
```

### API

```
GET /api/members/{memberId}/profile
Response 200: CrewProfilePopup
```

---

## 7. 타입 정의

```typescript
// shared/types/01-member.ts

export type Field = 'AN' | 'FE' | 'BE';
export type Village = 'GURI' | 'TAECHO' | 'PPOLONG' | 'COACH';

export interface Member {
  id: string;
  crewName: string;
  field: Field;
  githubId: string;
  village: Village;
  bio: string;
  wooMaBalance: number;
  avatarCostumeId: string | null;
  lastGithubSyncTime: string | null; // ISO 8601
}

export interface AuthState {
  member: Member | null;
  accessToken: string | null;
  isLoggedIn: boolean;
}
```

---

## 8. 전역 상태 (Zustand)

```typescript
// useAuthStore.ts
interface AuthStore extends AuthState {
  login: (token: string, member: Member) => void;
  logout: () => void;
  updateBio: (bio: string) => void;
  updateWooma: (delta: number) => void; // 우마 증감
}
```

---

## 9. 연결 포인트

| 연결 대상 | 방법 |
|-----------|------|
| 맵 캐릭터 | `member.avatarCostumeId`로 스프라이트 결정 |
| 경제 시스템 | `member.githubId`로 GitHub API 호출, `wooMaBalance` 읽기/쓰기 |
| 게시판 | `member.id`를 `author_id`로 사용 |
| 우물가 채팅 | `member.crewName` + `member.village`로 채팅 표시 |

---

## 10. 오픈 이슈

- [ ] 인증: GitHub OAuth 구현 vs 해커톤용 간소화 폼 (크루명만 입력)
- [ ] 분야·마을 수정 불가 정책: UX상 "잠금 아이콘 + 툴팁"으로 이유 표시 여부
- [ ] 아바타 기본 이미지: 분야별 기본 스프라이트 제공 여부 (AN/FE/BE 3종)
