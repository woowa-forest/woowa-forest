import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface PlayerState {
  memberId: string;
  name: string;
  field: string;
  x: number;
  z: number;
  facing: number;
  emoji?: string | null;
}

export function useMultiplayer(floorId: number, currentMember: PlayerState | null) {
  const [players, setPlayers] = useState<Record<string, PlayerState>>({});

  useEffect(() => {
    if (!supabase || !currentMember) return;

    // 1. 특정 층(floor) 단위로 Room 생성
    const room = supabase.channel(`floor-${floorId}`, {
      config: {
        presence: { key: currentMember.memberId },
      },
    });

    // 2. 다른 유저들의 접속 상태 및 위치(Presence) 수신
    room.on('presence', { event: 'sync' }, () => {
      const state = room.presenceState();
      const newPlayers: Record<string, PlayerState> = {};
      
      Object.keys(state).forEach((key) => {
        if (key !== currentMember.memberId) {
          const userStates = state[key] as any[];
          if (userStates && userStates.length > 0) {
            newPlayers[key] = userStates[0] as PlayerState;
          }
        }
      });
      setPlayers(newPlayers);
    });

    // 3. 브로드캐스트 수신 (채팅, 이모지 등 짧은 이벤트)
    room.on('broadcast', { event: 'emoji' }, ({ payload }) => {
      console.log(`[이모지 수신] ${payload.memberId}: ${payload.emoji}`);
      // 여기서 Zustand 스토어의 emitEmoji 등을 호출하여 렌더링에 반영할 수 있습니다.
    });

    // 4. 채널 구독 및 내 상태 전송 시작
    room.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // 첫 접속 시 내 상태 전송
        await room.track(currentMember);
      }
    });

    // 5. 내 위치가 바뀔 때마다 서버로 상태 업데이트 (throttle 필요)
    const updateMyPosition = async () => {
      if (room.state === 'joined') {
        await room.track(currentMember);
      }
    };
    
    // 컴포넌트가 언마운트되거나 층을 이동하면 채널 나가기
    return () => {
      room.unsubscribe();
    };
  }, [floorId]); // currentMember 전체를 넣으면 무한루프가 될 수 있으므로 최적화 필요

  return { players };
}
