import { useStreetStore } from '../../store/useStreetStore';
import { motion } from 'framer-motion';

export default function BoQPanel() {
  const { boqItems, roadLength } = useStreetStore();
  const totalCost = boqItems.reduce((s, item) => s + item.amount, 0);

  function formatINR(n: number) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
  }

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>BILL OF QUANTITIES</div>
        <button className="btn btn-ghost" style={{ fontSize: 10, padding: '3px 8px' }}>⤓ Export PDF</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div className="glass" style={{ padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4 }}>TOTAL ESTIMATE</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>{formatINR(totalCost)}</div>
        </div>
        <div className="glass" style={{ padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4 }}>COST / KM</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--neon-amber)', fontFamily: 'var(--font-mono)' }}>{formatINR(Math.round(totalCost / (roadLength / 1000)))}</div>
        </div>
      </div>

      {/* BoQ Table */}
      <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px', gap: 0, background: 'var(--bg-elevated)', padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
          {['Description', 'Unit', 'Qty', 'Amount'].map(h => (
            <div key={h} style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{h}</div>
          ))}
        </div>
        {boqItems.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px', gap: 0, padding: '7px 10px', borderBottom: '1px solid var(--border-subtle)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-glass-light)' }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-primary)', lineHeight: 1.3 }}>{item.description}</div>
              {item.irc_ref && <div style={{ fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{item.irc_ref}</div>}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', alignSelf: 'center' }}>{item.unit}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', alignSelf: 'center', fontFamily: 'var(--font-mono)' }}>{item.quantity.toLocaleString()}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--neon-green)', alignSelf: 'center', fontFamily: 'var(--font-mono)' }}>{formatINR(item.amount)}</div>
          </motion.div>
        ))}
        {/* Total row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px', padding: '8px 10px', background: 'rgba(16,185,129,0.08)', borderTop: '2px solid rgba(16,185,129,0.3)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', gridColumn: '1 / 4' }}>GRAND TOTAL (Excl. GST)</div>
          <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>{formatINR(totalCost)}</div>
        </div>
      </div>

      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', padding: '6px 10px', background: 'var(--bg-glass-light)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
        ⓘ Rates are indicative (MoRT&H SOR 2024). Add 18% GST and {(roadLength >= 1000 ? 12 : 10)}% contingency. Road length: {roadLength}m
      </div>
    </div>
  );
}
