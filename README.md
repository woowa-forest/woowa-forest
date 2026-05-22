# 🌲 우아한 숲 (Woowa Forest)

> 우아한 테크코스 8기 제 1회 테코톤 프로젝트

## 팀원

| 닉네임 | 담당 영역 | 워크스페이스 |
|--------|----------|------------|
| snowshower | [담당 기능 작성] | [workspace/snowshower](./workspace/snowshower/) |
| soojin | [담당 기능 작성] | [workspace/soojin](./workspace/soojin/) |
| eian | [담당 기능 작성] | [workspace/eian](./workspace/eian/) |
| mychan | [담당 기능 작성] | [workspace/mychan](./workspace/mychan/) |

## 프로젝트 소개

[프로젝트 한 줄 소개를 여기에 작성해주세요]

## 기술 스택

[사용할 기술 스택을 여기에 작성해주세요]

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 폴더 구조

```
woowa-forest/
├── CLAUDE.md              # AI 컨텍스트 (Claude Code 자동 읽기)
├── HACKATHON_GUIDE.md     # 해커톤 운영 가이드
├── INTEGRATION_GUIDE.md   # 최종 통합 가이드
├── .ai/                   # AI 작업 보조 문서
│   ├── PROMPT_GUIDE.md    # 프롬프트 작성 가이드
│   ├── AI_WORKFLOW.md     # AI 협업 워크플로우
│   ├── PROJECT_CONTEXT.md # 프로젝트 컨텍스트
│   └── CODING_CONVENTIONS.md
├── workspace/             # 팀원별 독립 작업 공간
│   ├── snowshower/
│   ├── soojin/
│   ├── eian/
│   └── mychan/
├── shared/                # 공유 리소스 (타입, 유틸, 공통 컴포넌트)
└── integration/           # 최종 통합 결과물
```

## 작업 흐름

1. 각자 `workspace/{본인 닉네임}/` 폴더에서 독립적으로 개발
2. 공유 타입/유틸은 `shared/`에 작성 후 PR
3. 해커톤 종료 전 `integration/`으로 통합

## 관련 문서

- [해커톤 가이드](./HACKATHON_GUIDE.md)
- [AI 프롬프트 가이드](./.ai/PROMPT_GUIDE.md)
- [AI 워크플로우](./.ai/AI_WORKFLOW.md)
- [통합 가이드](./INTEGRATION_GUIDE.md)