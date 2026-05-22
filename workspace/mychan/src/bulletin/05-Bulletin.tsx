import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PostList } from './05-PostList';
import { PostDetail } from './05-PostDetail';
import { PostForm } from './05-PostForm';
import { useAuthStore } from '../store/useAuthStore';
import { VILLAGE_FLOOR } from '@shared/types/01-member';

const spring = { type: 'spring' as const, stiffness: 340, damping: 28 };

type View = { type: 'LIST' } | { type: 'DETAIL'; postId: string } | { type: 'FORM'; editPostId?: string };

interface Props {
  onClose: () => void;
  initialFloor?: number;
}

export function Bulletin({ onClose, initialFloor }: Props) {
  const member = useAuthStore(s => s.member);
  const defaultFloor = initialFloor ?? (member ? VILLAGE_FLOOR[member.village] : 12);

  const [view,      setView]      = useState<View>({ type: 'LIST' });
  const [activeTab, setActiveTab] = useState<number | 'ALL'>(defaultFloor);

  const TABS = [
    { label: '전체', value: 'ALL' as const },
    { label: '구리마을', value: 11 },
    { label: '태초마을', value: 12 },
    { label: '뽀롱뽀롱', value: 13 },
  ];

  const handlePostClick = (postId: string) => {
    setView({ type: 'DETAIL', postId });
  };

  const handleCreateClick = () => {
    setView({ type: 'FORM' });
  };

  const handleEditClick = (postId: string) => {
    setView({ type: 'FORM', editPostId: postId });
  };

  const handleFormSubmitted = (postId: string) => {
    setView({ type: 'DETAIL', postId });
  };

  return (
    <motion.div
      key="bulletin-modal"
      initial={{ opacity: 0, scale: 0.88, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 30 }}
      transition={spring}
      style={{
        background: '#FFF8E7',
        borderRadius: 16,
        width: 520,
        height: 640,
        overflow: 'hidden',
        boxShadow: '0 24px 80px #0009, 0 0 0 2px #c8a05e',
        border: '3px solid #5c3d2e',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Root Header (only visible in LIST view) */}
      {view.type === 'LIST' && (
        <>
          <div style={{ background: 'linear-gradient(90deg, #c8a05e, #b8904e)', padding: '13px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 16, color: '#2D1B0E' }}>
              📋 마을 게시판
            </span>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.18 }}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#2D1B0E', lineHeight: 1 }}
            >✕</motion.button>
          </div>

          <div style={{ display: 'flex', borderBottom: '2px solid #c8b89a', background: '#f5ede0', position: 'relative' }}>
            {TABS.map((tab) => (
              <motion.button
                key={tab.label}
                onClick={() => setActiveTab(tab.value)}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.value ? '3px solid #c8a05e' : '3px solid transparent',
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontSize: 13,
                  fontWeight: activeTab === tab.value ? 700 : 400,
                  color: activeTab === tab.value ? '#8b4c10' : '#2D1B0E',
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </>
      )}

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {view.type === 'LIST' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <PostList floor={activeTab} onPostClick={handlePostClick} />
              <div style={{ padding: '0 20px 16px', textAlign: 'right', position: 'absolute', bottom: 0, right: 0 }}>
                <motion.button
                  onClick={handleCreateClick}
                  whileHover={{ scale: 1.04, backgroundColor: '#d4aa68' }}
                  whileTap={{ scale: 0.96, y: 2 }}
                  style={{
                    background: '#c8a05e',
                    color: '#2D1B0E',
                    border: '2px solid #8b6444',
                    borderRadius: 30,
                    padding: '10px 24px',
                    fontFamily: "'DotGothic16', monospace",
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 #8b6444',
                    fontWeight: 700,
                    transition: 'background 0.15s',
                  }}
                >
                  + 글쓰기
                </motion.button>
              </div>
            </motion.div>
          )}

          {view.type === 'DETAIL' && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              <PostDetail
                postId={view.postId}
                onBack={() => setView({ type: 'LIST' })}
                onEdit={() => handleEditClick(view.postId)}
              />
            </motion.div>
          )}

          {view.type === 'FORM' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              <PostForm
                editPostId={view.editPostId}
                onClose={() => view.editPostId ? setView({ type: 'DETAIL', postId: view.editPostId }) : setView({ type: 'LIST' })}
                onSubmitted={handleFormSubmitted}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
