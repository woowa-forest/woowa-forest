import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapRenderer } from './map/01-MapRenderer';
import { LandingPage } from './pages/LandingPage';
import { MyPageModal } from './components/MyPageModal';
import { useAuthStore } from './store/useAuthStore';
import { VILLAGE_FLOOR } from '@shared/types/01-member';

const spring = { type: 'spring' as const, stiffness: 340, damping: 28 };

export default function App() {
  const member    = useAuthStore(s => s.member);
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);

  const [nearWell,     setNearWell]     = useState(false);
  const [bulletinOpen, setBulletinOpen] = useState(false);
  const [myPageOpen,   setMyPageOpen]   = useState(false);
  const [currentFloor, setCurrentFloor] = useState<number | null>(null);
  const [chatInput,    setChatInput]    = useState('');
  const [messages, setMessages] = useState<{ name: string; text: string; time: string }[]>([
    { name: 'snowshower', text: '점심 뭐 먹지... 🍜', time: '12:30' },
    { name: 'soojin',     text: '해장국이요!',         time: '12:30' },
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const crewName    = member?.crewName ?? 'you';
  const field       = member?.field    ?? 'FE';
  const initFloor   = member ? VILLAGE_FLOOR[member.village] : undefined;
  const displayFloor = currentFloor ?? initFloor ?? 12;

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const now  = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages(m => [...m, { name: crewName, text: chatInput, time }]);
    setChatInput('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const TABS = ['전체', '구리마을', '태초마을', '뽀롱뽀롱'];
  const POSTS = [
    { tag: '질문', title: 'Kotlin coroutine이 뭔가요?', author: 'snowshower', ans: 3 },
    { tag: '공유', title: '오늘 점심 메뉴 추천해드립니다',  author: 'soojin',     ans: 0 },
    { tag: '잡담', title: '누가 우물가에 있어요?',         author: 'eian',       ans: 1 },
  ];
  const TAG_STYLE: Record<string, { bg: string; color: string }> = {
    질문: { bg: '#e3f2fd', color: '#1565c0' },
    공유: { bg: '#e8f5e9', color: '#2e7d32' },
    잡담: { bg: '#fff3e0', color: '#e65100' },
  };

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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 24,
    }}>

      <MapRenderer
        playerName={crewName}
        playerField={field}
        initialFloor={initFloor}
        onNearWell={() => setNearWell(true)}
        onLeaveWell={() => setNearWell(false)}
        onInteractBulletin={() => setBulletinOpen(v => !v)}
        onFloorChange={(floor) => {
          setCurrentFloor(floor);
          setBulletinOpen(false);
          setNearWell(false);
        }}
      />

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
          padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
          cursor: 'pointer',
          boxShadow: '0 4px 20px #000a',
          backdropFilter: 'blur(6px)',
          zIndex: 50,
        }}
      >
        <span style={{ fontSize: 16 }}>🧑‍💻</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: '#FFF8E7', letterSpacing: 1 }}>
            {crewName}
          </div>
          <div style={{ fontSize: 10, color: '#c8a878', fontFamily: "'Noto Sans KR', sans-serif" }}>
            🪙 {member?.wooMaBalance.toLocaleString()}
          </div>
        </div>
      </motion.button>

      {/* ── 우물가 채팅창 ── */}
      <AnimatePresence>
        {nearWell && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 40, y: 20 }}
            transition={spring}
            style={{
              position: 'fixed', bottom: 20, right: 20,
              width: 320,
              background: 'rgba(45,27,14,0.97)',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 8px 40px #000a, 0 0 0 1.5px #7a5540',
              border: '2px solid #5c3d2e',
              zIndex: 50,
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* 헤더 */}
            <div style={{
              background: 'linear-gradient(90deg, #3d2010, #4a2a18)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid #5c3d2e',
            }}>
              <motion.span
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3 }}
                style={{ fontSize: 16, display: 'inline-block' }}
              >🪣</motion.span>
              <span style={{ color: '#FFF8E7', fontFamily: "'DotGothic16', monospace", fontSize: 13, flex: 1 }}>
                우물가 채팅 — {displayFloor}층
              </span>
              <span style={{ fontSize: 10, color: '#a07858', fontFamily: "'DotGothic16', monospace" }}>
                {messages.length}명
              </span>
            </div>

            {/* 메시지 목록 */}
            <div style={{ height: 160, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AnimatePresence initial={false}>
                {messages.map((m, i) => {
                  const isMe = m.name === crewName;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.85, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        style={{
                          background: isMe
                            ? 'linear-gradient(135deg, #1976d2, #1565c0)'
                            : 'linear-gradient(135deg, #6b4535, #5c3d2e)',
                          color: '#FFF8E7',
                          padding: '6px 11px',
                          borderRadius: isMe ? '13px 13px 3px 13px' : '13px 13px 13px 3px',
                          fontSize: 12,
                          fontFamily: "'Noto Sans KR', sans-serif",
                          maxWidth: 190,
                          boxShadow: isMe ? '0 2px 8px #1565c044' : '0 2px 8px #0004',
                        }}
                      >
                        {!isMe && <div style={{ fontSize: 10, color: '#c8a878', marginBottom: 3, fontWeight: 600 }}>{m.name}</div>}
                        {m.text}
                      </motion.div>
                      <span style={{ fontSize: 10, color: '#664', flexShrink: 0 }}>{m.time}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* 입력창 */}
            <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderTop: '1px solid #3d2010', background: 'rgba(0,0,0,0.2)' }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                style={{
                  flex: 1,
                  background: '#3d2010',
                  border: '1.5px solid #5c3d2e',
                  color: '#FFF8E7',
                  padding: '7px 11px',
                  borderRadius: 9,
                  fontSize: 12,
                  fontFamily: "'Noto Sans KR', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                placeholder="메시지 입력..."
              />
              <motion.button
                onClick={sendMessage}
                whileHover={{ scale: 1.05, backgroundColor: '#43a047' }}
                whileTap={{ scale: 0.93, y: 2 }}
                style={{
                  background: '#4caf50',
                  color: '#fff',
                  border: '2px solid #2e7d32',
                  padding: '7px 13px',
                  borderRadius: 9,
                  fontFamily: "'DotGothic16', monospace",
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: '0 3px 0 #2e7d32',
                  transition: 'background 0.15s',
                }}
              >
                전송
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <motion.div
              key="bulletin-modal"
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 30 }}
              transition={spring}
              style={{
                background: '#FFF8E7',
                borderRadius: 16,
                width: 490,
                overflow: 'hidden',
                boxShadow: '0 24px 80px #0009, 0 0 0 2px #c8a05e',
                border: '3px solid #5c3d2e',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div style={{ background: 'linear-gradient(90deg, #c8a05e, #b8904e)', padding: '13px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 16, color: '#2D1B0E' }}>
                  📋 게시판 — {displayFloor}F
                </span>
                <motion.button
                  onClick={() => setBulletinOpen(false)}
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#2D1B0E', lineHeight: 1 }}
                >✕</motion.button>
              </div>

              {/* 탭 */}
              <div style={{ display: 'flex', borderBottom: '2px solid #c8b89a', background: '#f5ede0', position: 'relative' }}>
                {TABS.map((tab, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1,
                      padding: '9px 0',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === i ? '3px solid #c8a05e' : '3px solid transparent',
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fontSize: 13,
                      fontWeight: activeTab === i ? 700 : 400,
                      color: activeTab === i ? '#8b4c10' : '#2D1B0E',
                      cursor: 'pointer',
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>

              {/* 게시글 목록 */}
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    {POSTS.map((p, i) => {
                      const ts = TAG_STYLE[p.tag] ?? { bg: '#eee', color: '#333' };
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07, ...spring }}
                          whileHover={{ scale: 1.018, y: -2, boxShadow: '0 6px 20px #0002' }}
                          whileTap={{ scale: 0.99 }}
                          style={{
                            background: '#fff',
                            borderRadius: 10,
                            padding: '12px 16px',
                            boxShadow: '0 2px 8px #0001',
                            border: '1px solid #e8d9c8',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <span style={{
                              background: ts.bg, color: ts.color,
                              borderRadius: 5, padding: '2px 7px', fontSize: 11, fontWeight: 700, marginRight: 8,
                            }}>{p.tag}</span>
                            <span style={{ fontFamily: "'Noto Sans KR'", fontSize: 13, color: '#2D1B0E', fontWeight: 700 }}>{p.title}</span>
                            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{p.author}</div>
                          </div>
                          <div style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>💬 {p.ans}</div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 하단 */}
              <div style={{ padding: '0 20px 16px', textAlign: 'right' }}>
                <motion.button
                  whileHover={{ scale: 1.04, backgroundColor: '#d4aa68' }}
                  whileTap={{ scale: 0.96, y: 2 }}
                  style={{
                    background: '#c8a05e',
                    color: '#2D1B0E',
                    border: '2px solid #8b6444',
                    borderRadius: 9,
                    padding: '8px 20px',
                    fontFamily: "'DotGothic16', monospace",
                    fontSize: 12,
                    cursor: 'pointer',
                    boxShadow: '0 3px 0 #8b6444',
                    fontWeight: 700,
                    transition: 'background 0.15s',
                  }}
                >
                  + 글쓰기
                </motion.button>
              </div>
            </motion.div>
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
