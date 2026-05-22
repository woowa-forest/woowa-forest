import { motion, AnimatePresence } from 'framer-motion';
import type { Answer } from '@shared/types/03-post';

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60)    return '방금 전';
  if (s < 3600)  return `${Math.floor(s / 60)}분 전`;
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
  return `${Math.floor(s / 86400)}일 전`;
}

interface Props {
  answer:       Answer;
  isPostAuthor: boolean;
  hasAdopted:   boolean;
  onAdopt:      () => void;
  adoptLoading: boolean;
}

export function AnswerCard({ answer, isPostAuthor, hasAdopted, onAdopt, adoptLoading }: Props) {
  const canAdopt = isPostAuthor && !hasAdopted && !answer.isAdopted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: answer.isAdopted ? '#f0faf0' : '#fff',
        border: answer.isAdopted ? '2px solid #4caf50' : '1.5px solid #e8d9c8',
        borderRadius: 10,
        padding: '12px 16px',
        position: 'relative',
      }}
    >
      {/* 채택 배지 */}
      <AnimatePresence>
        {answer.isAdopted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute', top: 10, right: 12,
              background: '#4caf50',
              color: '#fff',
              borderRadius: 20,
              padding: '2px 10px',
              fontFamily: "'DotGothic16', monospace",
              fontSize: 10,
              letterSpacing: 0.5,
            }}
          >
            ✓ 채택
          </motion.div>
        )}
      </AnimatePresence>

      {/* 작성자 + 시간 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{
          background: '#f5ede0',
          border: '1px solid #c8b89a',
          borderRadius: 20,
          padding: '2px 9px',
          fontFamily: "'DotGothic16', monospace",
          fontSize: 11,
          color: '#5a3a1a',
        }}>
          {answer.authorName}
        </span>
        <span style={{ fontSize: 10, color: '#bbb' }}>{timeAgo(answer.createdAt)}</span>
      </div>

      {/* 본문 */}
      <div style={{
        fontSize: 13,
        fontFamily: "'Noto Sans KR', sans-serif",
        color: '#2D1B0E',
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
        paddingRight: answer.isAdopted ? 0 : 60,
      }}>
        {answer.body}
      </div>

      {/* 채택 버튼 */}
      {canAdopt && (
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
          <motion.button
            onClick={onAdopt}
            disabled={adoptLoading}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              background: '#1b3a1b',
              color: '#81c784',
              border: '1.5px solid #4caf50',
              borderRadius: 7,
              padding: '5px 14px',
              fontFamily: "'DotGothic16', monospace",
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {adoptLoading ? '처리 중...' : '✓ 채택하기'}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
