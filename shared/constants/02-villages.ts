import type { ObjectConfig, Position } from '../types/02-map';

export const SPAWN_BY_FLOOR: Record<number, Position> = {
  11: { x: 22, y: 12 },
  12: { x: 22, y: 12 },
  13: { x: 22, y: 12 },
};

export const OBJECTS_BY_FLOOR: Record<number, ObjectConfig[]> = {
  11: [
    { id: 'well-11',       type: 'WELL',       x: 20, y: 6,  label: '🪣 우물가' },
    { id: 'bulletin-11',   type: 'BULLETIN',   x: 28, y: 6,  label: '📋 게시판' },
    { id: 'stair-up-11',   type: 'STAIR_UP',   x: 36, y: 12, label: '▲ 12층' },
    { id: 'portal-11',     type: 'PORTAL',     x: 15, y: 12, label: '🏠 구리마을 입구' },
    { id: 'deco-11a',      type: 'DECORATION', x: 5,  y: 5,  label: '🤖' },
    { id: 'deco-11b',      type: 'DECORATION', x: 8,  y: 9,  label: '🤖' },
    { id: 'deco-11c',      type: 'DECORATION', x: 11, y: 14, label: '📱' },
  ],
  12: [
    { id: 'well-12',       type: 'WELL',       x: 20, y: 6,  label: '🪣 우물가' },
    { id: 'bulletin-12',   type: 'BULLETIN',   x: 28, y: 6,  label: '📋 게시판' },
    { id: 'stair-up-12',   type: 'STAIR_UP',   x: 36, y: 10, label: '▲ 13층' },
    { id: 'stair-down-12', type: 'STAIR_DOWN', x: 36, y: 14, label: '▼ 11층' },
    { id: 'portal-12',     type: 'PORTAL',     x: 15, y: 12, label: '🏠 태초마을 입구' },
    { id: 'deco-12a',      type: 'DECORATION', x: 5,  y: 5,  label: '💻' },
    { id: 'deco-12b',      type: 'DECORATION', x: 8,  y: 9,  label: '🌳' },
    { id: 'deco-12c',      type: 'DECORATION', x: 11, y: 14, label: '🖥️' },
  ],
  13: [
    { id: 'well-13',       type: 'WELL',       x: 20, y: 6,  label: '🪣 우물가' },
    { id: 'bulletin-13',   type: 'BULLETIN',   x: 28, y: 6,  label: '📋 게시판' },
    { id: 'stair-down-13', type: 'STAIR_DOWN', x: 36, y: 12, label: '▼ 12층' },
    { id: 'portal-13',     type: 'PORTAL',     x: 15, y: 12, label: '🏠 뽀롱뽀롱마을 입구' },
    { id: 'deco-13a',      type: 'DECORATION', x: 5,  y: 5,  label: '☕' },
    { id: 'deco-13b',      type: 'DECORATION', x: 8,  y: 9,  label: '🍃' },
    { id: 'deco-13c',      type: 'DECORATION', x: 11, y: 14, label: '⚙️' },
  ],
};
