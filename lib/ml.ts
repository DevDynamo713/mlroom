export type ExperimentStatus = 'draft' | 'running' | 'completed' | 'failed' | 'archived';
export type MetricType = 'accuracy' | 'f1' | 'precision' | 'recall' | 'loss' | 'auc';
export interface Experiment { id: string; name: string; model: string; dataset: string; status: ExperimentStatus; metrics: Record<string, number>; runs: number; bestMetric?: string; bestValue?: number }
export function experimentHealth(e: Experiment): number {
  if (e.status === 'failed') return 0;
  if (e.status === 'draft') return 25;
  if (e.status === 'running') return 50;
  if (e.status === 'archived') return 75;
  return 100;
}
export function fleetHealth(experiments: Experiment[]): number {
  if (experiments.length === 0) return 100;
  return Math.round(experiments.reduce((s, e) => s + experimentHealth(e), 0) / experiments.length);
}
export function totalRuns(experiments: Experiment[]): number {
  return experiments.reduce((s, e) => s + e.runs, 0);
}
export function formatExperiment(e: Experiment): string { return `${e.name} [${e.model}/${e.dataset}] ${e.status} runs:${e.runs} best:${e.bestMetric}=${e.bestValue}`; }