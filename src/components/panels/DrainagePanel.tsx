import { useStreetStore } from '../../store/useStreetStore';
import { calculateDrainage } from '../../utils/ircCalc';

export default function DrainagePanel() {
  const { project, updateProject } = useStreetStore();
  const { drainage } = project;

  const Q = calculateDrainage(drainage);
  const drainDia = Q < 50 ? 300 : Q < 150 ? 450 : Q < 400 ? 600 : 900; // mm

  function updateDrain(patch: Partial<typeof drainage>) {
    updateProject({ drainage: { ...drainage, ...patch } });
  }

  const stats = [
    { label: 'Discharge Q', value: `${Q} L/s`, color: 'var(--neon-cyan)' },
    { label: 'Recommended Drain', value: `⌀${drainDia}mm`, color: 'var(--neon-blue)' },
    { label: 'Runoff Volume', value: `${(Q * 3600 / 1000).toFixed(1)} m³/hr`, color: 'var(--neon-amber)' },
  ];

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>DRAINAGE — Q = CIA/360</div>

      {/* Output cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {stats.map(s => (
          <div key={s.label} className="glass" style={{ padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Inputs */}
      <div className="glass" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label={`Catchment Area (A): ${drainage.catchmentArea} ha`}>
          <input type="range" className="slider" min={0.1} max={20} step={0.1} value={drainage.catchmentArea}
            onChange={e => updateDrain({ catchmentArea: +e.target.value })} />
        </Field>
        <Field label={`Runoff Coefficient (C): ${drainage.runoffCoefficient}`}>
          <input type="range" className="slider" min={0.1} max={1.0} step={0.05} value={drainage.runoffCoefficient}
            onChange={e => updateDrain({ runoffCoefficient: +e.target.value })} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>
            <span>Green 0.1</span><span>Mixed 0.5</span><span>Paved 0.9</span>
          </div>
        </Field>
        <Field label={`Rainfall Intensity (I): ${drainage.rainfallIntensity} mm/hr`}>
          <input type="range" className="slider" min={10} max={250} step={5} value={drainage.rainfallIntensity}
            onChange={e => updateDrain({ rainfallIntensity: +e.target.value })} />
        </Field>
        <Field label={`Longitudinal Slope: ${drainage.slope}%`}>
          <input type="range" className="slider" min={0.2} max={8} step={0.2} value={drainage.slope}
            onChange={e => updateDrain({ slope: +e.target.value })} />
        </Field>
      </div>

      {/* Reference table */}
      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', background: 'var(--bg-glass-light)', borderRadius: 6, padding: '8px 10px', border: '1px solid var(--border-subtle)', lineHeight: 1.8 }}>
        <div style={{ color: 'var(--neon-cyan)', marginBottom: 4 }}>DRAIN SIZING (IRC:SP:50)</div>
        <div>Q &lt; 50 L/s → ⌀300mm</div>
        <div>Q 50–150 → ⌀450mm</div>
        <div>Q 150–400 → ⌀600mm</div>
        <div>Q &gt; 400 → ⌀900mm</div>
        <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>Slope ≥ 0.5% recommended per IRC:SP:50</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}
