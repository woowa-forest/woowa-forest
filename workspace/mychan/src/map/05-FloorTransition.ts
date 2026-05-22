import Phaser from 'phaser';
import { FLOORS } from '@shared/constants/01-floors';
import { PALETTE } from './03-TileMap';

/**
 * 포켓몬 마을 진입 스타일 전환:
 * 1) 검정 오버레이 페이드 인 (0.3s)
 * 2) 마을 이름 텍스트 등장
 * 3) 0.9s 유지
 * 4) 씬 재시작 → fadeIn()으로 페이드 아웃
 */
export function fadeToFloor(scene: Phaser.Scene, toFloorId: number): void {
  const W = scene.game.config.width as number;
  const H = scene.game.config.height as number;
  const floor = FLOORS[toFloorId];

  // 검정 오버레이 (스크롤 고정)
  const overlay = scene.add
    .rectangle(W / 2, H / 2, W, H, 0x000000, 0)
    .setScrollFactor(0)
    .setDepth(90);

  scene.tweens.add({
    targets: overlay,
    alpha: 1,
    duration: 300,
    ease: 'Linear',
    onComplete: () => {
      // 마을 이름 텍스트
      const title = scene.add
        .text(W / 2, H / 2 - 12, `${toFloorId}F — ${floor?.name ?? ''}`, {
          fontFamily: "'DotGothic16', monospace",
          fontSize: '22px',
          color: '#FFF8E7',
          stroke: '#2D1B0E',
          strokeThickness: 2,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(95)
        .setAlpha(0);

      const sub = scene.add
        .text(W / 2, H / 2 + 16, '에 입장합니다', {
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: '13px',
          color: '#C8B89A',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(95)
        .setAlpha(0);

      // 텍스트 페이드 인
      scene.tweens.add({
        targets: [title, sub],
        alpha: 1,
        duration: 200,
        ease: 'Linear',
      });

      // 0.9초 후 씬 전환
      scene.time.delayedCall(900, () => {
        title.destroy();
        sub.destroy();
        overlay.destroy();
        scene.scene.restart({ floorId: toFloorId });
      });
    },
  });
}

/** 씬 시작 시 카메라 페이드 인 */
export function fadeIn(scene: Phaser.Scene, duration = 350): void {
  scene.cameras.main.fadeIn(duration, 0, 0, 0);
}

void PALETTE; // suppress unused warning
