import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { FloorScene } from './02-FloorScene';
import { mapEvents } from './mapEvents';
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, DEFAULT_FLOOR, FLOORS } from '@shared/constants/01-floors';

interface MapRendererProps {
  playerName?: string;
  playerField?: string;
  onNearWell?: () => void;
  onLeaveWell?: () => void;
  onInteractBulletin?: () => void;
  onFloorChange?: (toFloor: number) => void;
}

export function MapRenderer({
  playerName  = 'you',
  playerField = 'FE',
  onNearWell,
  onLeaveWell,
  onInteractBulletin,
  onFloorChange,
}: MapRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef      = useRef<Phaser.Game | null>(null);
  const [currentFloor, setCurrentFloor] = useState(DEFAULT_FLOOR);

  // Phaser 초기화 (마운트 1회)
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width:  MAP_WIDTH  * TILE_SIZE,
      height: MAP_HEIGHT * TILE_SIZE,
      parent: containerRef.current,
      backgroundColor: '#c9e8f5',
      scene: [FloorScene],
      scale: { mode: Phaser.Scale.NONE },
      callbacks: {
        preBoot: (g) => {
          g.registry.set('playerName', playerName);
          g.registry.set('field',      playerField);
        },
      },
    });
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    gameRef.current?.registry.set('playerName', playerName);
    gameRef.current?.registry.set('field',      playerField);
  }, [playerName, playerField]);

  // 맵 이벤트 구독
  useEffect(() => {
    const unsubs = [
      mapEvents.on('NEAR_WELL',         () => onNearWell?.()),
      mapEvents.on('LEAVE_WELL',        () => onLeaveWell?.()),
      mapEvents.on('INTERACT_BULLETIN', () => onInteractBulletin?.()),
      mapEvents.on('FLOOR_CHANGED',     ({ toFloor }) => {
        setCurrentFloor(toFloor);
        onFloorChange?.(toFloor);
      }),
    ];
    return () => unsubs.forEach(fn => fn());
  }, [onNearWell, onLeaveWell, onInteractBulletin, onFloorChange]);

  const floor  = FLOORS[currentFloor];
  const canvasW = MAP_WIDTH  * TILE_SIZE;
  const canvasH = MAP_HEIGHT * TILE_SIZE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

      {/* 상단 타이틀 */}
      <h1 style={{
        fontFamily: "'DotGothic16', monospace",
        fontSize: 22,
        color: '#FFF8E7',
        letterSpacing: 3,
        textShadow: '0 2px 8px #0008',
      }}>
        🌿 우아한 숲
      </h1>

      {/* Phaser 캔버스 래퍼 */}
      <div style={{ position: 'relative' }}>
        <div
          ref={containerRef}
          tabIndex={0}
          onClick={() => {
            const canvas = containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
            canvas?.focus();
          }}
          style={{
            width:  canvasW,
            height: canvasH,
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: `0 0 0 3px ${floor?.themeHex ?? '#888'}, 0 8px 32px #0006`,
            outline: 'none',
            cursor: 'pointer',
          }}
        />

        {/* React 층 배지 (Phaser HUD 위에 추가 표시용, 실제 HUD는 Phaser 내부에서 그림) */}
      </div>

      {/* 층 이동 인디케이터 */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[11, 12, 13].map(fId => {
          const f = FLOORS[fId];
          const active = fId === currentFloor;
          return (
            <div key={fId} style={{
              background: active ? f.themeHex : '#2a2a2a',
              color: active ? '#fff' : '#666',
              border: `2px solid ${active ? f.themeHex : '#333'}`,
              borderRadius: 20,
              padding: '3px 14px',
              fontFamily: "'DotGothic16', monospace",
              fontSize: 12,
              letterSpacing: 0.5,
              transition: 'all 0.3s ease',
              boxShadow: active ? `0 2px 8px ${f.themeHex}66` : 'none',
            }}>
              {fId}F {f.name}
            </div>
          );
        })}
      </div>

    </div>
  );
}
