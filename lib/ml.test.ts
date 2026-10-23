import { describe, it, expect } from 'vitest';
import { experimentHealth, fleetHealth, totalRuns, formatExperiment } from './ml';
describe('ml', () => {
  it('experimentHealth completed = 100', () => {
    const e = { id: '1', name: 'exp1', model: 'rf', dataset: 'train', status: 'completed', metrics: {}, runs: 10 };
    expect(experimentHealth(e)).toBe(100);
  });
  it('experimentHealth failed = 0', () => {
    const e = { id: '2', name: 'exp2', model: 'rf', dataset: 'train', status: 'failed', metrics: {}, runs: 5 };
    expect(experimentHealth(e)).toBe(0);
  });
  it('experimentHealth draft = 25', () => {
    const e = { id: '3', name: 'exp3', model: 'rf', dataset: 'train', status: 'draft', metrics: {}, runs: 0 };
    expect(experimentHealth(e)).toBe(25);
  });
  it('fleetHealth averages correctly', () => {
    const experiments = [
      { id: '1', name: 'e1', model: 'rf', dataset: 'd1', status: 'completed', metrics: {}, runs: 10 },
      { id: '2', name: 'e2', model: 'rf', dataset: 'd2', status: 'failed', metrics: {}, runs: 3 }
    ];
    expect(fleetHealth(experiments)).toBe(50);
  });
  it('totalRuns sums correctly', () => {
    const experiments = [
      { id: '1', name: 'e1', model: 'rf', dataset: 'd1', status: 'completed', metrics: {}, runs: 10 },
      { id: '2', name: 'e2', model: 'rf', dataset: 'd2', status: 'completed', metrics: {}, runs: 5 }
    ];
    expect(totalRuns(experiments)).toBe(15);
  });
  it('formats correctly', () => {
    const e = { id: '1', name: 'rf-tune', model: 'randomforest', dataset: 'kaggle', status: 'completed', metrics: { accuracy: 0.95 }, runs: 20, bestMetric: 'accuracy', bestValue: 0.95 };
    expect(formatExperiment(e)).toBe('rf-tune [randomforest/kaggle] completed runs:20 best:accuracy=0.95');
  });
});