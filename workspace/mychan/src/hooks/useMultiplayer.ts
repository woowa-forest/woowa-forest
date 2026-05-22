import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAuthStore } from '../store/useAuthStore';

export interface PlayerState {
  memberId: string;
  name: string;
  field: string;
  x: number;
  z: number;
  facing: number;
  emoji?: string | null;
}

export function useMultiplayer(floorId: number, currentMemberId: string | undefined) {
  const [players, setPlayers] = useState<Record<string, PlayerState>>({});
  const roomRef = useRef<RealtimeChannel | null>(null);

  const updateState = useCallback(async (state: PlayerState) => {
    if (roomRef.current && roomRef.current.state === 'joined') {
      await roomRef.current.track(state);
    }
  }, []);

  const sendBroadcast = useCallback((event: string, payload: any) => {
    if (roomRef.current && roomRef.current.state === 'joined') {
      roomRef.current.send({
        type: 'broadcast',
        event,
        payload
      });
    }
  }, []);

  useEffect(() => {
    if (!supabase || !currentMemberId) return;

    const room = supabase.channel(`floor-${floorId}`, {
      config: {
        presence: { key: currentMemberId },
      },
    });
    roomRef.current = room;

    room.on('presence', { event: 'sync' }, () => {
      const state = room.presenceState();
      const newPlayers: Record<string, PlayerState> = {};
      
      Object.keys(state).forEach((key) => {
        if (key !== currentMemberId) {
          const userStates = state[key] as any[];
          if (userStates && userStates.length > 0) {
            newPlayers[key] = userStates[0] as PlayerState;
          }
        }
      });
      setPlayers(newPlayers);
    });

    room.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const member = useAuthStore.getState().member;
        if (member) {
          await room.track({
            memberId: member.id,
            name: member.crewName,
            field: member.field,
            x: 22.5, z: 12.5,
            facing: 0
          });
        }
      }
    });

    return () => {
      room.unsubscribe();
      roomRef.current = null;
    };
  }, [floorId, currentMemberId]);

  return { players, updateState, sendBroadcast };
}
