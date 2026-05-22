import { motion } from 'framer-motion';
import { useMemberRegistry } from '../store/useMemberRegistry';
import { FIELD_LABEL, VILLAGE_LABEL } from '@shared/types/01-member';

const spring = { type: 'spring' as const, stiffness: 340, damping: 28 };

interface Props {
  memberId: string;
  onClose: () => void;
  onOpenDm: () => void;
}

export function OtherProfileModal({ memberId, onClose, onOpenDm }: Props) {
  const members = useMemberRegistry(s => s.members);
  const target = members.find(m => m.id === memberId);

  if (!target) return null;

  const FIELD_COLOR: Record<string, string> = {
    AN: '#4CAF50',
    FE: '#42A5F5',
    BE: '#FF8F00',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
            🌿 크루 프로필
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#c8a878', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* 컨텐츠 */}
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>🧑‍💻</div>
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 22, color: '#FFF8E7', letterSpacing: 2 }}>
            {target.crewName}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, marginBottom: 24 }}>
            <span style={{
              border: `1.5px solid ${FIELD_COLOR[target.field]}`,
              color: FIELD_COLOR[target.field],
              borderRadius: 20, padding: '2px 14px', fontSize: 11, fontFamily: "'DotGothic16', monospace"
            }}>
              {target.field}
            </span>
            <span style={{
              border: '1.5px solid #c8a05e',
              color: '#f5d580',
              borderRadius: 20, padding: '2px 14px', fontSize: 11, fontFamily: "'DotGothic16', monospace"
            }}>
              {VILLAGE_LABEL[target.village]}
            </span>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.2)', border: '1.5px solid #3d2010', borderRadius: 12,
            padding: '16px', minHeight: 60, textAlign: 'left', marginBottom: 24
          }}>
            <div style={{ fontSize: 10, color: '#8a6e5a', marginBottom: 6, fontFamily: "'DotGothic16', monospace" }}>BIO</div>
            <div style={{ fontSize: 13, color: '#d4b896', lineHeight: 1.6 }}>
              {target.bio || '등록된 한 마디가 없습니다.'}
            </div>
          </div>

          <motion.button
            onClick={onOpenDm}
            whileHover={{ scale: 1.05, backgroundColor: '#4caf50' }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '100%', background: '#2e7d32', color: '#fff', border: 'none',
              borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'DotGothic16', monospace", boxShadow: '0 4px 0 #1b5e20'
            }}
          >
            💬 DM 보내기
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
