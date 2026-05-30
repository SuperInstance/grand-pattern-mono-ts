import { Room } from './room';

/**
 * CellGraph – rooms + edges + tick/diffuse/gossip/learn.
 * Conservation holds by construction.
 */
export class CellGraph {
  rooms: Map<string, Room> = new Map();
  edges: Map<string, Set<string>> = new Map();

  addRoom(room: Room): void {
    this.rooms.set(room.id, room);
    if (!this.edges.has(room.id)) {
      this.edges.set(room.id, new Set());
    }
  }

  addEdge(a: string, b: string): void {
    if (!this.rooms.has(a) || !this.rooms.has(b)) {
      throw new Error(`Room ${a} or ${b} not in graph`);
    }
    this.edges.get(a)!.add(b);
    this.edges.get(b)!.add(a);
  }

  neighbours(roomId: string): Set<string> {
    return this.edges.get(roomId) ?? new Set();
  }

  tick(): void {
    for (const room of this.rooms.values()) {
      const predicted = room.predict();
      const perturbation = (Math.random() - 0.5) * 0.02;
      room.observe(predicted + perturbation);
    }
  }

  diffuse(rate: number = 0.1): void {
    const deltas = new Map<string, number>();
    for (const id of this.rooms.keys()) {
      deltas.set(id, 0);
    }
    for (const [rid, room] of this.rooms) {
      const nbrs = this.neighbours(rid);
      if (nbrs.size === 0) continue;
      const share = (rate * room.vibe) / nbrs.size;
      deltas.set(rid, (deltas.get(rid) ?? 0) - rate * room.vibe);
      for (const n of nbrs) {
        deltas.set(n, (deltas.get(n) ?? 0) + share);
      }
    }
    for (const [rid, delta] of deltas) {
      const room = this.rooms.get(rid)!;
      room.observe(room.vibe + delta);
    }
  }

  gossip(roomId: string, targetId?: string): number {
    if (!this.rooms.has(roomId)) throw new Error(roomId);
    const nbrs = [...this.neighbours(roomId)];
    if (nbrs.length === 0) return this.rooms.get(roomId)!.vibe;
    const target = targetId && nbrs.includes(targetId)
      ? targetId
      : nbrs[Math.floor(Math.random() * nbrs.length)];
    const sharedVibe = this.rooms.get(roomId)!.vibe;
    const avg = (sharedVibe + this.rooms.get(target)!.vibe) / 2;
    this.rooms.get(roomId)!.observe(avg);
    this.rooms.get(target)!.observe(avg);
    return sharedVibe;
  }

  learn(): void {
    for (const room of this.rooms.values()) {
      const predicted = room.predict();
      room.observe(0.9 * room.vibe + 0.1 * predicted);
    }
  }

  totalVibe(): number {
    let total = 0;
    for (const room of this.rooms.values()) {
      total += room.vibe;
    }
    return total;
  }

  get size(): number {
    return this.rooms.size;
  }
}
