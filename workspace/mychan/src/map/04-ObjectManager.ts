import Phaser from 'phaser';
import { TILE_SIZE } from '@shared/constants/01-floors';
import { OBJECTS_BY_FLOOR } from '@shared/constants/02-villages';
import type { ObjectConfig } from '@shared/types/02-map';
import { PALETTE, FLOOR_THEME, type FloorTheme } from './03-TileMap';

const PROXIMITY: Record<string, number> = {
  WELL: 4, BULLETIN: 1, STAIR_UP: 0, STAIR_DOWN: 0, PORTAL: 0,
};

export class ObjectManager {
  private objects: ObjectConfig[];
  private hints: Phaser.GameObjects.GameObject[] = [];

  constructor(private scene: Phaser.Scene, private floorId: number) {
    this.objects = OBJECTS_BY_FLOOR[floorId] ?? [];
  }

  draw(): void {
    const g = this.scene.add.graphics().setDepth(2);
    const th = FLOOR_THEME[this.floorId] ?? FLOOR_THEME[12];

    for (const obj of this.objects) {
      const px = obj.x * TILE_SIZE;
      const py = obj.y * TILE_SIZE;

      switch (obj.type) {
        case 'WELL':       this.drawWell(g, px, py);           break;
        case 'BULLETIN':   this.drawBulletin(g, px, py);       break;
        case 'STAIR_UP':   this.drawStair(g, px, py, true, th); break;
        case 'STAIR_DOWN': this.drawStair(g, px, py, false, th); break;
        case 'PORTAL':     this.drawPortal(g, px, py, obj.label ?? ''); break;
        case 'DECORATION': this.drawDecoration(px, py, obj.label ?? ''); break;
      }
    }
  }

  // ── 우물가 ─────────────────────────────────────────────────
  private drawWell(g: Phaser.GameObjects.Graphics, px: number, py: number): void {
    // 석조 기단
    g.fillStyle(PALETTE.stone);
    g.fillRoundedRect(px + 3, py + 16, 26, 13, 3);
    g.fillStyle(0x78909c); // 안쪽 어두운 원
    g.fillCircle(px + 16, py + 20, 7);
    g.fillStyle(0x37474f); // 우물 속
    g.fillCircle(px + 16, py + 20, 4);

    // 나무 기둥 두 개
    g.fillStyle(PALETTE.honeyWood);
    g.fillRect(px + 5, py + 6, 4, 14);
    g.fillRect(px + 23, py + 6, 4, 14);

    // 지붕 삼각
    g.fillStyle(PALETTE.darkOak);
    g.fillTriangle(px + 16, py + 0, px + 2, py + 10, px + 30, py + 10);
    g.fillStyle(PALETTE.honeyWood);
    g.fillRect(px + 2, py + 8, 28, 3); // 처마

    // 두레박 줄 + 양동이
    g.fillStyle(0x8d6e63);
    g.fillRect(px + 14, py + 10, 4, 8);
    g.fillStyle(0x78909c);
    g.fillRoundedRect(px + 11, py + 17, 10, 6, 2);
    g.fillStyle(PALETTE.stoneLight, 0.5);
    g.fillRect(px + 12, py + 18, 8, 2);

    // 이름 라벨
    this.addLabel(px + TILE_SIZE / 2, py - 2, '🪣 우물가');
  }

  // ── 게시판 ─────────────────────────────────────────────────
  private drawBulletin(g: Phaser.GameObjects.Graphics, px: number, py: number): void {
    // 나무 기둥 두 개
    g.fillStyle(PALETTE.darkOak);
    g.fillRect(px + 4, py + 2, 5, 28);
    g.fillRect(px + 23, py + 2, 5, 28);
    g.fillStyle(PALETTE.honeyWood); // 밝은 면
    g.fillRect(px + 5, py + 3, 2, 26);
    g.fillRect(px + 24, py + 3, 2, 26);

    // 코르크 보드
    g.fillStyle(PALETTE.corkBoard);
    g.fillRoundedRect(px + 8, py + 4, 16, 20, 2);
    g.fillStyle(0xb8891a, 0.3); // 보드 그림자
    g.fillRoundedRect(px + 8, py + 22, 16, 2, 1);

    // 종이 세 장
    g.fillStyle(PALETTE.cream);
    g.fillRoundedRect(px + 10, py + 7,  11, 4, 1);
    g.fillRoundedRect(px + 10, py + 13, 11, 3, 1);
    g.fillRoundedRect(px + 10, py + 18,  7, 2, 1);

    // 압정 (붉은 점)
    g.fillStyle(0xef5350);
    g.fillCircle(px + 10, py + 7, 1.5);
    g.fillCircle(px + 21, py + 7, 1.5);
    g.fillStyle(0x42a5f5);
    g.fillCircle(px + 10, py + 13, 1.5);

    // 하단 받침대
    g.fillStyle(PALETTE.darkOak);
    g.fillRect(px + 3, py + 24, 26, 4);

    this.addLabel(px + TILE_SIZE / 2, py - 2, '📋 게시판');
  }

  // ── 계단 ───────────────────────────────────────────────────
  private drawStair(
    g: Phaser.GameObjects.Graphics,
    px: number, py: number,
    isUp: boolean,
    th: FloorTheme
  ): void {
    const accent = th.accent;

    if (isUp) {
      // 위로 가는 계단 — 뒤쪽이 더 높음 (안으로 들어가는 느낌)
      // 3단, 앞단이 가장 넓고 낮음
      g.fillStyle(PALETTE.stoneLight);
      g.fillRect(px + 0, py + 20, 32, 10); // 1단 (앞)
      g.fillStyle(0x90a4ae);
      g.fillRect(px + 0, py + 20, 32, 2);  // 그림자

      g.fillStyle(PALETTE.stoneLight);
      g.fillRect(px + 4, py + 12, 28, 10); // 2단
      g.fillStyle(0x90a4ae);
      g.fillRect(px + 4, py + 12, 28, 2);

      g.fillStyle(0xdce8f0);
      g.fillRect(px + 8, py + 4, 24, 10);  // 3단 (뒤/위)
      g.fillStyle(0x90a4ae);
      g.fillRect(px + 8, py + 4, 24, 2);

      // 발광 테두리 (interactive 표시)
      g.lineStyle(2, accent, 0.7);
      g.strokeRect(px + 1, py + 1, 30, 30);
    } else {
      // 아래로 가는 계단 — 앞쪽이 더 짙음
      g.fillStyle(0xdce8f0);
      g.fillRect(px + 0, py + 4, 32, 10);  // 1단
      g.fillStyle(PALETTE.stoneLight);
      g.fillRect(px + 4, py + 12, 28, 10); // 2단
      g.fillStyle(0x90a4ae);
      g.fillRect(px + 8, py + 20, 24, 10); // 3단 (아래)
      g.fillStyle(0x78909c);
      g.fillRect(px + 8, py + 28, 24, 2);

      g.lineStyle(2, accent, 0.7);
      g.strokeRect(px + 1, py + 1, 30, 30);
    }

    // 화살표 아이콘 텍스트
    this.addLabel(px + TILE_SIZE / 2, py + TILE_SIZE + 2,
      isUp ? '▲ 위층' : '▼ 아래층', 9);
  }

  // ── 마을 입구 아치문 ────────────────────────────────────────
  private drawPortal(
    g: Phaser.GameObjects.Graphics,
    px: number, py: number,
    label: string
  ): void {
    // 기둥 두 개
    g.fillStyle(PALETTE.darkOak);
    g.fillRect(px + 2, py + 8, 7, 22);
    g.fillRect(px + 23, py + 8, 7, 22);
    g.fillStyle(PALETTE.honeyWood); // 밝은 면
    g.fillRect(px + 3, py + 9, 3, 20);
    g.fillRect(px + 24, py + 9, 3, 20);

    // 아치 상단 가로보
    g.fillStyle(PALETTE.darkOak);
    g.fillRect(px + 2, py + 6, 28, 5);
    // 아치 꼭대기 삼각 장식
    g.fillStyle(PALETTE.honeyWood);
    g.fillTriangle(px + 16, py + 0, px + 6, py + 7, px + 26, py + 7);

    // 현판 배경
    g.fillStyle(PALETTE.cream);
    g.fillRoundedRect(px + 6, py + 1, 20, 7, 2);
    g.lineStyle(1, PALETTE.darkOak, 0.8);
    g.strokeRoundedRect(px + 6, py + 1, 20, 7, 2);

    // 라벨 (현판 위가 아니라 위쪽)
    const shortLabel = label.replace('🏠 ', '').replace(' 입구', '');
    this.scene.add.text(px + TILE_SIZE / 2, py + 4, shortLabel, {
      fontFamily: "'DotGothic16', monospace",
      fontSize: '7px',
      color: '#2D1B0E',
    }).setOrigin(0.5, 0.5).setDepth(4);
  }

  // ── 장식 오브젝트 ──────────────────────────────────────────
  private drawDecoration(px: number, py: number, label: string): void {
    // 동그란 받침 (풀숲 느낌)
    const g = this.scene.add.graphics().setDepth(2);
    g.fillStyle(PALETTE.forestGreen, 0.4);
    g.fillCircle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE / 2 - 2);

    this.scene.add.text(px + TILE_SIZE / 2, py + TILE_SIZE / 2, label, {
      fontSize: '18px',
    }).setOrigin(0.5).setDepth(3);
  }

  // ── 상호작용 힌트 텍스트 ──────────────────────────────────
  showHint(text: string, worldX: number, worldY: number): void {
    this.clearHint();

    const bg = this.scene.add.graphics().setDepth(20).setScrollFactor(0);
    // 포켓몬 스타일 대화 박스 — 화면 하단 고정
    const W = this.scene.game.config.width as number;
    const H = this.scene.game.config.height as number;
    const bW = Math.min(320, W - 32);
    const bX = (W - bW) / 2;
    const bY = H - 70;

    bg.fillStyle(PALETTE.cream);
    bg.fillRoundedRect(bX, bY, bW, 52, 8);
    bg.lineStyle(3, PALETTE.darkOak, 1);
    bg.strokeRoundedRect(bX, bY, bW, 52, 8);
    bg.lineStyle(2, PALETTE.honeyWood, 0.4);
    bg.strokeRoundedRect(bX + 3, bY + 3, bW - 6, 46, 6);

    const txt = this.scene.add.text(bX + bW / 2, bY + 26, text, {
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: '13px',
      color: '#2D1B0E',
      align: 'center',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

    this.hints = [bg, txt];
    void worldX; void worldY; // 박스는 화면 고정
  }

  clearHint(): void {
    this.hints.forEach(o => o.destroy());
    this.hints = [];
  }

  getNearby(playerTileX: number, playerTileY: number): ObjectConfig | null {
    for (const obj of this.objects) {
      const radius = PROXIMITY[obj.type] ?? -1;
      if (radius < 0) continue;
      const dist = Math.max(
        Math.abs(playerTileX - obj.x),
        Math.abs(playerTileY - obj.y)
      );
      if (dist <= radius) return obj;
    }
    return null;
  }

  destroy(): void {
    this.clearHint();
  }

  private addLabel(x: number, y: number, text: string, size = 10): void {
    this.scene.add.text(x, y, text, {
      fontFamily: "'DotGothic16', monospace",
      fontSize: `${size}px`,
      color: '#FFF8E7',
      backgroundColor: '#2D1B0ECC',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5, 1).setDepth(4);
  }
}
