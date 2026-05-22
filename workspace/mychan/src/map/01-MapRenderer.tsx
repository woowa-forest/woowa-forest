import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { DEFAULT_FLOOR, FLOORS } from '@shared/constants/01-floors';
import { FLOOR_THEME_3D } from './03-TileMap';
import { WorldScene } from './02-WorldScene';
import { mapEvents } from './mapEvents';

interface MapRendererProps {
  playerName?:   string;
  playerField?:  string;
  initialFloor?: number;
  onNearWell?:          () => void;
  onLeaveWell?:         () => void;
  onInteractBulletin?:  () => void;
  onFloorChange?:       (floor: number) => void;
}

export function MapRenderer({
  playerName       = 'you',
  playerField      = 'FE',
  initialFloor,
  onNearWell,
  onLeaveWell,
  onInteractBulletin,
  onFloorChange,
}: MapRendererProps) {
  const [floorId,      setFloorId]      = useState(initialFloor ?? DEFAULT_FLOOR);
  const [transitioning, setTransitioning] = useState(false);
  const [transFloorName, setTransFloorName] = useState('');
  const [hintText,     setHintText]     = useState('');

  const theme = FLOOR_THEME_3D[floorId] ?? FLOOR_THEME_3D[12];

  useEffect(() => {
    const unsubs = [
      mapEvents.on('NEAR_WELL',  () => onNearWell?.()),
      mapEvents.on('LEAVE_WELL', () => onLeaveWell?.()),
      mapEvents.on('INTERACT_BULLETIN', () => onInteractBulletin?.()),

      mapEvents.on('NEAR_OBJECT',  ({ label }) => setHintText(label)),
      mapEvents.on('LEAVE_OBJECT', ()           => setHintText('')),

      mapEvents.on('FLOOR_CHANGED', ({ toFloor }) => {
        const floor = FLOORS[toFloor];
        setTransFloorName(`${toFloor}F — ${floor?.name ?? ''}`);
        setTransitioning(true);
        setHintText('');

        setTimeout(() => {
          setFloorId(toFloor);
          onFloorChange?.(toFloor);
        }, 500);

        setTimeout(() => setTransitioning(false), 1400);
      }),
    ];
    return () => unsubs.forEach(fn => fn());
  }, [onNearWell, onLeaveWell, onInteractBulletin, onFloorChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

      {/* 타이틀 */}
      <h1 style={{
        fontFamily: "'DotGothic16', monospace",
        fontSize: 24,
        color: '#FFF8E7',
        letterSpacing: 4,
        textShadow: '0 2px 10px #0008',
        margin: 0,
      }}>
        🌿 우아한 숲
      </h1>

      {/* 3D 캔버스 + 오버레이 */}
      <div style={{ position: 'relative', width: 1280, height: 720, borderRadius: 12, overflow: 'hidden', boxShadow: `0 0 0 3px ${theme.accentColor}, 0 12px 48px #0008` }}>

        {/* R3F Canvas — orthographic 모드 */}
        <Canvas
          key={floorId}
          orthographic
          camera={{ zoom: 42, position: [14, 14, 14], near: 0.1, far: 200 }}
          shadows
          style={{ background: theme.fogColor }}
          gl={{ antialias: true, toneMapping: 0 }}
        >
          <WorldScene
            floorId={floorId}
            playerName={playerName}
            playerField={playerField}
          />
        </Canvas>

        {/* 층 배지 (HUD) */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: theme.accentColor,
          color: '#fff',
          fontFamily: "'DotGothic16', monospace",
          fontSize: 14,
          padding: '5px 18px',
          borderRadius: 20,
          boxShadow: `0 2px 12px ${theme.accentColor}88`,
          letterSpacing: 1,
        }}>
          {floorId}F　{floorId === 11 ? '구리 & 안드로이드' : floorId === 12 ? '태초 & 프론트엔드' : '뽀롱 & 둠바'}
        </div>

        {/* 조작 힌트 바 (하단 고정) */}
        <div style={{
          position: 'absolute', bottom: 10, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,248,231,0.88)',
          border: '2px solid #5C3D2E',
          borderRadius: 8,
          padding: '5px 20px',
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: 11,
          color: '#2D1B0E',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(4px)',
        }}>
          WASD / 방향키: 이동　　E: 상호작용　　계단: 자동 층이동
        </div>

        {/* 오브젝트 근접 힌트 */}
        <AnimatePresence>
          {hintText && (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute', bottom: 44, left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255,248,231,0.96)',
                border: '2.5px solid #5C3D2E',
                borderRadius: 8,
                padding: '8px 24px',
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: 13,
                color: '#2D1B0E',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px #0003',
              }}
            >
              {hintText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 층 전환 오버레이 (포켓몬 스타일) */}
        <AnimatePresence>
          {transitioning && (
            <motion.div
              key="transition"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                position: 'absolute', inset: 0,
                background: '#000',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 10, zIndex: 90,
              }}
            >
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                style={{
                  fontFamily: "'DotGothic16', monospace",
                  fontSize: 24, color: '#FFF8E7',
                  letterSpacing: 2, margin: 0,
                }}
              >
                {transFloorName}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontSize: 14, color: '#C8B89A', margin: 0,
                }}
              >
                에 입장합니다
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 층 인디케이터 */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[11, 12, 13].map(fId => {
          const f = FLOORS[fId];
          const t = FLOOR_THEME_3D[fId];
          const active = fId === floorId;
          return (
            <div key={fId} style={{
              background: active ? t.accentColor : '#2a2a2a',
              color: active ? '#fff' : '#666',
              border: `2px solid ${active ? t.accentColor : '#333'}`,
              borderRadius: 20,
              padding: '3px 14px',
              fontFamily: "'DotGothic16', monospace",
              fontSize: 12,
              letterSpacing: 0.5,
              transition: 'all 0.3s ease',
              boxShadow: active ? `0 2px 8px ${t.accentColor}88` : 'none',
            }}>
              {fId}F　{fId === 11 ? '구리 & 안드로이드' : fId === 12 ? '태초 & 프론트엔드' : '뽀롱 & 둠바'}
            </div>
          );
        })}
      </div>

    </div>
  );
}
