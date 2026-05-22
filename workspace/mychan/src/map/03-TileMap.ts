import Phaser from 'phaser';
import { TILE, type TileValue } from '@shared/types/02-map';
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from '@shared/constants/01-floors';
import { OBJECTS_BY_FLOOR } from '@shared/constants/02-villages';

// ── 09-design.md 기본 팔레트 ──────────────────────────────────
export const PALETTE = {
  sageGreen:    0xa8c78a,
  forestGreen:  0x7ea85f,
  sandyPath:    0xd4b896,
  warmBrown:    0xb8956a,
  darkOak:      0x5c3d2e,
  honeyWood:    0x8b5e3c,
  cream:        0xfff8e7,
  ink:          0x2d1b0e,
  stone:        0x9e9e9e,
  stoneLight:   0xb0bec5,
  corkBoard:    0xc8a05e,
} as const;

// ── 층별 테마 팔레트 ──────────────────────────────────────────
export interface FloorTheme {
  grass:    number;  // DECORATABLE 바닥
  grassDk:  number;  // 잡초 점 색
  path:     number;  // FLOOR 복도
  pathDk:   number;  // 복도 어두운 노이즈
  wall:     number;  // WALL 메인
  wallLt:   number;  // WALL 밝은 벽돌면
  accent:   number;  // 계단 등 강조
}

export const FLOOR_THEME: Record<number, FloorTheme> = {
  11: { // 구리마을 — 생동감 있는 초록 잔디
    grass: 0xa8c78a, grassDk: 0x7ea85f,
    path:  0xd4b896, pathDk:  0xb8956a,
    wall:  0x4a6741, wallLt:  0x6a9460,
    accent: 0x81c784,
  },
  12: { // 태초마을 — 시원한 하늘빛 잔디 + 밝은 나무 마루
    grass: 0x9ec5da, grassDk: 0x6ba8ab,
    path:  0xc8b89a, pathDk:  0xa8987a,
    wall:  0x5a6b80, wallLt:  0x7a8ea8,
    accent: 0x90caf9,
  },
  13: { // 뽀롱뽀롱마을 — 따뜻한 커피색 나무 마루
    grass: 0xc8a878, grassDk: 0xa88058,
    path:  0x8b6444, pathDk:  0x6b4828,
    wall:  0x5c3d2e, wallLt:  0x7a5544,
    accent: 0xffb300,
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

// ── 위치 기반 시드 RNG (같은 타일은 항상 같은 노이즈) ─────────
function rng(seed: number) {
  let s = (seed * 1664525 + 1013904223) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

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

// ── 타일맵 텍스처 렌더링 ─────────────────────────────────────
export function renderTileMap(
  scene: Phaser.Scene,
  map: TileValue[][],
  floorId: number
): void {
  const th = FLOOR_THEME[floorId] ?? FLOOR_THEME[12];
  const g = scene.add.graphics().setDepth(0);

  for (let ty = 0; ty < MAP_HEIGHT; ty++) {
    for (let tx = 0; tx < MAP_WIDTH; tx++) {
      const tile = map[ty][tx];
      const px = tx * TILE_SIZE;
      const py = ty * TILE_SIZE;

      switch (tile) {
        case TILE.DECORATABLE: drawGrass(g, px, py, tx, ty, th);   break;
        case TILE.FLOOR:       drawPath(g, px, py, tx, ty, th);    break;
        case TILE.WALL:        drawWall(g, px, py, tx, ty, th);    break;
        case TILE.PORTAL:      drawPortalGround(g, px, py, th);    break;
        // 오브젝트 타일은 ObjectManager가 그림 — 여기선 바닥만
        case TILE.WELL:
        case TILE.BULLETIN:
        case TILE.STAIR_UP:
        case TILE.STAIR_DOWN:  drawPath(g, px, py, tx, ty, th);   break;
      }
    }
  }
}

// ── 개별 타일 드로잉 함수 ─────────────────────────────────────

function drawGrass(
  g: Phaser.GameObjects.Graphics,
  px: number, py: number,
  tx: number, ty: number,
  th: FloorTheme
): void {
  g.fillStyle(th.grass);
  g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  // 잡초 노이즈 (2~3개 점)
  const r = rng(tx * 1000 + ty);
  const count = Math.floor(r() * 2) + 2;
  g.fillStyle(th.grassDk);
  for (let i = 0; i < count; i++) {
    const dx = Math.floor(r() * (TILE_SIZE - 4)) + 2;
    const dy = Math.floor(r() * (TILE_SIZE - 4)) + 2;
    g.fillRect(px + dx, py + dy, 2, 3);
  }
}

function drawPath(
  g: Phaser.GameObjects.Graphics,
  px: number, py: number,
  tx: number, ty: number,
  th: FloorTheme
): void {
  g.fillStyle(th.path);
  g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  // 수평 모래 결
  const r = rng(tx * 997 + ty * 3);
  const lines = Math.floor(r() * 2) + 1;
  g.fillStyle(th.pathDk);
  for (let i = 0; i < lines; i++) {
    const dy = Math.floor(r() * (TILE_SIZE - 4)) + 2;
    const len = Math.floor(r() * 10) + 4;
    const dx = Math.floor(r() * (TILE_SIZE - len));
    g.fillRect(px + dx, py + dy, len, 1);
  }
}

function drawWall(
  g: Phaser.GameObjects.Graphics,
  px: number, py: number,
  _tx: number, ty: number,
  th: FloorTheme
): void {
  g.fillStyle(th.wall);
  g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  // 벽돌 패턴 (4줄 × 엇갈림)
  const bH = 8, bW = 16;
  for (let row = 0; row < TILE_SIZE / bH; row++) {
    const offset = (row % 2) * (bW / 2);
    for (let col = -1; col <= TILE_SIZE / bW; col++) {
      const bx = px + col * bW + offset;
      const by = py + row * bH;
      if (bx + 1 < px || bx + bW - 1 > px + TILE_SIZE) continue;
      g.fillStyle(th.wallLt);
      g.fillRect(bx + 1, by + 1, bW - 2, bH - 2);
    }
  }
  // 상단 어두운 줄 (입체감)
  if (ty > 0) {
    g.fillStyle(0x000000, 0.15);
    g.fillRect(px, py, TILE_SIZE, 3);
  }
}

function drawPortalGround(
  g: Phaser.GameObjects.Graphics,
  px: number, py: number,
  th: FloorTheme
): void {
  // 입구 바닥은 path 색에 보라 틴트
  g.fillStyle(th.path);
  g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0x9c27b0, 0.12);
  g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
}

// ── 유틸 ─────────────────────────────────────────────────────
export function getTile(map: TileValue[][], x: number, y: number): TileValue {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return TILE.WALL;
  return map[y][x];
}
export function isWalkable(map: TileValue[][], tx: number, ty: number): boolean {
  return TILE_WALKABLE[getTile(map, tx, ty)];
}
export function pixelToTile(px: number): number {
  return Math.floor(px / TILE_SIZE);
}
