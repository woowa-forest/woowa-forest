import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { TILE } from '@shared/types/02-map';
import type { TileValue } from '@shared/types/02-map';
import { MAP_WIDTH, MAP_HEIGHT } from '@shared/constants/01-floors';
import { OBJECTS_BY_FLOOR, SPAWN_BY_FLOOR } from '@shared/constants/02-villages';
import { INTERACTION_CONFIG } from '@shared/constants/03-interaction';
import { buildTileMap, isWalkable, canOccupy, FLOOR_THEME_3D } from './03-TileMap';
import { Objects3D, PROXIMITY } from './04-Objects3D';
import { LowPolyTree } from './04-Objects3D';
import { Character3D } from './05-Character3D';
import { mapEvents } from './mapEvents';
import { useInteractionStore } from '../store/useInteractionStore';
import { useAuthStore } from '../store/useAuthStore';
import { useMultiplayer, PlayerState } from '../hooks/useMultiplayer';
import { supabase } from '../lib/supabaseClient';

// ── 힌트 텍스트 ───────────────────────────────────────────────
function hintText(type: string): string {
  switch (type) {
    case 'WELL':       return '🪣 우물가 근처 — 채팅이 가능해요!';
    case 'BULLETIN':   return '[E] 게시판 열기';
    case 'PORTAL':     return '[E] 마을 입장';
    case 'STAIR_UP':   return '▲ 위층으로 이동합니다';
    case 'STAIR_DOWN': return '▼ 아래층으로 이동합니다';
    default:           return '[E] 상호작용';
  }
}

// ── InstancedMesh 타일 렌더러 ─────────────────────────────────
const DUMMY = new THREE.Object3D();

interface TileLayerProps {
  positions: [number, number, number][];
  color: string;
  boxArgs: [number, number, number];
}

function TileLayer({ positions, color, boxArgs }: TileLayerProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    positions.forEach(([x, y, z], i) => {
      DUMMY.position.set(x, y, z);
      DUMMY.updateMatrix();
      meshRef.current!.setMatrixAt(i, DUMMY.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} castShadow receiveShadow>
      <boxGeometry args={boxArgs} />
      <meshToonMaterial color={color} />
    </instancedMesh>
  );
}

// ── 지형 (바닥 + 벽) ─────────────────────────────────────────
function Terrain({ tileMap, floorId }: { tileMap: TileValue[][]; floorId: number }) {
  const theme = FLOOR_THEME_3D[floorId] ?? FLOOR_THEME_3D[12];

  const { grassPos, pathPos, wallPos } = useMemo(() => {
    const gp: [number, number, number][] = [];
    const pp: [number, number, number][] = [];
    const wp: [number, number, number][] = [];

    for (let z = 0; z < MAP_HEIGHT; z++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = tileMap[z][x];
        const wx = x + 0.5;
        const wz = z + 0.5;
        if (tile === TILE.WALL) {
          wp.push([wx, 0.76, wz]);
        } else if (tile === TILE.DECORATABLE) {
          gp.push([wx, -0.08, wz]);
        } else {
          pp.push([wx, -0.08, wz]);
        }
      }
    }
    return { grassPos: gp, pathPos: pp, wallPos: wp };
  }, [tileMap]);

  return (
    <>
      <TileLayer positions={grassPos} color={theme.grassColor} boxArgs={[1, 0.16, 1]} />
      <TileLayer positions={pathPos}  color={theme.pathColor}  boxArgs={[1, 0.16, 1]} />
      <TileLayer positions={wallPos}  color={theme.wallColor}  boxArgs={[1, 1.52, 1]} />

      {/* 경계 바깥 대지 */}
      <mesh position={[MAP_WIDTH / 2, -0.15, MAP_HEIGHT / 2]} receiveShadow>
        <boxGeometry args={[MAP_WIDTH + 10, 0.1, MAP_HEIGHT + 10]} />
        <meshToonMaterial color={theme.grassDkColor} />
      </mesh>
    </>
  );
}

// ── 나무 배치 ────────────────────────────────────────────────
const TREE_POSITIONS: [number, number, number][] = [
  [2, 0, 3], [5, 0, 2], [9, 0, 4], [3, 0, 8], [7, 0, 11],
  [11, 0, 3], [4, 0, 16], [10, 0, 18], [2, 0, 20], [6, 0, 22],
  [12, 0, 8], [13, 0, 20],
];

// ── 카메라 리그 ──────────────────────────────────────────────
const CAM_OFFSET = new THREE.Vector3(14, 14, 14);
const CAM_TARGET = new THREE.Vector3();

function CameraRig({ posRef }: { posRef: React.RefObject<{ x: number; z: number }> }) {
  const { camera } = useThree();

  useFrame(() => {
    if (!posRef.current) return;
    const { x, z } = posRef.current;
    CAM_TARGET.set(x + CAM_OFFSET.x, CAM_OFFSET.y, z + CAM_OFFSET.z);
    camera.position.lerp(CAM_TARGET, 0.08);
    camera.lookAt(x, 0, z);
    camera.updateProjectionMatrix();
  });

  return null;
}

// ── WorldScene ────────────────────────────────────────────────
interface WorldSceneProps {
  floorId: number;
  playerName: string;
  playerField: string;
}

export function WorldScene({ floorId, playerName, playerField }: WorldSceneProps) {
  const member  = useAuthStore(s => s.member);
  const theme   = FLOOR_THEME_3D[floorId] ?? FLOOR_THEME_3D[12];
  const objects = OBJECTS_BY_FLOOR[floorId] ?? [];
  const spawn   = SPAWN_BY_FLOOR[floorId]   ?? { x: 22, y: 12 };

  const activeEmojis = useInteractionStore(s => s.activeEmojis);
  const emitEmoji    = useInteractionStore(s => s.emitEmoji);
  const addNearbyMsg = useInteractionStore(s => s.sendNearbyChat);

  // 멀티플레이어 연동
  const { players, updateState } = useMultiplayer(floorId, member?.id);

  // 실시간 브로드캐스트 수신 (이모지 & 채팅)
  useEffect(() => {
    if (!supabase || !member) return;
    const channel = supabase.channel(`floor-${floorId}-broadcast`);
    channel
      .on('broadcast', { event: 'emoji' }, ({ payload }) => {
        if (payload.memberId !== member.id) {
          emitEmoji(payload.memberId, payload.emoji);
        }
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        if (payload.senderId !== member.id) {
          // 로컬 스토어에 추가하여 화면에 표시
          addNearbyMsg(payload.roomId, payload.senderId, payload.senderName, payload.content);
        }
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [floorId, member, emitEmoji, addNearbyMsg]);

  const tileMap        = useMemo(() => buildTileMap(floorId), [floorId]);
  const posRef         = useRef({ x: spawn.x + 0.5, z: spawn.y + 0.5 });
  const facingRef      = useRef(0);
  const isMovingRef    = useRef(false);
  const keysRef        = useRef(new Set<string>());
  const prevNearRef    = useRef<string | null>(null);
  const nearDataRef    = useRef<{ type: string; id?: string } | null>(null);
  const stairCooldown  = useRef(false);

  // 상호작용 핸들러 (항상 최신 참조 유지)
  const interactRef = useRef(() => {});
  interactRef.current = () => {
    const near = nearDataRef.current;
    if (!near) return;

    if (near.type === 'CHARACTER' && near.id) {
      mapEvents.emit('INTERACT_CHARACTER', { memberId: near.id });
    } else if (near.type === 'BULLETIN') {
      mapEvents.emit('INTERACT_BULLETIN');
    } else if (near.type === 'PORTAL') {
      mapEvents.emit('INTERACT_PORTAL', { floorId });
    }
  };

  // 키보드 이벤트
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const blockedDefault = [
        'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
        'KeyW','KeyA','KeyS','KeyD','KeyE','Space',
      ];
      if (blockedDefault.includes(e.code)) e.preventDefault();
      keysRef.current.add(e.code);
      if (e.code === 'KeyE') interactRef.current();
    };
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // 게임 루프
  useFrame((_state, delta) => {
    const keys = keysRef.current;
    const SPEED = 5;
    let dx = 0, dz = 0;

    if (keys.has('ArrowLeft')  || keys.has('KeyA')) dx -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;
    if (keys.has('ArrowUp')    || keys.has('KeyW')) dz -= 1;
    if (keys.has('ArrowDown')  || keys.has('KeyS')) dz += 1;

    // 대각선 정규화
    if (dx !== 0 && dz !== 0) { dx *= 0.707; dz *= 0.707; }

    const moving = dx !== 0 || dz !== 0;
    isMovingRef.current = moving;

    if (moving) {
      // 이동 방향에 따라 캐릭터 회전
      facingRef.current = Math.atan2(dx, dz);

      const step = SPEED * Math.min(delta, 0.05);
      const { x: cx, z: cz } = posRef.current;
      const nx = cx + dx * step;
      const nz = cz + dz * step;

      if (canOccupy(tileMap, nx, cz)) posRef.current.x = nx;
      if (canOccupy(tileMap, posRef.current.x, nz)) posRef.current.z = nz;

      // 위치 동기화 전송 (Supabase Presence)
      if (member) {
        updateState({
          memberId: member.id,
          name:     playerName,
          field:    playerField,
          x:        posRef.current.x,
          z:        posRef.current.z,
          facing:   facingRef.current,
        });
      }
    }

    // ── 계단 자동 이동 ────────────────────────────────────────
    if (!stairCooldown.current) {
      const tx = Math.floor(posRef.current.x);
      const tz = Math.floor(posRef.current.z);
      for (const obj of objects) {
        if (obj.type !== 'STAIR_UP' && obj.type !== 'STAIR_DOWN') continue;
        if (obj.x === tx && obj.y === tz) {
          const toFloor = obj.type === 'STAIR_UP' ? floorId + 1 : floorId - 1;
          if (toFloor >= 11 && toFloor <= 13) {
            stairCooldown.current = true;
            mapEvents.emit('FLOOR_CHANGED', { toFloor });
          }
          break;
        }
      }
    }

    // ── 근접 감지 ──────────────────────────────────────────────
    const { x: tx, z: tz } = posRef.current;
    const itx = Math.floor(tx);
    const itz = Math.floor(tz);
    let nearObj = null;
    let minDist = Infinity;

    // 1. 캐릭터 감지 우선
    const otherPlayers = Object.values(players);
    let nearChar = null;
    for (const char of otherPlayers) {
      const dist = Math.sqrt((tx - char.x) ** 2 + (tz - char.z) ** 2);
      if (dist <= INTERACTION_CONFIG.CHARACTER_INTERACT_RADIUS) {
        nearChar = { id: char.memberId, name: char.name };
        break;
      }
    }

    // 2. 오브젝트 감지
    for (const obj of objects) {
      const radius = PROXIMITY[obj.type] ?? -1;
      if (radius < 0) continue;
      const dist = Math.max(Math.abs(itx - obj.x), Math.abs(itz - obj.y));
      if (dist <= radius && dist < minDist) {
        nearObj = obj;
        minDist = dist;
      }
    }

    const nearType = nearChar ? 'CHARACTER' : (nearObj?.type ?? null);
    if (nearType !== prevNearRef.current) {
      if (prevNearRef.current === 'WELL') mapEvents.emit('LEAVE_WELL');
      if (nearType === 'WELL')            mapEvents.emit('NEAR_WELL');

      if (nearChar) {
        nearDataRef.current = { type: 'CHARACTER', id: nearChar.id };
        mapEvents.emit('NEAR_OBJECT', { type: 'CHARACTER', label: `[E] ${nearChar.name} 프로필` });
      } else if (nearObj && nearType !== 'DECORATION') {
        nearDataRef.current = { type: nearObj.type };
        mapEvents.emit('NEAR_OBJECT', { type: nearObj.type, label: hintText(nearObj.type) });
      } else {
        nearDataRef.current = null;
        mapEvents.emit('LEAVE_OBJECT');
      }

      prevNearRef.current = nearType;
    }
  });

  return (
    <>
      {/* 배경색 + 안개 */}
      <color attach="background" args={[theme.fogColor]} />
      <fog attach="fog" args={[theme.fogColor, 40, 90]} />

      {/* 조명 */}
      <ambientLight intensity={0.45} color="#FFF8E7" />
      <hemisphereLight args={[theme.fogColor, theme.grassDkColor, 0.55]} />
      <directionalLight
        position={[12, 20, 12]}
        intensity={1.6}
        color={theme.sunColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* 지형 */}
      <Terrain tileMap={tileMap} floorId={floorId} />

      {/* 나무 */}
      {TREE_POSITIONS.map((pos, i) => (
        <LowPolyTree key={i} position={pos} floorColor={theme.grassColor} />
      ))}

      {/* 오브젝트 */}
      <Objects3D objects={objects} accentColor={theme.accentColor} floorColor={theme.grassColor} />

      {/* 소프트 그림자 */}
      <ContactShadows
        position={[MAP_WIDTH / 2, 0.01, MAP_HEIGHT / 2]}
        opacity={0.3}
        scale={60}
        blur={2}
        far={1}
        color="#2D1B0E"
      />

      {/* 캐릭터 */}
      <Character3D
        posRef={posRef}
        isMovingRef={isMovingRef}
        facingRef={facingRef}
        name={playerName}
        field={playerField}
        emoji={activeEmojis.find(e => e.memberId === member?.id)?.emoji || undefined}
      />

      {/* 다른 크루들 (Supabase에서 받아온 실시간 플레이어들) */}
      {Object.values(players).map((p) => (
        <Character3D
          key={p.memberId}
          posRef={{ current: { x: p.x, z: p.z } } as any}
          isMovingRef={{ current: false } as any}
          facingRef={{ current: p.facing } as any}
          name={p.name}
          field={p.field}
          emoji={activeEmojis.find(e => e.memberId === p.memberId)?.emoji || undefined}
        />
      ))}

      {/* 카메라 */}
      <CameraRig posRef={posRef} />
    </>
  );
}
