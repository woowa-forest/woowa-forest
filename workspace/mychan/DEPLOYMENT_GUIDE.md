# 우아한 숲 (Woowa Forest) 배포 및 Supabase 연동 가이드

현재 `woowa-forest` 프로젝트는 프론트엔드 중심(React + Three.js + Zustand)으로 로컬 스토리지에 데이터를 저장하고 있습니다. 
실제 서비스 배포를 위해 **Supabase (BaaS)**를 활용하여 DB와 실시간 멀티플레이어를 구축하고 **Vercel**을 통해 배포하는 방법을 안내합니다.

---

## 🛠️ 1. 제가 미리 작업해 둔 부분 (완료됨)

사용자님의 편의를 위해 프론트엔드 코드 내에 다음 작업을 마쳐두었습니다:

1. **Supabase SDK 설치:** `@supabase/supabase-js` 패키지를 설치했습니다.
2. **Supabase 클라이언트 세팅:** `src/lib/supabaseClient.ts` 파일을 생성하여 환경변수가 연결되면 즉시 통신이 가능하도록 구성했습니다.
3. **DB 스키마 스크립트 작성:** `supabase/schema.sql` 파일에 기존 명세서 기반의 테이블들(Members, Posts, Answers, Transactions)을 바로 생성할 수 있는 쿼리를 작성해 두었습니다.
4. **멀티플레이어 로직 (예시 훅) 추가:** `src/hooks/useMultiplayer.ts` 파일을 생성하여, Supabase의 `Presence`와 `Broadcast`를 이용해 **같은 층에 있는 사람들의 위치를 공유하고 이모지를 전송하는 로직**의 뼈대를 만들어 두었습니다.
5. **환경변수 템플릿:** `.env.example` 파일을 생성해 두었습니다.

---

## 🚀 2. 사용자님이 직접 하셔야 할 작업 (Action Items)

이제 아래의 순서대로 콘솔(웹사이트) 작업을 진행하시면 됩니다.

### 단계 1: Supabase 프로젝트 생성 및 DB 세팅
1. [Supabase](https://supabase.com/)에 접속하여 회원가입 후 **[New Project]**를 클릭합니다.
2. 프로젝트가 생성되면 왼쪽 메뉴의 **SQL Editor**로 이동합니다.
3. 제가 만들어둔 `supabase/schema.sql` 파일의 내용을 복사해서 SQL Editor에 붙여넣고 **Run** 버튼을 눌러 테이블들을 생성합니다.
4. 왼쪽 메뉴의 **Project Settings -> API** 탭으로 이동합니다.
5. `Project URL`과 `anon (public)` 키를 복사합니다.

### 단계 2: 로컬 환경 변수 설정
1. `workspace/mychan/.env.example` 파일의 이름을 `.env`로 변경합니다. (또는 `.env` 파일을 새로 만듭니다.)
2. 앞서 복사한 값들을 아래와 같이 붙여넣습니다.
   ```env
   VITE_SUPABASE_URL=여기에_Project_URL_붙여넣기
   VITE_SUPABASE_ANON_KEY=여기에_anon_key_붙여넣기
   ```
3. 프론트엔드를 재시작(`npm run dev`)하면 Supabase와 연동됩니다. (API 모킹을 실제 API로 바꾸는 작업은 이후 순차적으로 진행하시면 됩니다.)

### 단계 3: Vercel을 통한 무료 배포
1. 현재 작업하신 프로젝트를 GitHub 레포지토리에 Commit & Push 합니다.
2. [Vercel](https://vercel.com/)에 가입/로그인 후 **[Add New Project]**를 클릭합니다.
3. 방금 Push한 GitHub 레포지토리를 **Import** 합니다.
4. Framework Preset이 **Vite**로 자동 선택되었는지 확인합니다.
5. **Root Directory** 설정이 있다면 `workspace/mychan`으로 지정합니다. (설정이 안 보이면 기본값으로 둔 뒤 나중에 수정 가능합니다.)
6. **Environment Variables (환경 변수)** 섹션을 열고, 단계 2에서 만들었던 `.env` 내용 두 줄을 복사해 넣습니다.
7. **[Deploy]** 버튼을 누릅니다. 약 1~2분 뒤 자동으로 생성된 URL(`.vercel.app`)을 통해 전 세계 어디서든 접속할 수 있게 됩니다!

---

## 💡 3. 멀티플레이어(Real-time) 적용 방식 요약

제가 작성해 둔 `useMultiplayer.ts` 훅을 살펴보시면 멀티플레이어 구현 원리를 이해하실 수 있습니다.

* **위치 동기화 (Presence):** 나와 다른 캐릭터가 같은 맵(층)에 들어오면 `supabase.channel('floor-12')`에 접속하게 됩니다. 내 좌표(`x, z`)가 바뀔 때마다 `room.track()`을 호출하면, 같은 방에 있는 다른 사람들의 브라우저에서 `room.on('presence')` 이벤트가 발생하여 내 캐릭터의 3D 모델이 움직이게 됩니다.
* **이모지 및 채팅 (Broadcast):** DB에 저장할 필요 없이 잠깐 표시하고 사라지는 이벤트(이모지, 이동, 총알 발사 등)는 `room.send({ type: 'broadcast', event: 'emoji' })` 형태로 서버를 거쳐 다른 유저에게 즉시 전달됩니다.

이후 `WorldScene.tsx`의 렌더링 로직(현재는 하드코딩된 데모 캐릭터)을 `useMultiplayer` 훅에서 받아온 `players` 상태 배열을 매핑하도록 수정하시면 완전한 멀티플레이어 메타버스가 완성됩니다.
