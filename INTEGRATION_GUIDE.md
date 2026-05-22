# 통합 가이드

> 해커톤 종료 **1시간 전**에 시작하세요.  
> 통합 담당자: **mychan** (또는 팀에서 지정)

---

## 통합 순서

### Step 1: 상태 점검 (5분)

각자 현재 상태를 팀에 공유:
```
- [ ] 내 기능이 로컬에서 동작하는가?
- [ ] 미완성 코드가 있다면 주석 처리했는가?
- [ ] 타입 에러, 콘솔 에러가 없는가?
- [ ] 변경사항을 모두 커밋·푸시했는가?
```

### Step 2: 공통 타입/유틸 병합 (10분)

`shared/` 폴더의 변경사항부터 `dev`에 병합:

```bash
git checkout dev
git merge feat/[담당자]/shared --no-ff
```

충돌 발생 시 → 해당 담당자와 함께 즉시 해결

### Step 3: 기능별 병합 (20분)

우선순위 순서대로 병합 (핵심 기능 먼저):

```bash
# 각 브랜치를 dev에 순서대로 병합
git merge feat/snowshower/[기능] --no-ff
git merge feat/soojin/[기능] --no-ff
git merge feat/eian/[기능] --no-ff
git merge feat/mychan/[기능] --no-ff
```

### Step 4: 통합 테스트 (15분)

```bash
npm install   # 새 패키지 설치 확인
npm run build # 빌드 에러 확인
npm run dev   # 실제 동작 확인
```

체크리스트:
- [ ] 메인 화면이 정상 표시되는가?
- [ ] 핵심 기능 플로우가 동작하는가?
- [ ] 콘솔 에러가 없는가?
- [ ] 빌드가 성공하는가?

### Step 5: `integration/`으로 최종 정리 (10분)

```bash
# integration/ 폴더에 최종 결과물 정리
# 발표용 스크린샷 촬영
# 데모 시나리오 최종 확인
```

---

## 충돌 해결 가이드

### import 충돌

```typescript
// 충돌 전: 각자 같은 이름 사용
// snowshower/Button.tsx
// soojin/Button.tsx

// 해결: 네임스페이스로 구분
// components/SnowshowerButton.tsx
// components/SoojinButton.tsx
// 또는 기능명으로 구분
```

### 타입 충돌

```typescript
// 한 파일에서 타입 통합
// shared/types/index.ts에서 최종 타입 결정
```

### 라우팅 충돌

```typescript
// 경로 중복 확인
// /home, /main 같은 역할 → 하나로 통일
```

---

## 통합 후 확인 사항

| 항목 | 확인자 | 상태 |
|------|--------|------|
| 빌드 성공 | | [ ] |
| 메인 기능 동작 | | [ ] |
| 스타일 깨짐 없음 | | [ ] |
| 콘솔 에러 없음 | | [ ] |
| 발표 시나리오 동작 | | [ ] |

---

## 긴급 롤백

통합 중 심각한 문제 발생 시:

```bash
# 병합 취소
git merge --abort

# 특정 커밋으로 되돌리기
git reset --hard [커밋 해시]

# 가장 최근 동작하는 상태로
git stash
```

**원칙**: 동작하는 것이 완벽한 것보다 낫다. 통합이 어려우면 가장 완성도 높은 한 명의 결과물로 발표.