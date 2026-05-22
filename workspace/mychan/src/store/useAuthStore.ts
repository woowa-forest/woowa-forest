import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member, AuthState } from '@shared/types/01-member';
import type { WoomaTransaction, WoomaReason, Attendance } from '@shared/types/04-economy';
import { WOOMA_REWARD, CHECKIN_EARLY_THRESHOLD, CHECKOUT_OPEN_TIME, CHECKOUT_LATE_THRESHOLD } from '@shared/constants/03-economy';

interface AuthStore extends AuthState {
  transactions: WoomaTransaction[];
  attendance: Attendance | null; // Today's attendance
  
  login:       (member: Member) => void;
  logout:      () => void;
  updateBio:   (bio: string) => void;
  
  addTransaction: (amount: number, reason: WoomaReason, refId?: string | null) => void;
  checkIn:  () => { ok: boolean; earned: number; code?: string };
  checkOut: () => { ok: boolean; earned: number; code?: string };
  syncGithub: (commits: number) => { ok: boolean; earned: number };
}

const getToday = () => new Date().toISOString().split('T')[0];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      member:      null,
      accessToken: null,
      isLoggedIn:  false,
      transactions: [],
      attendance: null,

      login: (member) => {
        // Reset attendance if day changed
        const today = getToday();
        set((s) => ({ 
          member, 
          isLoggedIn: true, 
          accessToken: member.id,
          attendance: s.attendance?.date === today ? s.attendance : null
        }));
      },

      logout: () => set({ member: null, accessToken: null, isLoggedIn: false }),

      updateBio: (bio) =>
        set((s) => s.member ? { member: { ...s.member, bio } } : {}),

      addTransaction: (amount, reason, refId = null) => {
        const member = get().member;
        if (!member) return;

        const tx: WoomaTransaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          memberId: member.id,
          amount,
          reason,
          refId,
          createdAt: new Date().toISOString(),
        };

        set((s) => ({
          member: s.member ? { ...s.member, wooMaBalance: s.member.wooMaBalance + amount } : null,
          transactions: [tx, ...s.transactions].slice(0, 100), // Keep last 100
        }));
      },

      checkIn: () => {
        const { member, attendance, addTransaction } = get();
        if (!member) return { ok: false, earned: 0 };
        
        const today = getToday();
        if (attendance?.date === today && attendance.checkInAt) {
          return { ok: false, earned: 0, code: 'ALREADY_CHECKED_IN' };
        }

        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 5); // HH:mm
        const isEarly = timeStr < CHECKIN_EARLY_THRESHOLD;
        const reward = isEarly ? WOOMA_REWARD.CHECKIN_EARLY : WOOMA_REWARD.CHECKIN_LATE;

        const newAttendance: Attendance = {
          memberId: member.id,
          date: today,
          checkInAt: now.toISOString(),
          checkOutAt: attendance?.checkOutAt || null,
        };

        set({ attendance: newAttendance });
        addTransaction(reward, 'CHECKIN');
        
        return { ok: true, earned: reward };
      },

      checkOut: () => {
        const { member, attendance, addTransaction } = get();
        if (!member) return { ok: false, earned: 0 };
        if (!attendance?.checkInAt) return { ok: false, earned: 0, code: 'CHECKIN_REQUIRED' };
        if (attendance.checkOutAt) return { ok: false, earned: 0, code: 'ALREADY_CHECKED_OUT' };

        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 5); // HH:mm
        
        if (timeStr < CHECKOUT_OPEN_TIME) {
          return { ok: false, earned: 0, code: 'CHECKOUT_NOT_AVAILABLE_YET' };
        }

        const isLate = timeStr >= CHECKOUT_LATE_THRESHOLD;
        const reward = isLate ? WOOMA_REWARD.CHECKOUT_LATE : WOOMA_REWARD.CHECKOUT_NORMAL;

        const newAttendance: Attendance = {
          ...attendance,
          checkOutAt: now.toISOString(),
        };

        set({ attendance: newAttendance });
        addTransaction(reward, 'CHECKOUT');

        return { ok: true, earned: reward };
      },

      syncGithub: (commits) => {
        const { member, addTransaction } = get();
        if (!member || commits <= 0) return { ok: false, earned: 0 };

        const reward = commits * WOOMA_REWARD.COMMIT;
        addTransaction(reward, 'GITHUB_COMMIT');
        
        set((s) => ({
          member: s.member ? { ...s.member, lastGithubSyncTime: new Date().toISOString() } : null
        }));

        return { ok: true, earned: reward };
      },
    }),
    { name: 'woowa-forest-auth' }
  )
);
