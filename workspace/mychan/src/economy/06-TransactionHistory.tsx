import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { WoomaReason } from '@shared/types/04-economy';

const REASON_LABELS: Record<WoomaReason, string> = {
  GITHUB_COMMIT: 'GitHub 커밋 수확',
  CHECKIN:        '출근 보상',
  CHECKOUT:       '퇴근 보상',
  ANSWER_ADOPTED: '답변 채택 보상',
  SHOP_PURCHASE:  '상점 아이템 구매',
  GAME_WIN:       '미니게임 승리',
  GAME_LOSE:      '미니게임 판돈 지불',
};

const REASON_ICONS: Record<WoomaReason, string> = {
  GITHUB_COMMIT: '🐙',
  CHECKIN:        '🌅',
  CHECKOUT:       '🌇',
  ANSWER_ADOPTED: '✅',
  SHOP_PURCHASE:  '🛒',
  GAME_WIN:       '🏆',
  GAME_LOSE:      '🎲',
};

export function TransactionHistory() {
  const transactions = useAuthStore(s => s.transactions);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto', paddingRight: 4 }}>
      {transactions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 0',
          color: '#999',
          fontFamily: "'DotGothic16', monospace",
          fontSize: 13,
        }}>
          거래 내역이 없습니다.
        </div>
      ) : (
        transactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: '#fff',
              border: '1px solid #e8d9c8',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: 36, height: 36, 
                borderRadius: '50%', 
                background: '#fdf8ef', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
                border: '1px solid #e8d9c8'
              }}>
                {REASON_ICONS[tx.reason]}
              </div>
              <div>
                <div style={{ 
                  fontFamily: "'Noto Sans KR', sans-serif", 
                  fontSize: 13, 
                  fontWeight: 700, 
                  color: '#2D1B0E' 
                }}>
                  {REASON_LABELS[tx.reason]}
                </div>
                <div style={{ fontSize: 10, color: '#999' }}>
                  {new Date(tx.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div style={{ 
              fontFamily: "'DotGothic16', monospace", 
              fontSize: 14, 
              fontWeight: 700,
              color: tx.amount > 0 ? '#2e7d32' : '#c62828'
            }}>
              {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} 🌿
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
