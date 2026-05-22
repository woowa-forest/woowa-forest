import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { GITHUB_SYNC_COOLDOWN_MS } from '@shared/constants/03-economy';

export function GithubHarvest() {
  const { member, syncGithub } = useAuthStore();
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!member?.lastGithubSyncTime) return;
    
    const updateCooldown = () => {
      const last = new Date(member.lastGithubSyncTime!).getTime();
      const diff = Date.now() - last;
      const remaining = Math.max(0, GITHUB_SYNC_COOLDOWN_MS - diff);
      setCooldown(Math.ceil(remaining / 1000));
    };

    updateCooldown();
    const timer = setInterval(updateCooldown, 1000);
    return () => clearInterval(timer);
  }, [member?.lastGithubSyncTime]);

  const handleHarvest = async () => {
    if (cooldown > 0 || loading) return;
    
    setLoading(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));
    
    // Simulate finding commits (random 1~5 for demo)
    const mockCommits = Math.floor(Math.random() * 5) + 1;
    const res = syncGithub(mockCommits);
    
    setLoading(false);
    if (res.ok) {
      alert(`GitHub 커밋 ${mockCommits}개를 수확하여 ${res.earned}우마를 획득했습니다! 🌿`);
    }
  };

  const isInCooldown = cooldown > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, color: '#8b4c10', fontWeight: 700, fontFamily: "'DotGothic16', monospace" }}>
        GITHUB HARVEST
      </div>
      <motion.button
        onClick={handleHarvest}
        disabled={isInCooldown || loading}
        whileHover={isInCooldown ? {} : { scale: 1.02 }}
        whileTap={isInCooldown ? {} : { scale: 0.98 }}
        style={{
          background: isInCooldown ? '#f5ede0' : 'linear-gradient(135deg, #24292e, #1a1e22)',
          color: isInCooldown ? '#c8b89a' : '#fff',
          border: `2px solid ${isInCooldown ? '#e8d9c8' : '#000'}`,
          borderRadius: 10,
          padding: '12px',
          cursor: isInCooldown || loading ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isInCooldown ? 'none' : '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        <span style={{ fontSize: 16 }}>{loading ? '⏳' : '🐙'}</span>
        <span style={{ 
          fontFamily: "'DotGothic16', monospace", 
          fontSize: 13, 
          letterSpacing: 0.5,
          fontWeight: 700 
        }}>
          {loading ? '수확 중...' : isInCooldown ? `${cooldown}s 대기` : '우마 수확하기'}
        </span>
        
        {/* Cooldown progress bar */}
        {isInCooldown && (
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: cooldown, ease: 'linear' }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 3,
              background: '#c8a05e',
              opacity: 0.5,
            }}
          />
        )}
      </motion.button>
      <div style={{ fontSize: 10, color: '#999', lineHeight: 1.4 }}>
        마지막 수확: {member?.lastGithubSyncTime ? new Date(member.lastGithubSyncTime).toLocaleTimeString() : '없음'}
      </div>
    </div>
  );
}
