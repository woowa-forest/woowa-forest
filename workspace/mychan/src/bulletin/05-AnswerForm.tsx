import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBulletinStore } from '../store/useBulletinStore';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  postId:     string;
  onSubmitted: () => void;
}

export function AnswerForm({ postId, onSubmitted }: Props) {
  const member       = useAuthStore(s => s.member);
  const createAnswer = useBulletinStore(s => s.createAnswer);

  const [body,    setBody]    = useState('');
  const [loading, setLoading] = useState(false);

  if (!member) return null;

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 200));
    createAnswer({
      postId,
      authorId:   member.id,
      authorName: member.crewName,
      body:       body.trim(),
    });
    setBody('');
    setLoading(false);
    onSubmitted();
  };

  return (
    <div style={{
      borderTop: '1.5px solid #e8d9c8',
      paddingTop: 14,
      marginTop: 4,
    }}>
      <div style={{
        fontFamily: "'DotGothic16', monospace",
        fontSize: 12,
        color: '#8b4c10',
        marginBottom: 8,
      }}>
        답변 작성
      </div>
      <textarea
        value={body}
        onChange={e => setBody(e.target.value.slice(0, 3000))}
        placeholder="답변을 입력하세요 (최대 3,000자)"
        rows={3}
        style={{
          width: '100%',
          background: '#fff',
          border: '1.5px solid #c8b89a',
          borderRadius: 8,
          padding: '9px 12px',
          fontSize: 13,
          fontFamily: "'Noto Sans KR', sans-serif",
          color: '#2D1B0E',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
          lineHeight: 1.6,
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#c8a05e'; }}
        onBlur={e => { e.currentTarget.style.borderColor = '#c8b89a'; }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 10, color: '#bbb' }}>{body.length}/3000</span>
        <motion.button
          onClick={handleSubmit}
          disabled={!body.trim() || loading}
          whileHover={{ scale: body.trim() ? 1.04 : 1 }}
          whileTap={{ scale: 0.96 }}
          style={{
            background: body.trim() ? '#c8a05e' : '#e8d9c8',
            color: body.trim() ? '#2D1B0E' : '#bbb',
            border: '2px solid ' + (body.trim() ? '#8b6444' : '#e8d9c8'),
            borderRadius: 8,
            padding: '7px 20px',
            fontFamily: "'DotGothic16', monospace",
            fontSize: 12,
            cursor: body.trim() ? 'pointer' : 'default',
            boxShadow: body.trim() ? '0 2px 0 #8b6444' : 'none',
            transition: 'all 0.15s',
          }}
        >
          {loading ? '등록 중...' : '답변 등록'}
        </motion.button>
      </div>
    </div>
  );
}
