# 03. 마을 & 게시판 명세서

> **변경 포인트**: 게시판 태그 종류는 `POST_TAGS` 상수만 수정  
> **연결 포인트**: 게시판 접근은 맵 기물 `BULLETIN` 상호작용 이벤트로 트리거

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 게시판 범위 | 마을별(층별) 게시판 + 전체 공용 게시판 |
| 접근 방법 | 맵의 게시판 기물에 E키 → 모달 팝업 |
| Q&A 채택 | 질문자만 답변 채택 가능, 채택 시 답변자에게 우마 지급 |

---

## 2. 화면 목록

| 화면 ID | 화면명 | 진입 경로 |
|---------|--------|-----------|
| `BOARD-01` | 게시판 목록 | 게시판 기물 E키 |
| `BOARD-02` | 게시글 상세 | 목록에서 클릭 |
| `BOARD-03` | 게시글 작성 | 목록 화면 내 버튼 |
| `BOARD-04` | 답변 작성 | 상세 화면 내 인라인 |

---

## 3. 게시판 목록 (BOARD-01)

### 탭 구조

```
[전체] [구리마을] [태초마을] [뽀롱뽀롱마을]
```

- 현재 위치한 층의 마을 탭이 기본 선택
- 전체 탭: 모든 마을 게시글 통합 표시

### 게시글 카드

```
┌─────────────────────────────────────────────────┐
│ [태그: 질문]  제목 텍스트 (최대 2줄)              │
│ 크루명 · 마을 · n분 전          💬 답변 n개       │
└─────────────────────────────────────────────────┘
```

### 필터 / 정렬

| 옵션 | 값 |
|------|-----|
| 태그 필터 | 전체 / 질문 / 공유 / 잡담 |
| 정렬 | 최신순 / 답변 많은 순 |
| 상태 필터 | 전체 / 해결됨 / 미해결 |

### API

```
GET /api/posts?village={villageId}&tag={tag}&sort={sort}&status={status}&page={page}&size=20
Response 200: {
  posts: PostSummary[];
  totalCount: number;
  hasNext: boolean;
}
```

---

## 4. 게시글 작성 (BOARD-03)

### 입력 필드

| 필드명 | 타입 | 필수 | 제한 |
|--------|------|------|------|
| `title` | string | ✅ | 최대 100자 |
| `body` | string (Markdown) | ✅ | 최대 5,000자 |
| `tag` | enum | ✅ | QUESTION / SHARE / CHAT |
| `villageId` | enum | ✅ | 현재 위치한 마을 (자동 세팅, 변경 가능) |

### API

```
POST /api/posts
Body: { title, body, tag, villageId }
Response 201: { postId }

PATCH /api/posts/{postId}
Body: { title?, body?, tag? }
Response 200: { postId }

DELETE /api/posts/{postId}
Response 204
  → 단, 채택된 답변이 있는 질문은 삭제 불가 (409 반환)
```

---

## 5. 게시글 상세 (BOARD-02)

### 표시 구조

```
┌─────────────────────────────────────────────────┐
│ [태그] 제목                              [수정][삭제] (본인만)
│ 작성자 · 마을 · 시간
├─────────────────────────────────────────────────┤
│ 본문 (Markdown 렌더링)                           │
├─────────────────────────────────────────────────┤
│ 답변 n개                                         │
│                                                  │
│ ┌── 답변 카드 ────────────────────────────────┐  │
│ │ 크루명 · 시간            [채택하기] (질문자만) │  │
│ │ 답변 내용                                   │  │
│ └─────────────────────────────────────────────┘  │
│                                                  │
│ [답변 작성 인풋]                                  │
└─────────────────────────────────────────────────┘
```

### API

```
GET /api/posts/{postId}
Response 200: Post & { answers: Answer[] }
```

---

## 6. 답변 (BOARD-04)

### 작성

```
POST /api/posts/{postId}/answers
Body: { body: string }  // 최대 3,000자
Response 201: { answerId }
```

### 채택

```
POST /api/posts/{postId}/answers/{answerId}/adopt
  → 백엔드 검증:
     1. 요청자 = 질문 작성자 여부 확인
     2. 질문자 = 답변자 여부 확인 (자문자답 차단)
     3. 이미 채택된 답변 존재 여부 확인
     4. 통과 시: answer.isAdopted = true, post.status = RESOLVED
                 답변자 우마 +2,000 트랜잭션 발생

Response 200: { answerId, woomaDelta: 2000 }
Response 409: { code: 'ALREADY_ADOPTED' | 'SELF_ANSWER' | 'NOT_OWNER' }
```

---

## 7. 타입 정의

```typescript
// shared/types/03-post.ts

export type PostTag = 'QUESTION' | 'SHARE' | 'CHAT';
export type PostStatus = 'OPEN' | 'RESOLVED';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  villageId: Village;
  title: string;
  body: string;         // Markdown
  tag: PostTag;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PostSummary {
  id: string;
  authorName: string;
  villageId: Village;
  title: string;
  tag: PostTag;
  status: PostStatus;
  answerCount: number;
  createdAt: string;
}

export interface Answer {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  isAdopted: boolean;
  createdAt: string;
}
```

---

## 8. 상수

```typescript
// shared/constants/01-floors.ts 에 추가
export const POST_TAGS: Record<PostTag, string> = {
  QUESTION: '질문',
  SHARE: '공유',
  CHAT: '잡담',
};

export const WOOMA_REWARD = {
  ANSWER_ADOPTED: 2000,
} as const;
```

---

## 9. 컴포넌트 구조

```
workspace/{닉네임}/
  bulletin/
    05-Bulletin.tsx          # 게시판 모달 루트, 탭 관리
    05-PostList.tsx          # 게시글 목록 + 필터
    05-PostDetail.tsx        # 게시글 상세 + 답변 목록
    05-PostForm.tsx          # 작성/수정 폼
    05-AnswerCard.tsx        # 답변 카드 + 채택 버튼
    05-AnswerForm.tsx        # 답변 입력
```

---

## 10. 연결 포인트

| 이벤트 | 출발 | 도착 |
|--------|------|------|
| `INTERACT_BULLETIN` | `01-map.md` 기물 상호작용 | `05-Bulletin.tsx` 모달 열기 |
| 답변 채택 완료 | `BOARD-04` | `04-economy.md` 우마 트랜잭션 |
| 아바타 위 ❓ 클릭 (A안) | `02-member.md` 마이페이지 질문 등록 | `BOARD-03` 게시글 작성 |

---

## 11. 오픈 이슈

- [ ] 질문 등록 방식: A안(아바타 위 ❓ 말풍선) vs B안(게시판 내 작성 버튼)
- [ ] 본문 에디터: Markdown 직접 입력 vs 간단한 리치 텍스트 에디터
- [ ] 채택된 질문 삭제 정책: 완전 삭제 불가 vs 소프트 삭제 허용
- [ ] 게시글 페이지네이션: 무한 스크롤 vs 페이지 버튼
