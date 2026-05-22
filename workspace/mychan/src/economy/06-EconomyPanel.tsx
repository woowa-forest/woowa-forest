import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

const spring = { type: 'spring' as const, stiffness: 340, damping: 28 };

export function EconomyPanel() {
  const { member, attendance, checkIn, checkOut } = useAuthStore();
  
  if (!member) return null;

  const handleCheckIn = () => {
    const res = checkIn();
    if (res.ok) {
      alert(`출근 완료! ${res.earned}우마를 획득했습니다.`);
    } else {
      if (res.code === 'ALREADY_CHECKED_IN') alert('이미 출근하셨습니다.');
    }
  };

  const handleCheckOut = () => {
    const res = checkOut();
    if (res.ok) {
      alert(`퇴근 완료! ${res.earned}우마를 획득했습니다.`);
    } else {
      if (res.code === 'CHECKOUT_NOT_AVAILABLE_YET') alert('18:00 이후에 퇴근 가능합니다.');
      else if (res.code === 'CHECKIN_REQUIRED') alert('출근 먼저 해주세요!');
      else if (res.code === 'ALREADY_CHECKED_OUT') alert('이미 퇴근하셨습니다.');
    }
  };

  const hasCheckedIn = !!attendance?.checkInAt;
  const hasCheckedOut = !!attendance?.checkOutAt;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 20,
      display: 'flex', flexDirection: 'column', gap: 10,
      zIndex: 50,
    }}>
      {/* Balance HUD */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{
          background: 'rgba(45,27,14,0.95)',
          border: '2px solid #5c3d2e',
          borderRadius: 12,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 4px 20px #000a',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div style={{ fontSize: 20 }}>🌿</div>
        <div>
          <div style={{ fontSize: 10, color: '#c8a878', fontFamily: "'DotGothic16', monospace" }}>MY BALANCE</div>
          <div style={{ 
            fontSize: 18, 
            color: '#FFF8E7', 
            fontFamily: "'DotGothic16', monospace",
            fontWeight: 700,
            letterSpacing: 1,
          }}>
            {member.wooMaBalance.toLocaleString()} <span style={{ fontSize: 12, color: '#c8a878' }}>UM</span>
          </div>
        </div>
      </motion.div>

      {/* Attendance Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button
          onClick={handleCheckIn}
          disabled={hasCheckedIn}
          whileHover={hasCheckedIn ? {} : { scale: 1.05 }}
          whileTap={hasCheckedIn ? {} : { scale: 0.95 }}
          style={{
            flex: 1,
            background: hasCheckedIn ? '#2d1b0e' : '#4caf50',
            color: hasCheckedIn ? '#5c3d2e' : '#fff',
            border: `2px solid ${hasCheckedIn ? '#3d2010' : '#2e7d32'}`,
            borderRadius: 10,
            padding: '8px 16px',
            fontFamily: "'DotGothic16', monospace",
            fontSize: 12,
            cursor: hasCheckedIn ? 'default' : 'pointer',
            boxShadow: hasCheckedIn ? 'none' : '0 3px 0 #2e7d32',
            opacity: hasCheckedIn ? 0.7 : 1,
          }}
        >
          {hasCheckedIn ? '출근 완료' : '출근하기'}
        </motion.button>
        <motion.button
          onClick={handleCheckOut}
          disabled={hasCheckedOut}
          whileHover={hasCheckedOut ? {} : { scale: 1.05 }}
          whileTap={hasCheckedOut ? {} : { scale: 0.95 }}
          style={{
            flex: 1,
            background: hasCheckedOut ? '#2d1b0e' : '#ff9800',
            color: hasCheckedOut ? '#5c3d2e' : '#fff',
            border: `2px solid ${hasCheckedOut ? '#3d2010' : '#e65100'}`,
            borderRadius: 10,
            padding: '8px 16px',
            fontFamily: "'DotGothic16', monospace",
            fontSize: 12,
            cursor: hasCheckedOut ? 'default' : 'pointer',
            boxShadow: hasCheckedOut ? 'none' : '0 3px 0 #e65100',
            opacity: hasCheckedOut ? 0.7 : 1,
          }}
        >
          {hasCheckedOut ? '퇴근 완료' : '퇴근하기'}
        </motion.button>
      </div>
    </div>
  );
}
