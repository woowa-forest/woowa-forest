# Shared (공유 리소스)

> 팀 전체가 공유하는 타입, 유틸 함수, 공통 컴포넌트

## 구조

```
shared/
├── types/        # TypeScript 타입/인터페이스
├── utils/        # 유틸 함수
└── components/   # 공통 UI 컴포넌트
```

## 사용 규칙

1. **추가 전에 팀 공지** — 슬랙/카톡으로 "shared/에 [내용] 추가합니다" 알림
2. **이름 충돌 확인** — 기존 파일과 이름 겹치지 않도록
3. **타입 우선** — 기능 개발 전에 타입을 먼저 shared/types/에 정의

## 사용 예시

```typescript
// 타입 import
import { User, ApiResponse } from '../../shared/types';

// 유틸 import
import { formatDate, cn } from '../../shared/utils';

// 공통 컴포넌트
import { Button, LoadingSpinner } from '../../shared/components';
```

## 현재 공유 항목

### Types
- [추가되면 여기에 작성]

### Utils
- [추가되면 여기에 작성]

### Components
- [추가되면 여기에 작성]
