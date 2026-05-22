import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';

import { EmojiFloat } from '../interaction/EmojiFloat';

const FIELD_COLORS: Record<string, string> = {
  AN:    '#4CAF50',
  FE:    '#42A5F5',
  BE:    '#FF8F00',
  COACH: '#9C27B0',
};

interface Character3DProps {
  posRef: React.RefObject<{ x: number; z: number }>;
  isMovingRef: React.RefObject<boolean>;
  facingRef: React.RefObject<number>; // rotation Y in radians
  name: string;
  field: string;
  emoji?: string | null;
}

export function Character3D({ posRef, isMovingRef, facingRef, name, field, emoji }: Character3DProps) {
  const groupRef    = useRef<THREE.Group>(null);
  const leftLegRef  = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const bodyRef     = useRef<THREE.Group>(null);

  const shirtColor = FIELD_COLORS[field] ?? '#42A5F5';

  useFrame(({ clock }) => {
    if (!groupRef.current || !posRef.current) return;

    // 위치 갱신
    groupRef.current.position.x = posRef.current.x;
    groupRef.current.position.z = posRef.current.z;

    // 이동 방향으로 회전
    if (facingRef.current != null) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        facingRef.current,
        0.18
      );
    }

    // 걷기 애니메이션
    const t = clock.getElapsedTime();
    if (isMovingRef.current) {
      const swing = Math.sin(t * 10) * 0.48;
      if (leftLegRef.current)  leftLegRef.current.rotation.x  =  swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (bodyRef.current)     bodyRef.current.rotation.z = Math.sin(t * 10) * 0.03;
    } else {
      // 정지 시 숨쉬기
      if (leftLegRef.current)  leftLegRef.current.rotation.x  = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (bodyRef.current)     bodyRef.current.rotation.z = Math.sin(t * 1.4) * 0.012;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 바닥 그림자 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.38, 14]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.14} />
      </mesh>

      <group ref={bodyRef}>
        {/* 다리 — 원통 2개 */}
        <mesh ref={leftLegRef} position={[-0.13, 0.27, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.085, 0.54, 7]} />
          <meshToonMaterial color="#4A3030" />
        </mesh>
        <mesh ref={rightLegRef} position={[0.13, 0.27, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.085, 0.54, 7]} />
          <meshToonMaterial color="#4A3030" />
        </mesh>

        {/* 몸통 (상의) */}
        <mesh position={[0, 0.77, 0]} castShadow>
          <boxGeometry args={[0.50, 0.54, 0.30]} />
          <meshToonMaterial color={shirtColor} />
        </mesh>

        {/* 머리 — 크고 귀여운 구 */}
        <mesh position={[0, 1.30, 0]} castShadow>
          <sphereGeometry args={[0.42, 12, 12]} />
          <meshToonMaterial color="#FFD5A8" />
        </mesh>

        {/* 눈 — 작은 검정 구 */}
        <mesh position={[-0.13, 1.34, 0.36]}>
          <sphereGeometry args={[0.052, 8, 8]} />
          <meshBasicMaterial color="#2D1B0E" />
        </mesh>
        <mesh position={[0.13, 1.34, 0.36]}>
          <sphereGeometry args={[0.052, 8, 8]} />
          <meshBasicMaterial color="#2D1B0E" />
        </mesh>

        {/* 코 */}
        <mesh position={[0, 1.27, 0.41]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshBasicMaterial color="#C49A6C" />
        </mesh>
      </group>

      {/* 이름 말풍선 */}
      <Billboard position={[0, 2.08, 0]}>
        <Text
          fontSize={0.2}
          color="#2D1B0E"
          outlineWidth={0.014}
          outlineColor="#FFF8E7"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </Billboard>

      {/* 이모지 반응 */}
      {emoji && <EmojiFloat emoji={emoji} />}
    </group>
  );
}
