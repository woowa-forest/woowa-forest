// 맵 ↔ React 간 이벤트 버스
// Phaser scene에서 emit, React 컴포넌트에서 on/off

type MapEventHandlers = {
  NEAR_WELL: () => void;
  LEAVE_WELL: () => void;
  INTERACT_BULLETIN: () => void;
  INTERACT_PORTAL: (payload: { floorId: number }) => void;
  FLOOR_CHANGED: (payload: { toFloor: number }) => void;
  NEAR_CHARACTER: (payload: { memberId: string }) => void;
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
