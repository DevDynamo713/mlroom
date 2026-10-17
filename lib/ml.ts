export interface Model { id: string; name: string; accuracy: number; baseline: number; status: 'healthy' | 'drifting' | 'degraded' }
export function detectDrift(accuracy: number, baseline: number): 'healthy' | 'drifting' | 'degraded' {
  const drop = baseline - accuracy;
  if (drop >= 0.15) return 'degraded';
  if (drop >= 0.05) return 'drifting';
  return 'healthy';
}
export function formatModel(m: Model): string { return `${m.name}: ${Math.round(m.accuracy*100)}% (baseline ${Math.round(m.baseline*100)}%) [${m.status}]`; }