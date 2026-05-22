import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import type { ObjectConfig } from '@shared/types/02-map';

// ── 라벨 (Billboard 텍스트) ──────────────────────────────────
function Label({ y, text }: { y: number; text: string }) {
  return (
    <Billboard position={[0, y, 0]}>
      <Text
        fontSize={0.22}
        color="#FFF8E7"
        outlineWidth={0.018}
        outlineColor="#2D1B0E"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </Billboard>
  );
}

// ── 우물가 ────────────────────────────────────────────────────
function Well3D() {
  const bucketRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (bucketRef.current)
      bucketRef.current.position.y = 0.85 + Math.sin(clock.getElapsedTime() * 1.4) * 0.06;
  });

  return (
    <group>
      {/* 돌 기단 */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.68, 0.76, 0.6, 10]} />
        <meshToonMaterial color="#90A4AE" />
      </mesh>
      <mesh position={[0, 0.54, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.18, 10]} />
        <meshToonMaterial color="#37474F" />
      </mesh>

      {/* 나무 기둥 2개 */}
      {[-0.52, 0.52].map((x, i) => (
        <mesh key={i} position={[x, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 1.6, 7]} />
          <meshToonMaterial color="#5C3D2E" />
        </mesh>
      ))}

      {/* 가로 지붕 보 */}
      <mesh position={[0, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.065, 0.065, 1.2, 7]} />
        <meshToonMaterial color="#5C3D2E" />
      </mesh>

      {/* 삼각 지붕 */}
      <mesh position={[0, 2.14, 0]} castShadow>
        <coneGeometry args={[0.82, 0.72, 4]} />
        <meshToonMaterial color="#8B5E3C" />
      </mesh>

      {/* 두레박 (흔들림 애니메이션) */}
      <mesh ref={bucketRef} position={[0, 0.85, 0.22]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.2, 8]} />
        <meshToonMaterial color="#78909C" />
      </mesh>

      <Label y={2.9} text="🪣 우물가" />
    </group>
  );
}

// ── 게시판 ────────────────────────────────────────────────────
function BulletinBoard3D() {
  return (
    <group>
      {/* 나무 기둥 */}
      {[-0.44, 0.44].map((x, i) => (
        <mesh key={i} position={[x, 0.82, 0]} castShadow>
          <boxGeometry args={[0.12, 1.64, 0.12]} />
          <meshToonMaterial color="#5C3D2E" />
        </mesh>
      ))}

      {/* 코르크 보드 */}
      <mesh position={[0, 1.42, 0.04]} castShadow>
        <boxGeometry args={[1.08, 0.84, 0.1]} />
        <meshToonMaterial color="#C8A05E" />
      </mesh>

      {/* 종이 3장 */}
      {[
        [-0.24, 1.6,  0.1],
        [ 0.1,  1.46, 0.1],
        [-0.14, 1.3,  0.1],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.34, 0.18, 0.01]} />
          <meshToonMaterial color="#FFF8E7" />
        </mesh>
      ))}

      {/* 압정 (파랑/빨강 점) */}
      {[
        { pos: [-0.24, 1.7, 0.12] as [number,number,number], color: '#EF5350' },
        { pos: [ 0.1,  1.56, 0.12] as [number,number,number], color: '#42A5F5' },
      ].map(({ pos, color }, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.035, 7, 7]} />
          <meshToonMaterial color={color} />
        </mesh>
      ))}

      {/* 하단 가로보 */}
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[1.08, 0.12, 0.12]} />
        <meshToonMaterial color="#5C3D2E" />
      </mesh>

      <Label y={2.3} text="📋 게시판" />
    </group>
  );
}

// ── 계단 ─────────────────────────────────────────────────────
function Stair3D({ isUp, accentColor }: { isUp: boolean; accentColor: string }) {
  const steps = [
    { y: 0.08, z:  0.28, w: 1.0, color: '#CFD8DC' },
    { y: 0.24, z:  0.0,  w: 1.0, color: '#B0BEC5' },
    { y: 0.40, z: -0.28, w: 1.0, color: '#90A4AE' },
  ];
  const glowRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (glowRef.current)
      glowRef.current.intensity = 0.5 + Math.sin(clock.getElapsedTime() * 3) * 0.3;
  });

  const dir = isUp ? 1 : -1;

  return (
    <group rotation={[0, isUp ? 0 : Math.PI, 0]}>
      {steps.map((s, i) => (
        <mesh key={i} position={[0, s.y, s.z * dir]} castShadow receiveShadow>
          <boxGeometry args={[s.w, 0.18, 0.56]} />
          <meshToonMaterial color={s.color} />
        </mesh>
      ))}

      {/* 발광 포인트 라이트 */}
      <pointLight ref={glowRef} position={[0, 0.8, 0]} color={accentColor} intensity={0.5} distance={3} />

      <Billboard position={[0, 1.0, 0]}>
        <Text fontSize={0.2} color={accentColor} outlineWidth={0.015} outlineColor="#2D1B0E">
          {isUp ? '▲ 위층' : '▼ 아래층'}
        </Text>
      </Billboard>
    </group>
  );
}

// ── 마을 입구 아치 ────────────────────────────────────────────
function PortalArch3D({ label }: { label: string }) {
  const shortLabel = label.replace('🏠 ', '').replace(' 입구', '');

  return (
    <group>
      {/* 기둥 */}
      {[-0.78, 0.78].map((x, i) => (
        <mesh key={i} position={[x, 1.25, 0]} castShadow>
          <boxGeometry args={[0.22, 2.5, 0.22]} />
          <meshToonMaterial color="#5C3D2E" />
        </mesh>
      ))}

      {/* 가로 보 */}
      <mesh position={[0, 2.38, 0]} castShadow>
        <boxGeometry args={[2.0, 0.26, 0.22]} />
        <meshToonMaterial color="#5C3D2E" />
      </mesh>

      {/* 꼭대기 삼각 장식 */}
      <mesh position={[0, 2.72, 0]}>
        <coneGeometry args={[0.38, 0.48, 3]} />
        <meshToonMaterial color="#C8844A" />
      </mesh>

      {/* 현판 */}
      <mesh position={[0, 2.38, 0.14]}>
        <boxGeometry args={[1.3, 0.24, 0.06]} />
        <meshToonMaterial color="#FFF8E7" />
      </mesh>

      <Billboard position={[0, 3.3, 0]}>
        <Text fontSize={0.2} color="#2D1B0E" outlineWidth={0.01} outlineColor="#FFF8E7">
          {shortLabel}
        </Text>
      </Billboard>
    </group>
  );
}

// ── 로우폴리 나무 ──────────────────────────────────────────────
export function LowPolyTree({ position, floorColor }: { position: [number, number, number]; floorColor: string }) {
  const leafRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (leafRef.current) {
      leafRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.2) * 0.025;
    }
  });

  return (
    <group position={position}>
      {/* 줄기 */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 1.04, 6]} />
        <meshToonMaterial color="#5C3D2E" />
      </mesh>

      {/* 잎 (3단 원뿔) */}
      <group ref={leafRef}>
        <mesh position={[0, 1.7, 0]} castShadow>
          <coneGeometry args={[0.76, 1.1, 7]} />
          <meshToonMaterial color={floorColor} />
        </mesh>
        <mesh position={[0, 2.3, 0]} castShadow>
          <coneGeometry args={[0.56, 0.9, 7]} />
          <meshToonMaterial color={floorColor} />
        </mesh>
        <mesh position={[0, 2.78, 0]} castShadow>
          <coneGeometry args={[0.32, 0.7, 7]} />
          <meshToonMaterial color="#A5D6A7" />
        </mesh>
      </group>
    </group>
  );
}

// ── 장식 이모지 오브젝트 ──────────────────────────────────────
function DecoEmoji({ label }: { label: string }) {
  return (
    <Billboard position={[0, 0.8, 0]}>
      <Text fontSize={0.55} anchorX="center" anchorY="middle">
        {label}
      </Text>
    </Billboard>
  );
}

// ── 오브젝트 전체 렌더러 ─────────────────────────────────────
const PROXIMITY: Record<string, number> = {
  WELL: 4, BULLETIN: 1, STAIR_UP: 0, STAIR_DOWN: 0, PORTAL: 0,
};

interface Objects3DProps {
  objects: ObjectConfig[];
  accentColor: string;
  floorColor: string;
}

export function Objects3D({ objects, accentColor, floorColor }: Objects3DProps) {
  return (
    <>
      {objects.map(obj => {
        const x = obj.x + 0.5;
        const z = obj.y + 0.5;

        switch (obj.type) {
          case 'WELL':
            return <group key={obj.id} position={[x, 0, z]}><Well3D /></group>;
          case 'BULLETIN':
            return <group key={obj.id} position={[x, 0, z]}><BulletinBoard3D /></group>;
          case 'STAIR_UP':
            return <group key={obj.id} position={[x, 0, z]}><Stair3D isUp accentColor={accentColor} /></group>;
          case 'STAIR_DOWN':
            return <group key={obj.id} position={[x, 0, z]}><Stair3D isUp={false} accentColor={accentColor} /></group>;
          case 'PORTAL':
            return <group key={obj.id} position={[x, 0, z]}><PortalArch3D label={obj.label ?? ''} /></group>;
          case 'DECORATION':
            return <group key={obj.id} position={[x, 0, z]}><DecoEmoji label={obj.label ?? '🌿'} /></group>;
          default:
            return null;
        }
      })}
    </>
  );
}

export { PROXIMITY };
