import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInteractionStore } from '../store/useInteractionStore';
import { useAuthStore } from '../store/useAuthStore';
import { useMemberRegistry } from '../store/useMemberRegistry';

interface Props {
  targetId: string;
  onClose: () => void;
}

export function DmPanel({ targetId, onClose }: Props) {
  const member = useAuthStore(s => s.member);
  const findByCrewName = useMemberRegistry(s => s.members); // Actually we need findById
  const targetMember = findByCrewName.find(m => m.id === targetId);

  const dmMessages = useInteractionStore(s => s.dmMessages);
  const sendDm = useInteractionStore(s => s.sendDm);
  const clearUnread = useInteractionStore(s => s.clearUnread);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate deterministic roomId
  const roomId = [member?.id, targetId].sort().join('-');

  const messages = dmMessages[roomId] || [];

  const handleSend = () => {
    if (!input.trim() || !member) return;
    sendDm(roomId, member.id, member.crewName, input.trim());
    setInput('');
  };

  useEffect(() => {
    clearUnread(roomId);
  }, [roomId, clearUnread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!member || !targetMember) return null;

  return (
    <motion.div
      initial={{ x: 340 }}
      animate={{ x: 0 }}
      exit={{ x: 340 }}
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 320,
        background: 'rgba(30,18,8,0.98)',
        borderLeft: '2px solid #5c3d2e',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(90deg, #3d2010, #4a2a18)',
        borderBottom: '1px solid #5c3d2e',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>💬</span>
          <div>
            <div style={{ fontSize: 12, color: '#c8a878', fontFamily: "'DotGothic16', monospace" }}>DM WITH</div>
            <div style={{ fontSize: 14, color: '#FFF8E7', fontWeight: 700 }}>{targetMember.crewName}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#c8a878', fontSize: 20, cursor: 'pointer' }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#664', fontSize: 12, marginTop: 40 }}>
            대화가 없습니다.<br/>인사를 건네보세요!
          </div>
        )}
        {messages.map(m => {
          const isMe = m.senderId === member.id;
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6 }}>
              <div style={{
                background: isMe ? '#1976d2' : '#3d2010',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                fontSize: 13,
                maxWidth: '80%',
                wordBreak: 'break-word',
              }}>
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid #5c3d2e' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="메시지 입력..."
            style={{
              flex: 1, background: '#1e1208', border: '1.5px solid #5c3d2e', color: '#fff',
              padding: '8px 12px', borderRadius: 8, fontSize: 13, outline: 'none'
            }}
          />
          <button
            onClick={handleSend}
            style={{
              background: '#4caf50', color: '#fff', border: 'none',
              padding: '0 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 700
            }}
          >
            전송
          </button>
        </div>
      </div>
    </motion.div>
  );
}
