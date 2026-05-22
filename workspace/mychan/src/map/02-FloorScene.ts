import Phaser from 'phaser';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, FLOORS, DEFAULT_FLOOR } from '@shared/constants/01-floors';
import { SPAWN_BY_FLOOR } from '@shared/constants/02-villages';
import type { TileValue } from '@shared/types/02-map';
import { buildTileMap, isWalkable, pixelToTile, renderTileMap, FLOOR_THEME, PALETTE } from './03-TileMap';
import { ObjectManager } from './04-ObjectManager';
import { fadeToFloor, fadeIn } from './05-FloorTransition';
import { mapEvents } from './mapEvents';

interface InitData { floorId?: number }

const PLAYER_SPEED  = 160;
const HEAD_R        = 10;  // 머리 반지름
const BODY_W        = 14;
const BODY_H        = 11;
const LEG_H         = 8;

// 분야별 상의 색상 (registry에 field가 없으면 기본값)
const FIELD_COLOR: Record<string, number> = {
  AN: 0x4caf50, FE: 0x42a5f5, BE: 0xff8f00, COACH: 0x9c27b0,
};
const DEFAULT_SHIRT = 0x42a5f5;

export class FloorScene extends Phaser.Scene {
  private floorId    = DEFAULT_FLOOR;
  private tileMap: TileValue[][] = [];
  private player!: Phaser.GameObjects.Container;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'up'|'left'|'down'|'right', Phaser.Input.Keyboard.Key>;
  private eKey!: Phaser.Input.Keyboard.Key;
  private objManager!: ObjectManager;
  private prevNearType: string | null = null;
  private transitioning = false;

  constructor() { super({ key: 'FloorScene' }); }

  init(data: InitData): void {
    this.floorId = data.floorId ?? DEFAULT_FLOOR;
    this.transitioning = false;
    this.prevNearType  = null;
  }

  create(): void {
    const floor = FLOORS[this.floorId];
    const th    = FLOOR_THEME[this.floorId] ?? FLOOR_THEME[12];

    // ── 1. 배경 (화면 전체를 하늘색으로)
    this.add.rectangle(
      MAP_WIDTH * TILE_SIZE / 2,
      MAP_HEIGHT * TILE_SIZE / 2,
      MAP_WIDTH * TILE_SIZE,
      MAP_HEIGHT * TILE_SIZE,
      0xc9e8f5
    ).setDepth(-1);

    // ── 2. 타일 맵 (텍스처 포함)
    this.tileMap = buildTileMap(this.floorId);
    renderTileMap(this, this.tileMap, this.floorId);

    // ── 3. 오브젝트
    this.objManager = new ObjectManager(this, this.floorId);
    this.objManager.draw();

    // ── 4. 플레이어 (동물의 숲 스타일)
    this.player = this.createPlayer();

    // ── 5. 카메라
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);

    // ── 6. HUD
    this.buildHUD(floor?.name ?? '', floor?.themeHex ?? '#555', th);

    // ── 7. 키보드
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // 브라우저 기본 스크롤 동작 차단 (방향키가 페이지를 스크롤하지 않도록)
    this.input.keyboard!.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.E,
    ]);

    fadeIn(this);
  }

  // ── 플레이어 생성 ────────────────────────────────────────────
  private createPlayer(): Phaser.GameObjects.Container {
    const spawn     = SPAWN_BY_FLOOR[this.floorId];
    const sx        = spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const sy        = spawn.y * TILE_SIZE + TILE_SIZE / 2;
    const playerName = this.registry.get('playerName') ?? 'you';
    const field      = this.registry.get('field') ?? 'FE';
    const shirtColor = FIELD_COLOR[field] ?? DEFAULT_SHIRT;
    const shirtDark  = Phaser.Display.Color.ValueToColor(shirtColor)
      .darken(30).color;

    const items: Phaser.GameObjects.GameObject[] = [];

    // 그림자
    const shadow = this.add.ellipse(0, 18, 20, 7, 0x000000, 0.18);
    items.push(shadow);

    // 다리 (두 개 사각형)
    const legColor = 0x4a3030;
    items.push(
      this.add.rectangle(-4, 14, 6, LEG_H, legColor),
      this.add.rectangle( 4, 14, 6, LEG_H, legColor),
    );

    // 몸통 (상의)
    const body = this.add.rectangle(0, 5, BODY_W, BODY_H, shirtColor)
      .setStrokeStyle(1.5, shirtDark);
    items.push(body);

    // 피부색 얼굴 원
    const head = this.add.circle(0, -6, HEAD_R, 0xffdbb0)
      .setStrokeStyle(1.5, 0xc49a6c);
    items.push(head);

    // 눈 (두 점)
    items.push(
      this.add.circle(-3, -7, 1.5, 0x2d1b0e),
      this.add.circle( 3, -7, 1.5, 0x2d1b0e),
    );

    // 이름 말풍선 배경 + 텍스트
    const nameTw = playerName.length * 6 + 12;
    const nameBg = this.add.graphics();
    nameBg.fillStyle(PALETTE.cream, 0.95);
    nameBg.fillRoundedRect(-nameTw / 2, -HEAD_R - 22, nameTw, 16, 4);
    nameBg.lineStyle(1.5, 0xc8b89a, 1);
    nameBg.strokeRoundedRect(-nameTw / 2, -HEAD_R - 22, nameTw, 16, 4);
    // 꼬리 삼각
    nameBg.fillStyle(PALETTE.cream, 0.95);
    nameBg.fillTriangle(-3, -HEAD_R - 6, 3, -HEAD_R - 6, 0, -HEAD_R - 2);

    const nameText = this.add.text(0, -HEAD_R - 14, playerName, {
      fontFamily: "'DotGothic16', monospace",
      fontSize: '10px',
      color: '#2D1B0E',
    }).setOrigin(0.5);

    items.push(nameBg, nameText);

    const container = this.add.container(sx, sy, items).setDepth(5);
    return container;
  }

  // ── HUD 구성 ─────────────────────────────────────────────────
  private buildHUD(floorName: string, themeHex: string, th: typeof FLOOR_THEME[number]): void {
    const W = this.game.config.width as number;
    const H = this.game.config.height as number;

    // 상단 왼쪽: 층 배지
    const badgeG = this.add.graphics().setScrollFactor(0).setDepth(30);
    badgeG.fillStyle(th.accent);
    badgeG.fillRoundedRect(10, 10, 160, 28, 14);
    badgeG.lineStyle(2, PALETTE.darkOak, 0.4);
    badgeG.strokeRoundedRect(10, 10, 160, 28, 14);

    this.add.text(90, 24, `${this.floorId}F  ${floorName}`, {
      fontFamily: "'DotGothic16', monospace",
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

    // 하단: 조작 힌트 바 (포켓몬 대화창 스타일)
    const hintG = this.add.graphics().setScrollFactor(0).setDepth(30);
    hintG.fillStyle(PALETTE.cream);
    hintG.fillRoundedRect(10, H - 38, W - 20, 28, 8);
    hintG.lineStyle(2.5, PALETTE.darkOak, 0.6);
    hintG.strokeRoundedRect(10, H - 38, W - 20, 28, 8);

    this.add.text(W / 2, H - 24, 'WASD / 방향키: 이동   E: 상호작용   계단: 층이동', {
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: '11px',
      color: '#2D1B0E',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

    void themeHex; // suppress unused
  }

  // ── 게임 루프 ─────────────────────────────────────────────────
  update(_t: number, delta: number): void {
    if (this.transitioning) return;
    this.handleMovement(delta);
    this.handleProximity();
    this.handleInteraction();
  }

  private handleMovement(delta: number): void {
    const left  = this.cursors.left.isDown  || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up    = this.cursors.up.isDown    || this.wasd.up.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.down.isDown;

    let dx = 0, dy = 0;
    if (left)       dx = -1;
    else if (right) dx =  1;
    if (up)         dy = -1;
    else if (down)  dy =  1;
    if (dx === 0 && dy === 0) return;

    const step = PLAYER_SPEED * (delta / 1000);
    const half = BODY_W / 2 - 1;
    const nx   = this.player.x + dx * step;
    const ny   = this.player.y + dy * step;

    if (this.canOccupy(nx, this.player.y, half)) this.player.x = nx;
    if (this.canOccupy(this.player.x, ny, half)) this.player.y = ny;
  }

  private canOccupy(cx: number, cy: number, half: number): boolean {
    return [
      [cx - half, cy - half], [cx + half, cy - half],
      [cx - half, cy + half], [cx + half, cy + half],
    ].every(([x, y]) => isWalkable(this.tileMap, pixelToTile(x), pixelToTile(y)));
  }

  private handleProximity(): void {
    const tx     = pixelToTile(this.player.x);
    const ty     = pixelToTile(this.player.y);
    const nearby = this.objManager.getNearby(tx, ty);
    const nearType = nearby?.type ?? null;

    if (nearType === this.prevNearType) return;

    if (this.prevNearType === 'WELL') mapEvents.emit('LEAVE_WELL');
    if (nearType === 'WELL')          mapEvents.emit('NEAR_WELL');
    this.prevNearType = nearType;

    if (!nearby || nearType === 'DECORATION') {
      this.objManager.clearHint();
      return;
    }

    if ((nearType === 'STAIR_UP' || nearType === 'STAIR_DOWN')
      && tx === nearby.x && ty === nearby.y) {
      this.triggerStair(nearType);
      return;
    }

    this.objManager.showHint(this.hintText(nearType ?? ''), this.player.x, this.player.y);
  }

  private hintText(type: string): string {
    switch (type) {
      case 'WELL':     return '🪣 우물가 근처 — 채팅이 가능해요!';
      case 'BULLETIN': return '[E] 게시판 열기';
      case 'PORTAL':   return '[E] 마을 입장';
      default:         return '[E] 상호작용';
    }
  }

  private triggerStair(type: 'STAIR_UP' | 'STAIR_DOWN'): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.objManager.clearHint();

    const toFloor = type === 'STAIR_UP' ? this.floorId + 1 : this.floorId - 1;
    if (toFloor < 11 || toFloor > 13) { this.transitioning = false; return; }

    mapEvents.emit('FLOOR_CHANGED', { toFloor });
    fadeToFloor(this, toFloor);
  }

  private handleInteraction(): void {
    if (!Phaser.Input.Keyboard.JustDown(this.eKey)) return;
    const nearby = this.objManager.getNearby(
      pixelToTile(this.player.x), pixelToTile(this.player.y)
    );
    if (!nearby) return;
    if (nearby.type === 'BULLETIN') mapEvents.emit('INTERACT_BULLETIN');
    if (nearby.type === 'PORTAL')   mapEvents.emit('INTERACT_PORTAL', { floorId: this.floorId });
  }
}
