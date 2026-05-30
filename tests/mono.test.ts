import { Jepa, Room, CellGraph, chain, ring, star, mesh, smallWorld, scaleFree } from '../src/index';

// ── Jepa tests ─────────────────────────────────────────────────────────

describe('Jepa', () => {
  test('empty predict returns 0', () => {
    expect(new Jepa().predict()).toBe(0);
  });

  test('single observe', () => {
    const j = new Jepa();
    j.observe(1);
    expect(j.predict()).toBeCloseTo(1, 6);
  });

  test('two observations weighted', () => {
    const j = new Jepa(0.5);
    j.observe(0);
    j.observe(1);
    const p = j.predict();
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1);
  });

  test('alpha=1 uses only latest', () => {
    const j = new Jepa(1);
    j.observe(5);
    j.observe(10);
    expect(j.predict()).toBeCloseTo(10, 6);
  });

  test('invalid alpha throws', () => {
    expect(() => new Jepa(0)).toThrow();
    expect(() => new Jepa(1.5)).toThrow();
  });

  test('surprise zero for same value', () => {
    const j = new Jepa();
    j.observe(3);
    j.observe(3);
    expect(j.surprise(3)).toBeCloseTo(0, 10);
  });

  test('surprise nonzero', () => {
    const j = new Jepa();
    j.observe(0);
    j.observe(0);
    expect(j.surprise(1)).toBeGreaterThan(0);
  });

  test('history tracking', () => {
    const j = new Jepa();
    j.observe(1);
    j.observe(2);
    j.observe(3);
    expect(j.getHistory()).toEqual([1, 2, 3]);
    expect(j.getObservationCount()).toBe(3);
  });
});

// ── Room tests ──────────────────────────────────────────────────────────

describe('Room', () => {
  test('create', () => {
    const r = new Room('a', 1.5);
    expect(r.id).toBe('a');
    expect(r.vibe).toBe(1.5);
  });

  test('observe updates vibe and surprise', () => {
    const r = new Room('a', 0);
    r.observe(1);
    expect(r.vibe).toBe(1);
    expect(r.lastSurprise).toBeGreaterThan(0);
  });

  test('predict after init', () => {
    const r = new Room('a', 5);
    expect(r.predict()).toBeCloseTo(5, 6);
  });
});

// ── CellGraph tests ────────────────────────────────────────────────────

function makeGraph(): CellGraph {
  const g = new CellGraph();
  g.addRoom(new Room('a', 1));
  g.addRoom(new Room('b', 2));
  g.addRoom(new Room('c', 3));
  g.addEdge('a', 'b');
  g.addEdge('b', 'c');
  return g;
}

describe('CellGraph', () => {
  test('add rooms and edges', () => {
    const g = makeGraph();
    expect(g.size).toBe(3);
    expect(g.neighbours('a').has('b')).toBe(true);
  });

  test('add edge missing room throws', () => {
    const g = new CellGraph();
    g.addRoom(new Room('a'));
    expect(() => g.addEdge('a', 'z')).toThrow();
  });

  test('total vibe', () => {
    const g = makeGraph();
    expect(g.totalVibe()).toBeCloseTo(6, 6);
  });

  test('diffuse conserves vibe', () => {
    const g = makeGraph();
    const before = g.totalVibe();
    for (let i = 0; i < 10; i++) g.diffuse(0.2);
    expect(g.totalVibe()).toBeCloseTo(before, 4);
  });

  test('tick runs', () => {
    const g = makeGraph();
    g.tick();
    expect(g.size).toBe(3);
  });

  test('gossip returns number', () => {
    const g = makeGraph();
    const v = g.gossip('a');
    expect(typeof v).toBe('number');
  });

  test('gossip no neighbours', () => {
    const g = new CellGraph();
    g.addRoom(new Room('solo', 5));
    expect(g.gossip('solo')).toBeCloseTo(5, 6);
  });

  test('gossip specific target', () => {
    const g = makeGraph();
    g.gossip('a', 'b');
    expect(g.rooms.get('a')!.vibe).toBeCloseTo(g.rooms.get('b')!.vibe, 10);
  });

  test('learn runs', () => {
    const g = makeGraph();
    g.learn();
    expect(g.size).toBe(3);
  });
});

// ── Topology tests ─────────────────────────────────────────────────────

describe('Topology', () => {
  test('chain', () => {
    const g = chain(5);
    expect(g.size).toBe(5);
    expect(g.neighbours('r0').size).toBe(1);
    expect(g.neighbours('r2').size).toBe(2);
  });

  test('ring', () => {
    const g = ring(5);
    expect(g.size).toBe(5);
    expect(g.neighbours('r0').has('r4')).toBe(true);
  });

  test('star', () => {
    const g = star(5);
    expect(g.size).toBe(5);
    expect(g.neighbours('r0').size).toBe(4);
    expect(g.neighbours('r1').size).toBe(1);
  });

  test('mesh', () => {
    const g = mesh(4);
    expect(g.size).toBe(4);
    expect(g.neighbours('r0').size).toBe(3);
  });

  test('small world', () => {
    const g = smallWorld(10, 4, 0.2);
    expect(g.size).toBe(10);
  });

  test('small world k must be even', () => {
    expect(() => smallWorld(10, 3)).toThrow();
  });

  test('scale free', () => {
    const g = scaleFree(20, 2);
    expect(g.size).toBe(20);
  });

  test('scale free invalid m', () => {
    expect(() => scaleFree(10, 0)).toThrow();
    expect(() => scaleFree(5, 5)).toThrow();
  });

  test('diffuse conservation on ring', () => {
    const g = ring(10);
    for (let i = 0; i < 10; i++) {
      g.rooms.get(`r${i}`)!.vibe = i;
      g.rooms.get(`r${i}`)!.jepa.observe(i);
    }
    const before = g.totalVibe();
    for (let i = 0; i < 20; i++) g.diffuse(0.3);
    expect(g.totalVibe()).toBeCloseTo(before, 3);
  });
});
