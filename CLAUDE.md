# 프로젝트 컨텍스트 (Claude Code 자동 읽기)

## 프로젝트 개요

- **프로젝트명**: 우아한 숲 (Woowa Forest)
- **행사**: 우아한 테크코스 8기 제 1회 테코톤
- **형태**: 4인 팀 바이브 코딩 해커톤

## 팀 구성

| 닉네임 | 담당 영역 |
|--------|----------|
| snowshower | [담당 기능] |
| soojin | [담당 기능] |
| eian | [담당 기능] |
| mychan | [담당 기능] |

## 기술 스택

- **프레임워크**: [React / Next.js / Vue 등 작성]
- **언어**: TypeScript
- **스타일링**: [Tailwind CSS / styled-components 등 작성]
- **상태관리**: [Zustand / Redux / Jotai 등 작성]
- **백엔드**: [Express / Nest.js / 없음 등 작성]

## 폴더 구조 규칙

- `workspace/{닉네임}/` — 각자 독립 작업 공간, 자유롭게 사용
- `shared/` — 팀 전체가 공유하는 타입, 유틸, 공통 컴포넌트
- `integration/` — 최종 통합 결과물 (해커톤 종료 전 병합)

## 코딩 컨벤션

- 컴포넌트: PascalCase (`MyComponent.tsx`)
- 함수/변수: camelCase (`myFunction`)
- 상수: UPPER_SNAKE_CASE (`MAX_COUNT`)
- 파일명: kebab-case (`my-component.tsx`) 또는 PascalCase (컴포넌트)

## AI 작업 시 주의사항

1. `shared/types/` 타입 정의를 최대한 재사용
2. 각자 워크스페이스 내에서만 자유롭게 작업
3. `shared/`에 추가할 때는 팀원과 충돌 최소화
4. 통합 시 네이밍 충돌에 주의

## 추가 컨텍스트

[프로젝트의 핵심 도메인, 특수 요구사항, 주의사항 등을 여기에 추가하세요]