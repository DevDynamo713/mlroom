"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [models, setModels] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [baseline, setBaseline] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://mlroom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'model') {
        setModels(prev => {
          const idx = prev.findIndex(m => m.id === data.data.id);
          if (idx >= 0) { const n = [...prev]; n[idx] = data.data; return n; }
          return [...prev, data.data];
        });
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://mlroom.devdynamo713.com/room/${params.id}/models`);
      if (res.ok) setModels(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addModel = async () => {
    const acc = parseFloat(accuracy);
    const base = parseFloat(baseline);
    const drop = base - acc;
    const status = drop >= 0.15 ? 'degraded' : drop >= 0.05 ? 'drifting' : 'healthy';
    const data = { id: Date.now().toString(), name, accuracy: acc, baseline: base, status };
    await fetch(`https://mlroom.devdynamo713.com/room/${params.id}/model`, { method: 'POST', body: JSON.stringify(data) });
    setName(''); setAccuracy(''); setBaseline('');
  };
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>MLRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="model name" className="name-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <input value={accuracy} onChange={(e) => setAccuracy(e.target.value)} placeholder="accuracy (0-1)" className="acc-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa', width: 100 }} />
        <input value={baseline} onChange={(e) => setBaseline(e.target.value)} placeholder="baseline (0-1)" className="base-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa', width: 100 }} />
        <button className="add-btn" onClick={addModel} disabled={!name.trim() || !accuracy || !baseline} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add Model</button>
      </div>
      <div className="model-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {models.map(m => (
          <div key={m.id} style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: m.status === 'degraded' ? '#450a0a' : m.status === 'drifting' ? '#422006' : '#052e16' }}>
            <strong style={{ fontSize: 18 }}>{m.name}</strong>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Accuracy: {Math.round(m.accuracy*100)}% / Baseline: {Math.round(m.baseline*100)}%</div>
            <div style={{ marginTop: 4, fontWeight: 'bold', color: m.status === 'degraded' ? '#f87171' : m.status === 'drifting' ? '#fbbf24' : '#4ade80' }}>{m.status.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}