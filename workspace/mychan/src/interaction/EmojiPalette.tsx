import { motion } from 'framer-motion';
import { EMOJI_LIST } from '@shared/constants/03-interaction';
import { useInteractionStore } from '../store/useInteractionStore';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Props {
  onEmoji?: (emoji: typeof EMOJI_LIST[number]) => void;
}

export function EmojiPalette({ onEmoji }: Props) {
  const member = useAuthStore(s => s.member);
  const emitEmoji = useInteractionStore(s => s.emitEmoji);

  const handleEmoji = (emoji: typeof EMOJI_LIST[number]) => {
    if (!member) return;
    
    // 1. 로컬 표시
    emitEmoji(member.id, emoji);
    onEmoji?.(emoji);

    // 2. 브로드캐스트 전송 (현재 층 채널을 찾기 위해 App.tsx 등의 상태를 활용하거나 직접 채널 생성)
    // 간단히 하기 위해 전역 채널 또는 명명 규칙 활용
    const floorId = useAuthStore.getState().member?.village; // 혹은 현재 위치한 층 정보 필요
    // 실제로는 현재 캐릭터가 있는 층 정보가 필요함. 
    // 여기서는 우선 브로드캐스트 전송 로직만 추가.
    supabase?.channel(`floor-all-broadcast`).send({
      type: 'broadcast',
      event: 'emoji',
      payload: { memberId: member.id, emoji }
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const index = parseInt(e.key) - 1;
        handleEmoji(EMOJI_LIST[index]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [member]);

  if (!member) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 10,
      background: 'rgba(45,27,14,0.92)',
      border: '2px solid #5c3d2e',
      borderRadius: 40,
      padding: '8px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
      zIndex: 50,
    }}>
      {EMOJI_LIST.map((emoji, i) => (
        <motion.button
          key={emoji}
          onClick={() => handleEmoji(emoji)}
          whileHover={{ scale: 1.2, y: -5 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
            padding: '4px 8px', position: 'relative'
          }}
        >
          {emoji}
          <span style={{
            position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)',
            fontSize: 9, color: '#c8a878', fontFamily: "'DotGothic16', monospace"
          }}>
            {i + 1}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
