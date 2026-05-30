import { CellGraph } from './graph';
import { Room } from './room';

function makeRooms(n: number, alpha: number = 0.3): Room[] {
  return Array.from({ length: n }, (_, i) => new Room(`r${i}`, 0, alpha));
}

export function chain(n: number, alpha: number = 0.3): CellGraph {
  const g = new CellGraph();
  const rooms = makeRooms(n, alpha);
  for (const r of rooms) g.addRoom(r);
  for (let i = 0; i < n - 1; i++) g.addEdge(`r${i}`, `r${i + 1}`);
  return g;
}

export function ring(n: number, alpha: number = 0.3): CellGraph {
  const g = chain(n, alpha);
  if (n > 2) g.addEdge('r0', `r${n - 1}`);
  return g;
}

export function star(n: number, alpha: number = 0.3): CellGraph {
  const g = new CellGraph();
  const rooms = makeRooms(n, alpha);
  for (const r of rooms) g.addRoom(r);
  for (let i = 1; i < n; i++) g.addEdge('r0', `r${i}`);
  return g;
}

export function mesh(n: number, alpha: number = 0.3): CellGraph {
  const g = new CellGraph();
  const rooms = makeRooms(n, alpha);
  for (const r of rooms) g.addRoom(r);
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      g.addEdge(`r${i}`, `r${j}`);
  return g;
}

export function smallWorld(n: number, k: number = 4, p: number = 0.1, alpha: number = 0.3): CellGraph {
  if (k % 2 !== 0) throw new Error('k must be even');
  const g = new CellGraph();
  const rooms = makeRooms(n, alpha);
  for (const r of rooms) g.addRoom(r);

  const edgeSet = new Set<string>();
  const key = (a: number, b: number) => `${Math.min(a, b)},${Math.max(a, b)}`;

  for (let i = 0; i < n; i++) {
    for (let j = 1; j <= k / 2; j++) {
      edgeSet.add(key(i, (i + j) % n));
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 1; j <= k / 2; j++) {
      if (Math.random() < p) {
        const oldKey = key(i, (i + j) % n);
        edgeSet.delete(oldKey);
        const newB = Math.floor(Math.random() * (n - 1));
        const nb = newB >= i ? newB + 1 : newB;
        edgeSet.add(key(i, nb));
      }
    }
  }

  for (const e of edgeSet) {
    const [a, b] = e.split(',').map(Number);
    g.addEdge(`r${a}`, `r${b}`);
  }
  return g;
}

export function scaleFree(n: number, m: number = 2, alpha: number = 0.3): CellGraph {
  if (m < 1 || m >= n) throw new Error('m must be in [1, n-1]');
  const g = new CellGraph();
  const rooms = makeRooms(n, alpha);
  for (const r of rooms) g.addRoom(r);

  const repeated: number[] = [];
  for (let i = 0; i <= m; i++) {
    for (let j = i + 1; j <= m; j++) {
      g.addEdge(`r${i}`, `r${j}`);
      repeated.push(i, j);
    }
  }

  for (let newN = m + 1; newN < n; newN++) {
    const targets = new Set<number>();
    while (targets.size < m) {
      targets.add(repeated[Math.floor(Math.random() * repeated.length)]);
    }
    for (const t of targets) {
      g.addEdge(`r${newN}`, `r${t}`);
      repeated.push(newN, t);
    }
  }
  return g;
}
