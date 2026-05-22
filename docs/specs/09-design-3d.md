# 09. 3D 디자인 명세서 (Three.js / React Three Fiber)

> **컨셉**: 동물의 숲 New Horizons + 포켓몬 소드·실드 필드 오버월드를 참고한  
> **로우폴리 아이소메트릭 3D 마을**. 따뜻하고 아늑한 우테코 캠프 분위기.  
> 2D 픽셀 느낌은 내려놓고, **셀 셰이딩(Toon Shading) + 아웃라인** 으로  
> 만화 같은 귀여운 3D 세계를 만든다.

---

## 1. 레퍼런스 & 시각 방향

| 참고 작품 | 차용 요소 |
|---|---|
| Animal Crossing: New Horizons | 아이소메트릭 카메라, 둥글둥글 로우폴리 나무/건물, 따뜻한 색감 |
| 포켓몬 소드·실드 오버월드 | 셀 셰이딩, 아웃라인, 마을 레이아웃, NPC 말풍선 |
| A Short Hike | 로우폴리 + 부드러운 패스텔 색감 |
| Townscaper | 단순 기하도형 조합으로 귀여운 건물 표현 |

### 핵심 시각 키워드
- **Low-poly**: 삼각형 면이 보이는 단순한 기하도형 세계
- **Toon Shading**: 그라데이션 없이 2~3단계 명암으로 만화 느낌
- **Warm Outline**: 검정 대신 짙은 갈색 아웃라인으로 부드럽게
- **Soft Shadow**: 흐릿한 그림자로 아늑함

---

## 2. 기술 스택

```bash
npm install three @react-three/fiber @react-three/drei
npm install @react-three/postprocessing          # 아웃라인 · 블룸 이펙트
npm install @react-spring/three                  # 3D 스프링 애니메이션
```

| 라이브러리 | 역할 |
|---|---|
| `three` | 3D 엔진 코어 |
| `@react-three/fiber` (R3F) | React + Three.js 통합 (`<Canvas>`) |
| `@react-three/drei` | OrthographicCamera, Text, Environment, Shadow 등 헬퍼 |
| `@react-three/postprocessing` | Outline (아웃라인), Bloom (발광) 포스트 이펙트 |
| `@react-spring/three` | 캐릭터·오브젝트 스프링 애니메이션 |
| `framer-motion` | React DOM UI 애니메이션 (현행 유지) |

---

## 3. 카메라 설정

### 아이소메트릭 직교 카메라 (Orthographic)

```
시점: 약 35° 위에서 내려다보는 등각 투영
회전: 고정 (사용자가 회전 불가) → ACNH 스타일
따라가기: 플레이어 뒤를 부드럽게 lerp 추적
```

```tsx
// @react-three/drei의 OrthographicCamera 사용
<OrthographicCamera
  makeDefault
  position={[20, 20, 20]}   // 45° 대각선 위치
  zoom={32}                  // 줌 레벨 (타일 크기 기준)
  near={0.1}
  far={200}
/>
```

### 카메라 위치 계산
```
플레이어 위치 (px, py, pz) 기준:
  카메라 위치 = (px + 20, py + 20, pz + 20)
  카메라 LookAt = (px, py, pz)
  
→ 플레이어가 항상 화면 중앙 약간 아래에 위치
```

---

## 4. 색상 팔레트 (3D 머티리얼용)

### 공통 팔레트

| 역할 | 색상명 | HEX | 머티리얼 적용 |
|---|---|---|---|
| 잔디 | Sage Green | `#A8C78A` | 바닥 Plane |
| 잔디 (어두운 면) | Forest Green | `#7EA85F` | 바닥 Toon 2단계 |
| 흙길 | Sandy Path | `#D4B896` | 길 Plane |
| 나무 기둥 | Dark Oak | `#5C3D2E` | 건물/기둥 |
| 나무 (밝음) | Honey Wood | `#C8844A` | 건물 밝은 면 |
| 돌 | Slate | `#90A4AE` | 벽·계단 |
| 하늘 | Soft Sky | `#C9E8F5` | 배경색 / Fog |
| 크림 | Cream | `#FFF8E7` | UI |
| 텍스트 | Ink | `#2D1B0E` | 아웃라인 |

### 층별 테마색

| 층 | 잔디색 | 악센트 | 하늘 Fog | 태양광 |
|---|---|---|---|---|
| 11F 구리마을 (Android) | `#8BC34A` (밝은 초록) | `#FFEB3B` | `#E8F5E9` | `#FFF9C4` |
| 12F 태초마을 (Frontend) | `#A8C78A` (세이지) | `#90CAF9` | `#E3F2FD` | `#FFF8E7` |
| 13F 뽀롱뽀롱마을 (Backend) | `#C8A878` (모래) | `#FFB300` | `#FFF3E0` | `#FFE0B2` |

---

## 5. 셰이딩 / 머티리얼 시스템

### MeshToonMaterial (셀 셰이딩)

```tsx
// Three.js 내장 Toon 셰이딩 – 명암이 2~3단계로 양자화됨
<mesh>
  <boxGeometry />
  <meshToonMaterial color="#A8C78A" />
</mesh>
```

```tsx
// 그라데이션 맵: 명암 단계를 2단으로 제한 (만화 느낌 강조)
const gradientMap = useMemo(() => {
  const colors = new Uint8Array([80, 200]);           // 어두움 / 밝음 2단계
  const texture = new THREE.DataTexture(colors, 2, 1, THREE.RedFormat);
  texture.needsUpdate = true;
  return texture;
}, []);

<meshToonMaterial color="#A8C78A" gradientMap={gradientMap} />
```

### 아웃라인 이펙트

```tsx
// @react-three/postprocessing의 Outline
import { EffectComposer, Outline } from '@react-three/postprocessing';

<EffectComposer>
  <Outline
    color={0x2D1B0E}       // 짙은 갈색 아웃라인 (검정보다 따뜻함)
    edgeStrength={3}
    width={1.5}
  />
</EffectComposer>
```

---

## 6. 조명 설정

```tsx
// 따뜻한 낮 분위기 조명
<>
  {/* 태양광 – 따뜻한 노란 빛, 그림자 생성 */}
  <directionalLight
    position={[10, 20, 10]}
    intensity={1.8}
    color="#FFF5C8"
    castShadow
    shadow-mapSize={[2048, 2048]}
    shadow-camera-near={0.5}
    shadow-camera-far={80}
    shadow-camera-left={-30}
    shadow-camera-right={30}
    shadow-camera-top={30}
    shadow-camera-bottom={-30}
  />

  {/* 하늘빛 채우기 – 파란 쪽 그림자 완화 */}
  <hemisphereLight
    skyColor="#C9E8F5"
    groundColor="#8B6444"
    intensity={0.6}
  />

  {/* 환경광 */}
  <ambientLight intensity={0.3} color="#FFF8E7" />
</>
```

### 안개 (Fog) – 층별 하늘색 분위기

```tsx
// R3F 씬에서 배경 + 안개 설정
<Canvas>
  <color attach="background" args={['#E3F2FD']} />   {/* 12F 태초마을 */}
  <fog attach="fog" args={['#E3F2FD', 30, 80]} />
</Canvas>
```

---

## 7. 지형 & 바닥

### 바닥 타일 구조

```
각 타일 = 1×1 단위 (Three.js 단위계)
맵 전체 = 40×25 타일 = 40×25 단위

바닥: BoxGeometry(1, 0.2, 1) 를 그리드로 배치
      → 약간의 높이감으로 그림자 경계 생성

잔디 타일: MeshToonMaterial(#A8C78A)
흙길 타일: MeshToonMaterial(#D4B896)
벽 타일:   BoxGeometry(1, 1.5, 1) MeshToonMaterial(#5C3D2E)
```

### 지형 요소

```tsx
// 경계 언덕 – 맵 가장자리를 감싸는 녹색 언덕
// SphereGeometry를 절반 자른 형태로 부드러운 경계
<mesh position={[0, -0.3, -12]}>
  <cylinderGeometry args={[18, 20, 2, 8]} />
  <meshToonMaterial color="#7EA85F" />
</mesh>

// 나무 – 로우폴리 침엽수
function LowPolyTree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>                  {/* 줄기 */}
        <cylinderGeometry args={[0.1, 0.15, 1, 6]} />
        <meshToonMaterial color="#5C3D2E" />
      </mesh>
      <mesh position={[0, 1.8, 0]}>                  {/* 잎 (원뿔 3단) */}
        <coneGeometry args={[0.8, 1.2, 7]} />
        <meshToonMaterial color="#4CAF50" />
      </mesh>
      <mesh position={[0, 2.4, 0]}>
        <coneGeometry args={[0.6, 1.0, 7]} />
        <meshToonMaterial color="#66BB6A" />
      </mesh>
      <mesh position={[0, 2.9, 0]}>
        <coneGeometry args={[0.35, 0.8, 7]} />
        <meshToonMaterial color="#81C784" />
      </mesh>
    </group>
  );
}
```

---

## 8. 캐릭터 디자인 (3D)

### 기본 비율 (동물의 숲 풍)

```
전체 높이 약 2 유닛

  [  ●  ]    SphereGeometry(r=0.45)  – 머리 (크고 귀여운 비율)
  [ ■■■ ]    BoxGeometry(0.5, 0.55, 0.3)  – 몸통 (상의 색)
  [■] [■]    CylinderGeometry(r=0.1, h=0.5)  – 다리 2개
```

```tsx
function Character({ position, name, field, color }) {
  const shirtColor = FIELD_COLORS[field];

  return (
    <group position={position}>
      {/* 그림자 */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.15} />
      </mesh>

      {/* 다리 */}
      <mesh position={[-0.14, 0.28, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.55, 8]} />
        <meshToonMaterial color="#4A3030" />
      </mesh>
      <mesh position={[0.14, 0.28, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.55, 8]} />
        <meshToonMaterial color="#4A3030" />
      </mesh>

      {/* 몸통 */}
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[0.52, 0.55, 0.32]} />
        <meshToonMaterial color={shirtColor} />
      </mesh>

      {/* 머리 */}
      <mesh position={[0, 1.32, 0]}>
        <sphereGeometry args={[0.44, 12, 12]} />
        <meshToonMaterial color="#FFD5A8" />   {/* 피부색 */}
      </mesh>

      {/* 눈 (작은 검정 구) */}
      <mesh position={[-0.14, 1.36, 0.38]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color="#2D1B0E" />
      </mesh>
      <mesh position={[0.14, 1.36, 0.38]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color="#2D1B0E" />
      </mesh>

      {/* 이름 말풍선 – @react-three/drei Text */}
      <Billboard position={[0, 2.0, 0]}>
        <Text
          fontSize={0.22}
          color="#2D1B0E"
          font="/fonts/DotGothic16-Regular.ttf"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#FFF8E7"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  );
}
```

### 분야별 상의 색

```ts
const FIELD_COLORS = {
  AN:    '#4CAF50',   // Android – 초록
  FE:    '#42A5F5',   // Frontend – 파랑
  BE:    '#FF8F00',   // Backend – 주황
  COACH: '#9C27B0',   // Coach – 보라
};
```

### 걷기 애니메이션

```tsx
// useFrame으로 다리 앞뒤 교대 흔들기
useFrame(({ clock }) => {
  if (isMoving) {
    const t = clock.getElapsedTime();
    leftLegRef.current.rotation.x  =  Math.sin(t * 8) * 0.4;
    rightLegRef.current.rotation.x = -Math.sin(t * 8) * 0.4;
    // 몸통 좌우 살짝 흔들기
    bodyRef.current.rotation.z = Math.sin(t * 8) * 0.04;
  }
});
```

---

## 9. 오브젝트 3D 디자인

### 우물가 (Well)

```tsx
function Well3D({ position }) {
  return (
    <group position={position}>
      {/* 돌 기단 */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 0.6, 12]} />
        <meshToonMaterial color="#90A4AE" />
      </mesh>
      {/* 안쪽 어두운 원통 (우물 속) */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.3, 12]} />
        <meshToonMaterial color="#37474F" />
      </mesh>
      {/* 나무 기둥 2개 */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 1.0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1.4, 8]} />
          <meshToonMaterial color="#5C3D2E" />
        </mesh>
      ))}
      {/* 가로 지붕 보 */}
      <mesh position={[0, 1.6, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.06, 0.06, 1.3, 8]} />
        <meshToonMaterial color="#5C3D2E" />
      </mesh>
      {/* 삼각 지붕 (ConeGeometry) */}
      <mesh position={[0, 2.0, 0]}>
        <coneGeometry args={[0.85, 0.7, 4]} />
        <meshToonMaterial color="#8B5E3C" />
      </mesh>
      {/* 두레박 */}
      <mesh position={[0, 0.9, 0.2]}>
        <cylinderGeometry args={[0.1, 0.08, 0.2, 8]} />
        <meshToonMaterial color="#90A4AE" />
      </mesh>
      {/* 라벨 */}
      <Billboard position={[0, 2.8, 0]}>
        <Text fontSize={0.2} color="#FFF8E7" outlineWidth={0.01} outlineColor="#2D1B0E">
          🪣 우물가
        </Text>
      </Billboard>
    </group>
  );
}
```

### 게시판 (Bulletin Board)

```tsx
function BulletinBoard3D({ position }) {
  return (
    <group position={position}>
      {/* 나무 기둥 2개 */}
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.8, 0]}>
          <boxGeometry args={[0.12, 1.6, 0.12]} />
          <meshToonMaterial color="#5C3D2E" />
        </mesh>
      ))}
      {/* 코르크 보드 */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[1.1, 0.85, 0.08]} />
        <meshToonMaterial color="#C8A05E" />
      </mesh>
      {/* 종이 3장 */}
      {[[-0.25, 1.58], [0.1, 1.45], [-0.15, 1.3]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.05]}>
          <boxGeometry args={[0.35, 0.18, 0.01]} />
          <meshToonMaterial color="#FFF8E7" />
        </mesh>
      ))}
      {/* 받침 가로보 */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.1, 0.12, 0.12]} />
        <meshToonMaterial color="#5C3D2E" />
      </mesh>
    </group>
  );
}
```

### 계단 (Stair)

```tsx
function Stair3D({ position, direction }) {  // direction: 'up' | 'down'
  const steps = [
    { y: 0.1, z: 0.3,  w: 1.0 },
    { y: 0.3, z: 0.0,  w: 1.0 },
    { y: 0.5, z: -0.3, w: 1.0 },
  ];
  return (
    <group position={position} rotation={[0, direction === 'down' ? Math.PI : 0, 0]}>
      {steps.map((s, i) => (
        <mesh key={i} position={[0, s.y, s.z]}>
          <boxGeometry args={[s.w, 0.2, 0.6]} />
          <meshToonMaterial color={i === 2 ? '#B0BEC5' : '#CFD8DC'} />
        </mesh>
      ))}
      {/* 발광 테두리 효과 → 포스트 이펙트 Outline으로 표현 */}
      <Billboard position={[0, 1.0, 0]}>
        <Text fontSize={0.18} color="#FFF8E7" outlineWidth={0.01} outlineColor="#2D1B0E">
          {direction === 'up' ? '▲ 위층' : '▼ 아래층'}
        </Text>
      </Billboard>
    </group>
  );
}
```

### 마을 입구 아치

```tsx
function PortalArch3D({ position, label }) {
  return (
    <group position={position}>
      {/* 기둥 두 개 */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0]}>
          <boxGeometry args={[0.22, 2.4, 0.22]} />
          <meshToonMaterial color="#5C3D2E" />
        </mesh>
      ))}
      {/* 가로 보 */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[2.0, 0.25, 0.22]} />
        <meshToonMaterial color="#5C3D2E" />
      </mesh>
      {/* 삼각형 꼭대기 장식 */}
      <mesh position={[0, 2.55, 0]}>
        <coneGeometry args={[0.4, 0.5, 3]} />
        <meshToonMaterial color="#C8844A" />
      </mesh>
      {/* 현판 */}
      <mesh position={[0, 2.22, 0.12]}>
        <boxGeometry args={[1.2, 0.22, 0.06]} />
        <meshToonMaterial color="#FFF8E7" />
      </mesh>
      <Billboard position={[0, 3.2, 0]}>
        <Text fontSize={0.2} color="#2D1B0E" font="/fonts/DotGothic16-Regular.ttf">
          {label}
        </Text>
      </Billboard>
    </group>
  );
}
```

---

## 10. 맵 씬 구조

```tsx
// 전체 씬 구조 (R3F Canvas 내부)
export function WorldScene({ floorId }) {
  return (
    <>
      {/* 조명 */}
      <Lighting floorId={floorId} />

      {/* 지형 */}
      <FloorTiles floorId={floorId} />
      <WallTiles floorId={floorId} />
      <Trees floorId={floorId} />

      {/* 오브젝트 */}
      <Well3D position={[20, 0, 6]} />
      <BulletinBoard3D position={[28, 0, 6]} />
      <Stair3D position={[36, 0, 8]} direction="up" />
      <Stair3D position={[36, 0, 12]} direction="down" />
      <PortalArch3D position={[15, 0, 12]} label="태초마을" />

      {/* 캐릭터 */}
      <Character name="mychan" field="FE" position={playerPos} />

      {/* 카메라 */}
      <IsometricCamera target={playerPos} />

      {/* 포스트 이펙트 */}
      <EffectComposer>
        <Outline color={0x2D1B0E} edgeStrength={3} width={1.5} />
      </EffectComposer>
    </>
  );
}
```

---

## 11. HUD / UI (React DOM, 3D 캔버스 위에 오버레이)

3D 씬은 `<Canvas>` 안, UI는 `<Canvas>` 바깥 React DOM으로 분리.

```tsx
<div style={{ position: 'relative', width: canvasW, height: canvasH }}>
  {/* 3D 씬 */}
  <Canvas style={{ position: 'absolute', inset: 0 }}>
    <WorldScene />
  </Canvas>

  {/* React DOM UI 오버레이 */}
  <HUD floorId={currentFloor} />
  <AnimatePresence>
    {nearWell && <ChatWindow />}
    {bulletinOpen && <BulletinModal />}
  </AnimatePresence>
</div>
```

### 층 전환 애니메이션 (포켓몬 스타일)

```tsx
// R3F + Framer Motion 혼용
// 3D 씬 위에 검정 div를 Framer로 페이드 인/아웃

<AnimatePresence>
  {transitioning && (
    <motion.div
      style={{ position:'fixed', inset:0, background:'#000', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{ fontFamily:"'DotGothic16'", fontSize: 22, color: '#FFF8E7' }}
      >
        {toFloorId}F — {FLOORS[toFloorId].name}에 입장합니다
      </motion.p>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 12. 애니메이션 가이드

| 대상 | 방법 | 스펙 |
|---|---|---|
| 캐릭터 걷기 | `useFrame` + 다리 rotation.x 사인파 | 8Hz |
| 캐릭터 이동 | `lerp(pos, target, 0.12)` 부드러운 보간 | 매 프레임 |
| 나무 바람 흔들기 | `useFrame` + 잎 rotation.z 사인파 | 1.5Hz, ±0.03rad |
| 우물 두레박 흔들기 | `useFrame` + position.y 사인파 | 0.8Hz |
| 계단 발광 | `PointLight` intensity 펄스 | 1Hz |
| 이모지 플로팅 | `@react-spring/three` useSpring | y +2, opacity 0→1→0 |
| 층 전환 | Framer Motion 오버레이 페이드 | 300ms |
| 오브젝트 호버 | `onPointerEnter` → scale 1.05 spring | 200ms |
| 캐릭터 스폰 | y위에서 떨어지며 bounce | `@react-spring/three` |

---

## 13. 성능 고려사항

```tsx
// 1. instanced mesh로 바닥 타일 1000개를 drawcall 1번에
<InstancedMesh ref={ref} args={[geometry, material, 1000]}>

// 2. 나무 등 반복 오브젝트도 instancing
<Instances limit={50}>
  {treePositions.map((pos, i) => (
    <Instance key={i} position={pos} />
  ))}
</Instances>

// 3. 불필요한 오브젝트 frustum culling 자동 적용 (Three.js 기본)

// 4. 그림자: 플레이어 주변 일정 범위만 dynamic shadow
//    나머지는 baked shadow (바닥에 원형 텍스처)

// 5. 텍스처 없이 MeshToonMaterial 색상만 → GPU 메모리 절약
```

---

## 14. 구현 우선순위 (해커톤 당일)

| 우선순위 | 항목 | 예상 시간 |
|---|---|---|
| 🔴 필수 | R3F Canvas + 아이소메트릭 카메라 설정 | 30분 |
| 🔴 필수 | 바닥 타일 그리드 (잔디 + 흙길) | 30분 |
| 🔴 필수 | 3D 캐릭터 + WASD 이동 | 1시간 |
| 🔴 필수 | 우물가·게시판·계단 오브젝트 | 1시간 |
| 🟡 권장 | Toon 셰이딩 + 아웃라인 이펙트 | 30분 |
| 🟡 권장 | 나무 배치 + 언덕 경계 | 30분 |
| 🟡 권장 | 층 전환 애니메이션 | 20분 |
| 🟢 여유 | 걷기 애니메이션 (다리 흔들기) | 30분 |
| 🟢 여유 | 조명 + Fog 층별 분위기 | 20분 |
| ⚪ 이후 | 포스트 이펙트 (Outline, Bloom) | - |
| ⚪ 이후 | 이모지 플로팅 애니메이션 | - |
