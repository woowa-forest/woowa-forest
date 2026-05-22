export const TILE = {
  FLOOR: 0,
  WALL: 1,
  WELL: 2,
  BULLETIN: 3,
  STAIR_UP: 4,
  STAIR_DOWN: 5,
  DECORATABLE: 6,
  PORTAL: 7,
} as const;

export type TileValue = (typeof TILE)[keyof typeof TILE];

export type ObjectType =
  | 'WELL'
  | 'BULLETIN'
  | 'STAIR_UP'
  | 'STAIR_DOWN'
  | 'PORTAL'
  | 'DECORATION';

export interface ObjectConfig {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  label?: string;
}

export interface FloorConfig {
  id: number;
  name: string;
  track: string;
  theme: number;
  themeHex: string;
}

export interface Position {
  x: number;
  y: number;
}
