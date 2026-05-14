import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const DEMO_PROJECTS = [
  { id: 1, name: 'Urban Arterial Road — Pune', category: 'MDR', location: 'Pune, MH', status: 'active', compliance: 94, width: '19.5m', lanes: 4, date: '2026-05-03', cbr: 4, msa: '21.4' },
  { id: 2, name: 'NH-48 Bypass Extension', category: 'NH', location: 'Bengaluru, KA', status: 'review', compliance: 87, width: '60m', lanes: 8, date: '2026-04-28', cbr: 6, msa: '84.3' },
  { id: 3, name: 'Smart City Boulevard', category: 'SH', location: 'Surat, GJ', status: 'draft', compliance: 72, width: '30m', lanes: 6, date: '2026-04-15', cbr: 3, msa: '42.1' },
  { id: 4, name: 'Ring Road Connector', category: 'ODR', location: 'Jaipur, RJ', status: 'active', compliance: 91, width: '12m', lanes: 2, date: '2026-05-01', cbr: 5, msa: '15.7' },
];

const METRICS = [
  { label: 'Active Projects', value: '4', unit: '', color: 'var(--neon-cyan)', icon: '⬡', pct: 100 },
  { label: 'Road Designed', value: '12.4', unit: 'km', color: 'var(--neon-green)', icon: '↗', pct: 75 },
  { label: 'Avg. Compliance', value: '86', unit: '%', color: 'var(--neon-amber)', icon: '✓', pct: 86 },
  { label: 'Exports', value: '12', unit: 'files', color: 'var(--neon-purple)', icon: '⤓', pct: 60 },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-green',
  review: 'badge-amber',
  draft: 'badge-cyan',
};

const QUICK_STARTS = [
  { label: 'Urban Arterial (MDR)', desc: '4-lane divided · 20m ROW · IRC:103', icon: '🏙️', color: 'var(--neon-cyan)' },
  { label: 'National Highway (NH)', desc: '6-lane · 60m ROW · IRC:103-2012', icon: '🛣️', color: 'var(--neon-amber)' },
  { label: 'Smart City Boulevard', desc: 'Multi-modal · cycle track · bioswales', icon: '🚲', color: 'var(--neon-green)' },
  { label: 'Village Road (VR)', desc: '2-lane · 7.5m ROW · IRC:73', icon: '🌾', color: 'var(--neon-purple)' },
];

const IRC_STANDARDS = [
  { code: 'IRC:103-2012', desc: 'Urban Roads', loaded: true },
  { code: 'IRC:37-2012', desc: 'Pavement Design', loaded: true },
  { code: 'IRC:86-1983', desc: 'Geometric Design', loaded: true },
  { code: 'IRC:SP:50', desc: 'Storm Water Drains', loaded: true },
  { code: 'MORT&H 5th Rev', desc: 'Specifications', loaded: true },
  { code: 'IRC:111-2009', desc: 'Bituminous Mixes', loaded: true },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

      {/* Animated grid background */}
      <div className="grid-bg" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '-15%', left: '25%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.055) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, filter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.045) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, filter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: '40%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1340, margin: '0 auto', width: '100%', padding: '0 36px' }}>

        {/* ── Top Nav ──────────────────────────────── */}
        <motion.header
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '22px 0', borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 38, height: 38, borderRadius: 11,
                background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                boxShadow: '0 0 20px rgba(0,212,255,0.25)',
              }}
            >⬡</motion.div>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 20, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                StreetForge
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                IRC DESIGN PLATFORM v2.0
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Live IRC indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="dot-online" />
              <span style={{ fontSize: 11, color: 'var(--neon-green)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>IRC Standards Live</span>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/about')}>About &amp; Guide</button>
            <button className="btn btn-ghost" style={{ fontSize: 12 }}>IRC Standards</button>
            <motion.button
              className="btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/editor')}
              style={{ fontSize: 13 }}
            >
              + New Project
            </motion.button>
          </div>
        </motion.header>

        {/* ── Hero ─────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          style={{ padding: '52px 0 36px' }}
        >
          <div className="badge badge-cyan" style={{ marginBottom: 18, fontSize: 11 }}>
            IRC:103-2012 · IRC:37-2012 · MORT&H Compliant · 3D-First
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.035em', marginBottom: 18, maxWidth: 680 }}>
            <span className="gradient-text">Next-Gen Street Design</span>
            <br />for Indian Civil Engineers
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.75, maxWidth: 540, marginBottom: 28 }}>
            Design IRC-compliant urban roads with real-time 3D visualization,
            automated pavement calculations, exploded sub-surface views, and instant BoQ generation.
          </p>

          {/* Feature badges */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: '3D Exploded View', color: 'var(--neon-cyan)' },
              { label: 'Underground Utilities', color: 'var(--neon-blue)' },
              { label: 'IRC:37-2012 Auto-Calc', color: 'var(--neon-green)' },
              { label: 'AI Design Partner', color: 'var(--neon-purple)' },
              { label: 'BoQ Export', color: 'var(--neon-amber)' },
              { label: '5-Zone Climatic', color: 'var(--neon-orange)' },
            ].map(b => (
              <span key={b.label} style={{
                padding: '4px 12px', borderRadius: 100,
                background: `${b.color}12`,
                border: `1px solid ${b.color}30`,
                color: b.color,
                fontSize: 11, fontWeight: 600,
              }}>
                {b.label}
              </span>
            ))}
          </div>
        </motion.section>

        {/* ── Metric Cards ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}
        >
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="glass"
              style={{ padding: '22px 26px', cursor: 'default', position: 'relative', overflow: 'hidden' }}
            >
              {/* Shimmer overlay */}
              <div className="animate-shimmer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 22, color: m.color, opacity: 0.85, lineHeight: 1 }}>{m.icon}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  style={{ fontSize: 38, fontWeight: 900, color: m.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}
                >
                  {m.value}
                </motion.span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{m.unit}</span>
              </div>
              <div style={{ marginTop: 14, height: 3, background: 'var(--bg-elevated)', borderRadius: 2 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.pct}%` }}
                  transition={{ duration: 1.2, delay: 0.6 + i * 0.12, ease: [0.4, 0, 0.2, 1] }}
                  style={{ height: '100%', background: m.color, borderRadius: 2, boxShadow: `0 0 10px ${m.color}66` }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Projects + Quick Start ────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, paddingBottom: 60 }}>

          {/* Projects list */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Projects</h2>
              <button className="btn btn-ghost" style={{ fontSize: 11 }}>View All →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {DEMO_PROJECTS.map((proj, i) => {
                const compColor = proj.compliance >= 90 ? 'var(--neon-green)' : proj.compliance >= 80 ? 'var(--neon-amber)' : 'var(--neon-red)';
                return (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.09 }}
                    whileHover={{ x: 4 }}
                    onClick={() => navigate('/editor')}
                    className="glass card-hover"
                    style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 20 }}
                  >
                    {/* Colour compliance strip */}
                    <div style={{ width: 4, height: 52, borderRadius: 2, background: compColor, flexShrink: 0, boxShadow: `0 0 8px ${compColor}44` }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{proj.name}</span>
                        <span className={`badge ${STATUS_COLORS[proj.status]}`}>{proj.status}</span>
                        <span className="badge badge-purple">{proj.category}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        {[
                          `📍 ${proj.location}`,
                          `⟷ ${proj.width}`,
                          `⟶ ${proj.lanes} lanes`,
                          `CBR ${proj.cbr}%`,
                          proj.date,
                        ].map((item, ii) => (
                          <span key={ii} style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-mono)', color: compColor, lineHeight: 1 }}>
                        {proj.compliance}%
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        IRC SCORE
                      </div>
                      <div style={{ marginTop: 4, height: 2, width: 60, background: 'var(--bg-elevated)', borderRadius: 1, marginLeft: 'auto' }}>
                        <div style={{ height: '100%', width: `${proj.compliance}%`, background: compColor, borderRadius: 1 }} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Start + IRC Standards */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
          >
            {/* Quick Start */}
            <div className="glass" style={{ padding: '22px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--neon-cyan)' }}>⚡</span> Quick Start
              </h3>
              {QUICK_STARTS.map(t => (
                <motion.button
                  key={t.label}
                  whileHover={{ x: 5 }}
                  onClick={() => navigate('/editor')}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: 'var(--bg-glass-light)',
                    border: `1px solid ${t.color}18`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    marginBottom: 8,
                    display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${t.color}44`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${t.color}18`; }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.desc}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: t.color, fontSize: 13 }}>→</div>
                </motion.button>
              ))}
            </div>

            {/* IRC Standards */}
            <div className="glass" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(0,212,255,0.04), rgba(139,92,246,0.04))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <div className="dot-online" />
                <div className="neon-text" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em' }}>
                  IRC STANDARDS LOADED
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {IRC_STANDARDS.map((s, i) => (
                  <motion.div
                    key={s.code}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.07 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-green)', boxShadow: '0 0 5px var(--neon-green)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{s.code}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>— {s.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Exploded View CTA */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => navigate('/editor')}
              className="glass"
              style={{
                padding: '18px 22px',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.08))',
                borderColor: 'rgba(139,92,246,0.25)',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>⬆</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Antigravity Exploded View
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Hover-lift your road surface to inspect GSB, WMM, DBM layers and underground utilities in stunning 3D.
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--neon-purple)', fontWeight: 600 }}>
                Open Editor → switch to Exploded →
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
