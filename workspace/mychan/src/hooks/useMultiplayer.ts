import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAuthStore } from '../store/useAuthStore';
import { useInteractionStore } from '../store/useInteractionStore';

export interface PlayerState {
  memberId: string;
  name: string;
  field: string;
  x: number;
  z: number;
  facing: number;
}

export function useMultiplayer(floorId: number, currentMemberId: string | undefined) {
  const [players, setPlayers] = useState<Record<string, PlayerState>>({});
  const roomRef = useRef<RealtimeChannel | null>(null);
  
  const emitEmoji = useInteractionStore(s => s.emitEmoji);
  const addNearbyMsg = useInteractionStore(s => s.sendNearbyChat);

  // 1. 공통 전송 함수 (이모지, 채팅 공용)
  const sendBroadcast = useCallback((event: 'emoji' | 'chat', payload: any) => {
    if (roomRef.current && roomRef.current.state === 'joined') {
      roomRef.current.send({
        type: 'broadcast',
        event,
        payload: { ...payload, floorId } // 층 정보 추가
      });
    }
  }, [floorId]);

  // 2. 위치 업데이트 함수
  const updateState = useCallback(async (state: PlayerState) => {
    if (roomRef.current && roomRef.current.state === 'joined') {
      await roomRef.current.track(state);
    }
  }, []);

  useEffect(() => {
    if (!supabase || !currentMemberId) return;

    // 모든 실시간 통신을 하나의 채널로 통합 (Presence + Broadcast)
    const room = supabase.channel(`village-floor-${floorId}`, {
      config: {
        presence: { key: currentMemberId },
      },
    });
    roomRef.current = room;

    // A. 다른 유저 위치 감지 (Presence)
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

    // B. 실시간 이모지 수신
    room.on('broadcast', { event: 'emoji' }, ({ payload }) => {
      if (payload.memberId !== currentMemberId) {
        emitEmoji(payload.memberId, payload.emoji);
      }
    });

    // C. 실시간 채팅 수신
    room.on('broadcast', { event: 'chat' }, ({ payload }) => {
      if (payload.senderId !== currentMemberId) {
        addNearbyMsg(payload.roomId, payload.senderId, payload.senderName, payload.content);
      }
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
  }, [floorId, currentMemberId, emitEmoji, addNearbyMsg]);

  return { players, updateState, sendBroadcast };
}
