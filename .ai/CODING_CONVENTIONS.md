# 코딩 컨벤션

> AI가 코드를 생성할 때 따라야 할 규칙. 프롬프트 마지막에 "코딩 컨벤션 파일 참고해줘"라고 추가하면 됩니다.

---

## 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `UserCard`, `LoginButton` |
| 함수 | camelCase | `getUserById`, `handleClick` |
| 변수 | camelCase | `userName`, `isLoading` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| 타입/인터페이스 | PascalCase | `User`, `ButtonProps` |
| 파일 (컴포넌트) | PascalCase | `UserCard.tsx` |
| 파일 (유틸/훅) | camelCase | `useAuth.ts`, `formatDate.ts` |
| CSS 클래스 | Tailwind 사용 (커스텀 없이) | |

---

## TypeScript 규칙

```typescript
// ✅ 명시적 타입 사용
const userName: string = '홍길동';

// ❌ any 사용 금지
const data: any = {};

// ✅ 인터페이스로 객체 타입 정의
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Props 타입은 컴포넌트 파일 내에 정의
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// ✅ 옵셔널 체이닝 사용
const name = user?.profile?.name ?? '익명';

// ✅ 타입 단언보다 타입 가드 선호
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}
```

---

## 컴포넌트 구조

```tsx
// 권장 컴포넌트 파일 구조
import React from 'react';

// 타입 정의
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

// 컴포넌트
export function MyComponent({ title, onAction }: MyComponentProps) {
  // 1. 상태
  const [isOpen, setIsOpen] = React.useState(false);

  // 2. 파생 값
  const displayTitle = title.trim();

  // 3. 이벤트 핸들러
  const handleClick = () => {
    setIsOpen(prev => !prev);
    onAction?.();
  };

  // 4. 렌더
  return (
    <div className="...">
      <h1>{displayTitle}</h1>
      <button onClick={handleClick}>클릭</button>
    </div>
  );
}

export default MyComponent;
```

---

## 파일 구조

```
workspace/{닉네임}/
├── src/
│   ├── components/    # 재사용 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   ├── hooks/         # 커스텀 훅
│   ├── utils/         # 유틸 함수
│   ├── types/         # 로컬 타입 (shared/ 사용 권장)
│   └── constants/     # 상수
```

---

## Import 순서

```typescript
// 1. React/라이브러리
import React from 'react';
import { useState } from 'react';

// 2. 외부 패키지
import { clsx } from 'clsx';

// 3. shared/ (팀 공유)
import { User } from '../../shared/types';
import { formatDate } from '../../shared/utils';

// 4. 로컬 (같은 workspace/)
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
```

---

## 주석 규칙

```typescript
// ✅ 왜(WHY)를 설명하는 주석 (비즈니스 로직의 의도)
// 백엔드 응답이 초 단위라서 ms로 변환
const timeMs = response.time * 1000;

// ❌ 무엇(WHAT)을 설명하는 주석 (코드로 이미 명확함)
// 시간에 1000을 곱함
const timeMs = response.time * 1000;

// ✅ TODO 주석 (해커톤 한정 허용)
// TODO: 통합 시 실제 API 연결 필요
const mockData = [...];
```

---

## 에러 처리

```typescript
// API 호출 패턴
async function fetchUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchUser 실패:', error);
    return null;
  }
}

// 컴포넌트에서 에러 상태
if (error) return <ErrorMessage message={error.message} />;
if (isLoading) return <LoadingSpinner />;
if (!data) return <EmptyState />;
```

---

## Tailwind CSS 패턴

```tsx
// 조건부 클래스 (clsx 또는 cn 사용)
import { clsx } from 'clsx';

<button
  className={clsx(
    'px-4 py-2 rounded-lg font-medium',
    isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700',
    disabled && 'opacity-50 cursor-not-allowed'
  )}
>

// 공통 스타일은 변수로
const cardStyle = 'bg-white rounded-xl shadow-sm border border-gray-100 p-4';
```
