type MapEventHandlers = {
  NEAR_WELL: () => void;
  LEAVE_WELL: () => void;
  NEAR_OBJECT: (payload: { type: string; label: string }) => void;
  LEAVE_OBJECT: () => void;
  INTERACT_BULLETIN: () => void;
  INTERACT_PORTAL: (payload: { floorId: number }) => void;
  FLOOR_CHANGED: (payload: { toFloor: number }) => void;
  NEAR_CHARACTER: (payload: { memberId: string }) => void;
  INTERACT_CHARACTER: (payload: { memberId: string }) => void;
  REQUEST_CHAT_BROADCAST: (payload: { roomId: string; senderId: string; senderName: string; content: string }) => void;
  REQUEST_EMOJI_BROADCAST: (payload: { memberId: string; emoji: string }) => void;
};

type EventName = keyof MapEventHandlers;

const registry = new Map<EventName, Set<Function>>();

function on<K extends EventName>(event: K, handler: MapEventHandlers[K]): () => void {
  if (!registry.has(event)) registry.set(event, new Set());
  registry.get(event)!.add(handler);
  return () => registry.get(event)?.delete(handler);
}

function emit<K extends EventName>(event: K, ...args: Parameters<MapEventHandlers[K]>): void {
  registry.get(event)?.forEach(fn => (fn as Function)(...args));
}

function off<K extends EventName>(event: K, handler: MapEventHandlers[K]): void {
  registry.get(event)?.delete(handler);
}

export const mapEvents = { on, emit, off };
