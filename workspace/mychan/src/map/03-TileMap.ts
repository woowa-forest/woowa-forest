import { TILE, type TileValue } from '@shared/types/02-map';
import { MAP_WIDTH, MAP_HEIGHT } from '@shared/constants/01-floors';
import { OBJECTS_BY_FLOOR } from '@shared/constants/02-villages';

// ── 층별 3D 테마 (R3F MeshToonMaterial 색상) ────────────────────
export interface FloorTheme3D {
  grassColor:  string;
  grassDkColor: string;
  pathColor:   string;
  wallColor:   string;
  wallLtColor: string;
  accentColor: string;
  fogColor:    string;
  sunColor:    string;
}

export const FLOOR_THEME_3D: Record<number, FloorTheme3D> = {
  11: {
    grassColor:   '#8BC34A',
    grassDkColor: '#689F38',
    pathColor:    '#D4B896',
    wallColor:    '#4A6741',
    wallLtColor:  '#6A9460',
    accentColor:  '#81C784',
    fogColor:     '#E8F5E9',
    sunColor:     '#FFF9C4',
  },
  12: {
    grassColor:   '#9EC5DA',
    grassDkColor: '#6BA8AB',
    pathColor:    '#C8B89A',
    wallColor:    '#5A6B80',
    wallLtColor:  '#7A8EA8',
    accentColor:  '#90CAF9',
    fogColor:     '#E3F2FD',
    sunColor:     '#FFF8E7',
  },
  13: {
    grassColor:   '#C8A878',
    grassDkColor: '#A88058',
    pathColor:    '#8B6444',
    wallColor:    '#5C3D2E',
    wallLtColor:  '#7A5544',
    accentColor:  '#FFB300',
    fogColor:     '#FFF3E0',
    sunColor:     '#FFE0B2',
  },
};

// ── 충돌 테이블 ───────────────────────────────────────────────
export const TILE_WALKABLE: Record<TileValue, boolean> = {
  [TILE.FLOOR]:       true,
  [TILE.WALL]:        false,
  [TILE.WELL]:        false,
  [TILE.BULLETIN]:    false,
  [TILE.STAIR_UP]:    true,
  [TILE.STAIR_DOWN]:  true,
  [TILE.DECORATABLE]: true,
  [TILE.PORTAL]:      true,
};

const OBJECT_TO_TILE: Record<string, TileValue> = {
  WELL: TILE.WELL, BULLETIN: TILE.BULLETIN,
  STAIR_UP: TILE.STAIR_UP, STAIR_DOWN: TILE.STAIR_DOWN,
  PORTAL: TILE.PORTAL,
};

// ── 타일 맵 데이터 생성 ───────────────────────────────────────
export function buildTileMap(floorId: number): TileValue[][] {
  const map: TileValue[][] = Array.from({ length: MAP_HEIGHT }, (_, y) =>
    Array.from({ length: MAP_WIDTH }, (_, x) => {
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) return TILE.WALL;
      if (x <= 14) return TILE.DECORATABLE;
      if (x === 15) return TILE.WALL;
      return TILE.FLOOR;
    })
  );
  for (const obj of OBJECTS_BY_FLOOR[floorId] ?? []) {
    if (obj.type === 'DECORATION') continue;
    const v = OBJECT_TO_TILE[obj.type];
    if (v !== undefined) map[obj.y][obj.x] = v;
    if (obj.type === 'PORTAL' && obj.x === 15) {
      for (let dy = -1; dy <= 1; dy++) {
        const py = obj.y + dy;
        if (py > 0 && py < MAP_HEIGHT - 1) map[py][15] = TILE.PORTAL;
      }
    }
  }
  return map;
}

// ── 유틸 ─────────────────────────────────────────────────────
export function getTile(map: TileValue[][], x: number, y: number): TileValue {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return TILE.WALL;
  return map[y][x];
}

export function isWalkable(map: TileValue[][], tx: number, ty: number): boolean {
  return TILE_WALKABLE[getTile(map, tx, ty)];
}

export function canOccupy(map: TileValue[][], wx: number, wz: number, half = 0.3): boolean {
  return (
    isWalkable(map, Math.floor(wx - half), Math.floor(wz - half)) &&
    isWalkable(map, Math.floor(wx + half), Math.floor(wz - half)) &&
    isWalkable(map, Math.floor(wx - half), Math.floor(wz + half)) &&
    isWalkable(map, Math.floor(wx + half), Math.floor(wz + half))
  );
}
