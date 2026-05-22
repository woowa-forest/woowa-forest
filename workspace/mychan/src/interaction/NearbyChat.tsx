import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInteractionStore } from '../store/useInteractionStore';
import { useAuthStore } from '../store/useAuthStore';
import { INTERACTION_CONFIG } from '@shared/constants/03-interaction';

const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };

interface Props {
  floorId: number;
}

export function NearbyChat({ floorId }: Props) {
  const member = useAuthStore(s => s.member);
  const nearbyMessages = useInteractionStore(s => s.nearbyMessages);
  const sendNearbyChat = useInteractionStore(s => s.sendNearbyChat);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomId = `floor-${floorId}-well`;

  const messages = nearbyMessages.filter(m => m.roomId === roomId);

  const handleSend = () => {
    if (!input.trim() || !member) return;
    sendNearbyChat(roomId, member.id, member.crewName, input.trim());
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!member) return null;

  return (
    <motion.div
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
      {/* Header */}
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
          우물가 채팅 — {floorId}층
        </span>
      </div>

      {/* Messages */}
      <div style={{ height: 180, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isMe = m.senderId === member.id;
            const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6 }}
              >
                <div style={{
                  background: isMe ? 'linear-gradient(135deg, #1976d2, #1565c0)' : 'linear-gradient(135deg, #6b4535, #5c3d2e)',
                  color: '#FFF8E7',
                  padding: '6px 11px',
                  borderRadius: isMe ? '13px 13px 3px 13px' : '13px 13px 13px 3px',
                  fontSize: 12,
                  fontFamily: "'Noto Sans KR', sans-serif",
                  maxWidth: 190,
                  boxShadow: '0 2px 8px #0004',
                }}>
                  {!isMe && <div style={{ fontSize: 10, color: '#c8a878', marginBottom: 3, fontWeight: 600 }}>{m.senderName}</div>}
                  {m.content}
                </div>
                <span style={{ fontSize: 9, color: '#664', flexShrink: 0 }}>{time}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderTop: '1px solid #3d2010', background: 'rgba(0,0,0,0.2)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value.slice(0, INTERACTION_CONFIG.CHAT_MAX_LENGTH))}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="메시지 입력..."
          style={{
            flex: 1, background: '#3d2010', border: '1.5px solid #5c3d2e', color: '#FFF8E7',
            padding: '7px 11px', borderRadius: 9, fontSize: 12, fontFamily: "'Noto Sans KR', sans-serif", outline: 'none',
          }}
        />
        <motion.button
          onClick={handleSend}
          whileHover={{ scale: 1.05, backgroundColor: '#43a047' }}
          whileTap={{ scale: 0.93, y: 2 }}
          style={{
            background: '#4caf50', color: '#fff', border: '2px solid #2e7d32',
            padding: '7px 13px', borderRadius: 9, fontFamily: "'DotGothic16', monospace", fontSize: 12, cursor: 'pointer',
            boxShadow: '0 3px 0 #2e7d32',
          }}
        >
          전송
        </motion.button>
      </div>
    </motion.div>
  );
}
