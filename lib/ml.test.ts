import { describe, it, expect } from 'vitest';
import { detectDrift, formatModel } from './ml';
describe('ml', () => {
  it('healthy when within 5%', () => { expect(detectDrift(0.92, 0.95)).toBe('healthy'); });
  it('drifting at 5-15% drop', () => { expect(detectDrift(0.88, 0.95)).toBe('drifting'); });
  it('degraded at 15%+ drop', () => { expect(detectDrift(0.70, 0.95)).toBe('degraded'); });
  it('formats correctly', () => {
    const m = { id: '1', name: 'fraud-detector', accuracy: 0.92, baseline: 0.95, status: 'healthy' as const };
    expect(formatModel(m)).toBe('fraud-detector: 92% (baseline 95%) [healthy]');
  });
});