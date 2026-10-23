"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [model, setModel] = useState('randomforest');
  const [dataset, setDataset] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://mlroom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'experiment') {
        setExperiments(prev => [...prev, data.data]);
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://mlroom.devdynamo713.com/room/${params.id}/experiments`);
      if (res.ok) setExperiments(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addExperiment = async () => {
    const data = { name, model, dataset, status: 'draft' };
    await fetch(`https://mlroom.devdynamo713.com/room/${params.id}/experiment`, { method: 'POST', body: JSON.stringify(data) });
    setName(''); setDataset('');
  };
  const statusColor: Record<string, string> = { draft: '#a1a1aa', running: '#60a5fa', completed: '#4ade80', failed: '#f87171', archived: '#fbbf24' };
  const healthScore = experiments.length > 0 ? Math.round(experiments.reduce((s, e) => {
    if (e.status === 'failed') return s;
    if (e.status === 'draft') return s + 25;
    if (e.status === 'running') return s + 50;
    if (e.status === 'archived') return s + 75;
    return s + 100;
  }, 0) / experiments.length) : 100;
  const totalRuns = experiments.reduce((s, e) => s + e.runs, 0);
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>MLRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ padding: 16, border: `1px solid ${healthScore >= 80 ? '#4ade80' : healthScore >= 50 ? '#fbbf24' : '#f87171'}`, borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Fleet Health</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: healthScore >= 80 ? '#4ade80' : healthScore >= 50 ? '#fbbf24' : '#f87171' }}>{healthScore}%</div>
        </div>
        <div style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Total Runs</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#60a5fa' }}>{totalRuns}</div>
        </div>
        <div style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Experiments</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#a78bfa' }}>{experiments.length}</div>
        </div>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="experiment name" className="name-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <select value={model} onChange={(e) => setModel(e.target.value)} className="model-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }}>
          <option value="randomforest">randomforest</option>
          <option value="xgboost">xgboost</option>
          <option value="lightgbm">lightgbm</option>
          <option value="pytorch">pytorch</option>
          <option value="tensorflow">tensorflow</option>
        </select>
        <input value={dataset} onChange={(e) => setDataset(e.target.value)} placeholder="dataset" className="dataset-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <button className="add-btn" onClick={addExperiment} disabled={!name.trim() || !dataset.trim()} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Create Experiment</button>
      </div>
      <div className="experiment-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {experiments.map(e => (
          <div key={e.id} style={{ padding: 16, border: `1px solid ${statusColor[e.status]}`, borderRadius: 12, background: '#09090b' }}>
            <strong style={{ fontSize: 18, color: statusColor[e.status] }}>{e.name}</strong>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>{e.model} / {e.dataset}</div>
            <div style={{ marginTop: 4, color: '#60a5fa', fontSize: 13 }}>Runs: {e.runs}</div>
            <div style={{ marginTop: 4, fontWeight: 'bold', color: statusColor[e.status], textTransform: 'uppercase' }}>{e.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}