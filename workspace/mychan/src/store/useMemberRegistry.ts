import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member } from '@shared/types/01-member';

interface MemberRegistryStore {
  members: Member[];
  register:       (member: Member) => void;
  findByCrewName: (crewName: string) => Member | undefined;
  updateMember:   (member: Member) => void;
}

export const useMemberRegistry = create<MemberRegistryStore>()(
  persist(
    (set, get) => ({
      members: [],

      register: (member) =>
        set(s => ({ members: [...s.members, member] })),

      findByCrewName: (crewName) =>
        get().members.find(
          m => m.crewName.toLowerCase() === crewName.trim().toLowerCase()
        ),

      updateMember: (member) =>
        set(s => ({ members: s.members.map(m => m.id === member.id ? member : m) })),
    }),
    { name: 'woowa-forest-registry' }
  )
);
