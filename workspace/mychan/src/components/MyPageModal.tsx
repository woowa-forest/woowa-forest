import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useMemberRegistry } from '../store/useMemberRegistry';
import { FIELD_LABEL, VILLAGE_LABEL } from '@shared/types/01-member';

const spring = { type: 'spring' as const, stiffness: 340, damping: 28 };

interface Props {
  onClose: () => void;
}

export function MyPageModal({ onClose }: Props) {
  const member        = useAuthStore(s => s.member);
  const updateBio     = useAuthStore(s => s.updateBio);
  const logout        = useAuthStore(s => s.logout);
  const updateMember  = useMemberRegistry(s => s.updateMember);

  const [editingBio, setEditingBio] = useState(false);
  const [bioInput,   setBioInput]   = useState(member?.bio ?? '');
  const [saved,      setSaved]      = useState(false);

  if (!member) return null;

  const saveBio = () => {
    const trimmed = bioInput.trim();
    updateBio(trimmed);
    updateMember({ ...member, bio: trimmed });
    setEditingBio(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const FIELD_COLOR: Record<string, string> = {
    AN: '#4CAF50',
    FE: '#42A5F5',
    BE: '#FF8F00',
  };

  return (
    <motion.div
      key="mypage-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={spring}
        style={{
          background: 'rgba(30,18,8,0.98)',
          border: '2px solid #5c3d2e',
          borderRadius: 18,
          width: 360,
          overflow: 'hidden',
          boxShadow: '0 24px 80px #000b, 0 0 0 1px #7a5540',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{
          background: 'linear-gradient(90deg, #3d2010, #4a2a18)',
          padding: '14px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid #5c3d2e',
        }}>
          <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 15, color: '#FFF8E7' }}>
            🌿 내 정보
          </span>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.18 }}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#c8a878', lineHeight: 1 }}
          >✕</motion.button>
        </div>

        {/* 아바타 + 이름 */}
        <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 52, marginBottom: 10 }}
          >
            🧑‍💻
          </motion.div>
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 20, color: '#FFF8E7', letterSpacing: 2 }}>
            {member.crewName}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
            <span style={{
              background: FIELD_COLOR[member.field] + '22',
              border: `1.5px solid ${FIELD_COLOR[member.field]}`,
              color: FIELD_COLOR[member.field],
              borderRadius: 20,
              padding: '2px 12px',
              fontFamily: "'DotGothic16', monospace",
              fontSize: 11,
            }}>
              {member.field} · {FIELD_LABEL[member.field]}
            </span>
            <span style={{
              background: '#c8a05e22',
              border: '1.5px solid #c8a05e',
              color: '#f5d580',
              borderRadius: 20,
              padding: '2px 12px',
              fontFamily: "'DotGothic16', monospace",
              fontSize: 11,
            }}>
              {VILLAGE_LABEL[member.village]}
            </span>
          </div>
        </div>

        {/* 정보 카드들 */}
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* 우마 잔액 */}
          <div style={{
            background: '#2a1e0a',
            border: '1.5px solid #5c3d2e',
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: '#c8a878' }}>우마 잔액</span>
            <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 16, color: '#f5d580' }}>
              🪙 {member.wooMaBalance.toLocaleString()}
            </span>
          </div>

          {/* GitHub */}
          {member.githubId && (
            <div style={{
              background: '#1a2218',
              border: '1.5px solid #3a5a30',
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: '#81c784' }}>GitHub</span>
              <span style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 12, color: '#a5d6a7' }}>
                @{member.githubId}
              </span>
            </div>
          )}

          {/* 한 마디 */}
          <div style={{
            background: '#1e1208',
            border: '1.5px solid #5c3d2e',
            borderRadius: 10,
            padding: '12px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: '#c8a878' }}>한 마디</span>
              <motion.button
                onClick={() => { setEditingBio(v => !v); setBioInput(member.bio); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: editingBio ? '#3b1010' : '#2a3d1a',
                  border: `1px solid ${editingBio ? '#ef5350' : '#4caf50'}`,
                  color: editingBio ? '#ef9a9a' : '#81c784',
                  borderRadius: 6,
                  padding: '2px 10px',
                  fontFamily: "'DotGothic16', monospace",
                  fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                {editingBio ? '취소' : '수정'}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {editingBio ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <textarea
                    value={bioInput}
                    onChange={e => setBioInput(e.target.value.slice(0, 100))}
                    rows={2}
                    autoFocus
                    style={{
                      width: '100%',
                      background: '#0d0a06',
                      border: '1.5px solid #5c3d2e',
                      color: '#FFF8E7',
                      padding: '8px 10px',
                      borderRadius: 7,
                      fontSize: 12,
                      fontFamily: "'Noto Sans KR', sans-serif",
                      outline: 'none',
                      resize: 'none',
                      lineHeight: 1.6,
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: '#664' }}>{bioInput.length}/100</span>
                    <motion.button
                      onClick={saveBio}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95, y: 1 }}
                      style={{
                        background: '#4caf50',
                        color: '#fff',
                        border: '2px solid #2e7d32',
                        borderRadius: 7,
                        padding: '4px 14px',
                        fontFamily: "'DotGothic16', monospace",
                        fontSize: 11,
                        cursor: 'pointer',
                        boxShadow: '0 2px 0 #2e7d32',
                      }}
                    >
                      저장
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: 12,
                    color: member.bio ? '#d4b896' : '#664',
                    lineHeight: 1.6,
                    fontStyle: member.bio ? 'normal' : 'italic',
                  }}
                >
                  {member.bio || '아직 한 마디가 없어요 🌱'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 저장 완료 토스트 */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: 10, color: '#81c784', marginTop: 4 }}
                >
                  ✓ 저장되었어요
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 로그아웃 */}
        <div style={{ padding: '0 24px 20px', textAlign: 'center' }}>
          <motion.button
            onClick={() => { logout(); onClose(); }}
            whileHover={{ scale: 1.03, backgroundColor: '#4a1810' }}
            whileTap={{ scale: 0.97, y: 1 }}
            style={{
              background: '#3b1010',
              color: '#ef9a9a',
              border: '1.5px solid #ef5350',
              borderRadius: 9,
              padding: '9px 28px',
              fontFamily: "'DotGothic16', monospace",
              fontSize: 12,
              cursor: 'pointer',
              transition: 'background 0.15s',
              letterSpacing: 1,
            }}
          >
            숲에서 나가기
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
