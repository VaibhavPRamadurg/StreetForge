import { useStreetStore } from '../../store/useStreetStore';
import { motion } from 'framer-motion';
import WellbeingScorePanel from './WellbeingScorePanel';

const LAYER_EMISSIVE: Record<string, string> = {
  bc: '#00d4ff', dbm: '#3b82f6', wmm: '#f97316', gsb: '#f59e0b', subgrade: '#d97706',
};

export default function PavementCalcPanel() {
  const { project, designMSA, totalPavementThickness } = useStreetStore();
  const { pavementLayers, cbr, trafficVolume, designLife, roadCategory } = project;

  const displayLayers = pavementLayers.filter(l => l.id !== 'subgrade');
  const layerSum = displayLayers.reduce((s, l) => s + l.thickness, 0);

  return (
    <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Parameters summary */}
      <div className="glass" style={{ padding: 12 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 10 }}>IRC:37-2012 DESIGN INPUTS</div>
        {[
          { label: 'Road Category', value: roadCategory },
          { label: 'Initial Traffic', value: `${trafficVolume} CVPD` },
          { label: 'Design Life', value: `${designLife} years` },
          { label: 'Subgrade CBR', value: `${cbr}%` },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.label}</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Computed result */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="glass" style={{ flex: 1, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 4 }}>DESIGN TRAFFIC</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>{designMSA}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>msa (million std. axles)</div>
        </div>
        <div className="glass" style={{ flex: 1, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 4 }}>TOTAL THICKNESS</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--neon-amber)', fontFamily: 'var(--font-mono)' }}>{totalPavementThickness}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>mm</div>
        </div>
      </div>

      {/* Layer visualization */}
      <div>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8 }}>LAYER STACK (IRC:37-2012)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {displayLayers.map((layer, i) => {
            const pct = (layer.thickness / layerSum) * 100;
            const emissive = LAYER_EMISSIVE[layer.id] || '#ffffff';
            return (
              <motion.div key={layer.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                style={{ borderRadius: 5, overflow: 'hidden', border: `1px solid ${emissive}22` }}>
                <div style={{ background: `${emissive}14`, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: emissive, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)' }}>{layer.shortName} — {layer.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{layer.material}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-mono)', color: emissive }}>{layer.thickness}mm</div>
                    <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</div>
                  </div>
                </div>
                {/* Thickness bar */}
                <div style={{ height: 3, background: 'var(--bg-elevated)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                    style={{ height: '100%', background: emissive, boxShadow: `0 0 6px ${emissive}` }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', padding: '6px 10px', background: 'var(--bg-glass-light)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
        ⓘ Calculated per IRC:37-2012 Table-1 using interpolation. Growth rate: 7.5%, VDF: 2.5, LDF: 0.75
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '2px 0' }} />

      {/* Wellbeing & environment score stack */}
      <WellbeingScorePanel />
    </div>
  );
}
