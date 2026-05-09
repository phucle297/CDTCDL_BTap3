import { clamp, distance, degreesToRadians, radiansToDegrees, generateId } from '../index';

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min when below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max when above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('distance', () => {
  it('calculates distance between two points', () => {
    expect(distance(0, 0, 3, 4)).toBe(5);
  });

  it('returns 0 for same point', () => {
    expect(distance(5, 5, 5, 5)).toBe(0);
  });
});

describe('degreesToRadians', () => {
  it('converts 180 degrees to PI', () => {
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
  });

  it('converts 0 degrees to 0', () => {
    expect(degreesToRadians(0)).toBe(0);
  });
});

describe('radiansToDegrees', () => {
  it('converts PI to 180 degrees', () => {
    expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
  });

  it('converts 0 to 0 degrees', () => {
    expect(radiansToDegrees(0)).toBe(0);
  });
});

describe('generateId', () => {
  it('generates a string id', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('uses the provided prefix', () => {
    const id = generateId('rect');
    expect(id.startsWith('rect-')).toBe(true);
  });

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
