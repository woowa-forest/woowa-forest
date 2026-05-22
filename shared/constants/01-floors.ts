import type { FloorConfig } from '../types/02-map';

export const TILE_SIZE = 32;
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 25;

export const FLOORS: Record<number, FloorConfig> = {
  11: { id: 11, name: '구리마을 & 안드로이드 제국', track: 'ANDROID',  theme: 0x4caf50, themeHex: '#4CAF50' },
  12: { id: 12, name: '태초마을 & 프론트엔드 마을', track: 'FRONTEND', theme: 0x2196f3, themeHex: '#2196F3' },
  13: { id: 13, name: '뽀롱뽀롱마을 & 둠바족',      track: 'BACKEND',  theme: 0xff9800, themeHex: '#FF9800' },
};

export const FLOOR_IDS = [11, 12, 13] as const;
export const DEFAULT_FLOOR = 12;
