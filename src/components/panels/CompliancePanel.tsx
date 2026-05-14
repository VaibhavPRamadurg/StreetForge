import { useStreetStore } from '../../store/useStreetStore';
import { motion } from 'framer-motion';

export default function CompliancePanel() {
  const { complianceChecks } = useStreetStore();
  const passed = complianceChecks.filter(c => c.status === 'pass').length;
  const failed = complianceChecks.filter(c => c.status === 'fail').length;
  const warnings = complianceChecks.filter(c => c.status === 'warning').length;
  const score = complianceChecks.length > 0 ? Math.round((passed / complianceChecks.length) * 100) : 0;
  const scoreColor = score >= 90 ? 'var(--neon-green)' : score >= 75 ? 'var(--neon-amber)' : 'var(--neon-red)';

  return (
    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Score ring */}
      <div className="glass" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 70, height: 70, flexShrink: 0 }}>
          <svg width="70" height="70" viewBox="0 0 70 70" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="35" cy="35" r="28" fill="none" stroke="var(--bg-elevated)" strokeWidth="6" />
            <motion.circle cx="35" cy="35" r="28" fill="none" stroke={scoreColor} strokeWidth="6"
              strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 28}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - score / 100) }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 4px ${scoreColor})` }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: scoreColor, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>/ 100</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>IRC Compliance Score</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-green">✓ {passed} pass</span>
            {warnings > 0 && <span className="badge badge-amber">⚠ {warnings} warn</span>}
            {failed > 0 && <span className="badge badge-red">✕ {failed} fail</span>}
          </div>
        </div>
      </div>

      {/* Individual checks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>COMPLIANCE CHECKS ({complianceChecks.length})</div>
        {complianceChecks.map((chk, i) => {
          const color = chk.status === 'pass' ? 'var(--neon-green)' : chk.status === 'warning' ? 'var(--neon-amber)' : 'var(--neon-red)';
          const icon = chk.status === 'pass' ? '✓' : chk.status === 'warning' ? '⚠' : '✕';
          return (
            <motion.div key={chk.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              style={{ padding: '8px 10px', borderRadius: 7, border: `1px solid ${color}22`, background: `${color}08` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 11, color, fontWeight: 700, flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{chk.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{chk.standard}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>Required: <b style={{ color: 'var(--text-primary)' }}>{chk.required}</b></span>
                    <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>Actual: <b style={{ color }}>{chk.actual}</b></span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
