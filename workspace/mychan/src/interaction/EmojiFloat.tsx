import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  emoji: string;
}

export function EmojiFloat({ emoji }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    
    // Float up and fade out animation
    groupRef.current.position.y = 2.4 + Math.sin(t * 2) * 0.05 + (t % 2) * 0.2;
    groupRef.current.scale.setScalar(1 + Math.sin(t * 8) * 0.1);
  });

  return (
    <Billboard ref={groupRef} position={[0, 2.4, 0]}>
      <Text
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
      >
        {emoji}
      </Text>
    </Billboard>
  );
}
