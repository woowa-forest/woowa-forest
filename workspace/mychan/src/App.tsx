import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapRenderer } from './map/01-MapRenderer';
import { LandingPage } from './pages/LandingPage';
import { MyPageModal } from './components/MyPageModal';
import { Bulletin } from './bulletin/05-Bulletin';
import { EconomyPanel } from './economy/06-EconomyPanel';
import { EmojiPalette } from './interaction/EmojiPalette';
import { NearbyChat } from './interaction/NearbyChat';
import { OtherProfileModal } from './interaction/OtherProfileModal';
import { DmPanel } from './interaction/DmPanel';
import { useAuthStore } from './store/useAuthStore';
import { VILLAGE_FLOOR } from '@shared/types/01-member';
import { mapEvents } from './map/mapEvents';

const spring = { type: 'spring' as const, stiffness: 340, damping: 28 };

export default function App() {
  const member    = useAuthStore(s => s.member);
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);

  const [nearWell,      setNearWell]      = useState(false);
  const [bulletinOpen,  setBulletinOpen]  = useState(false);
  const [myPageOpen,    setMyPageOpen]    = useState(false);
  const [otherId,       setOtherId]       = useState<string | null>(null);
  const [dmTargetId,    setDmTargetId]    = useState<string | null>(null);
  const [currentFloor,  setCurrentFloor]  = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    // MapRenderer props already handle most events. 
    // We only need to listen here if we want to do something outside of MapRenderer.
    return () => {};
  }, [isLoggedIn]);

  const crewName    = member?.crewName ?? 'you';
  const field       = member?.field    ?? 'FE';
  const initFloor   = member ? VILLAGE_FLOOR[member.village] : undefined;
  const displayFloor = currentFloor ?? initFloor ?? 12;

  if (!isLoggedIn) {
    return (
      <LandingPage onEnter={() => {
        setCurrentFloor(null);
        setNearWell(false);
        setBulletinOpen(false);
      }} />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0d1a0a 0%, #1a1209 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: 24,
    }}>

      <MapRenderer
        playerName={crewName}
        playerField={field}
        initialFloor={initFloor}
        onNearWell={() => setNearWell(true)}
        onLeaveWell={() => setNearWell(false)}
        onInteractBulletin={() => setBulletinOpen(v => !v)}
        onInteractCharacter={({ memberId }) => setOtherId(memberId)}
        onFloorChange={(floor) => {
          setCurrentFloor(floor);
          setBulletinOpen(false);
          setNearWell(false);
          setOtherId(null);
        }}
      />

      <EconomyPanel />
      <EmojiPalette />

      {/* ── 우물가 채팅 ── */}
      <AnimatePresence>
        {nearWell && <NearbyChat floorId={displayFloor} />}
      </AnimatePresence>

      {/* ── DM 사이드패널 ── */}
      <AnimatePresence>
        {dmTargetId && (
          <DmPanel targetId={dmTargetId} onClose={() => setDmTargetId(null)} />
        )}
      </AnimatePresence>

      {/* ── 다른 크루 프로필 ── */}
      <AnimatePresence>
        {otherId && (
          <OtherProfileModal
            memberId={otherId}
            onClose={() => setOtherId(null)}
            onOpenDm={() => {
              setDmTargetId(otherId);
              setOtherId(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* 내 정보 버튼 (우상단) */}
      <motion.button
        onClick={() => setMyPageOpen(true)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'fixed', top: 16, right: 16,
          background: 'rgba(45,27,14,0.95)',
          border: '2px solid #5c3d2e',
          borderRadius: 10,
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer',
          boxShadow: '0 4px 20px #000a',
          backdropFilter: 'blur(6px)',
          zIndex: 50,
        }}
      >
        <span style={{ fontSize: 20 }}>🧑‍💻</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 13, color: '#FFF8E7', letterSpacing: 1 }}>
            {crewName}
          </div>
          <div style={{ fontSize: 10, color: '#c8a878', fontFamily: "'Noto Sans KR', sans-serif" }}>
            MY PAGE
          </div>
        </div>
      </motion.button>

      {/* ── 게시판 모달 ── */}
      <AnimatePresence>
        {bulletinOpen && (
          <motion.div
            key="bulletin-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(3px)' }}
            onClick={() => setBulletinOpen(false)}
          >
            <Bulletin onClose={() => setBulletinOpen(false)} initialFloor={displayFloor} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 내 정보 모달 ── */}
      <AnimatePresence>
        {myPageOpen && (
          <MyPageModal onClose={() => setMyPageOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
