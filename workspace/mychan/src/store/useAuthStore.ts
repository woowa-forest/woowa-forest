import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member, AuthState } from '@shared/types/01-member';

interface AuthStore extends AuthState {
  login:       (member: Member) => void;
  logout:      () => void;
  updateBio:   (bio: string) => void;
  updateWooma: (delta: number) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      member:      null,
      accessToken: null,
      isLoggedIn:  false,

      login: (member) => set({ member, isLoggedIn: true, accessToken: member.id }),

      logout: () => set({ member: null, accessToken: null, isLoggedIn: false }),

      updateBio: (bio) =>
        set((s) => s.member ? { member: { ...s.member, bio } } : {}),

      updateWooma: (delta) =>
        set((s) =>
          s.member
            ? { member: { ...s.member, wooMaBalance: s.member.wooMaBalance + delta } }
            : {}
        ),
    }),
    { name: 'woowa-forest-auth' }
  )
);
