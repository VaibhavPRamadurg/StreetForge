import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TECH_STACK = [
  {
    category: 'Frontend Core',
    color: 'var(--neon-cyan)',
    icon: '⚛',
    items: [
      { name: 'React 19', desc: 'Component-based UI with concurrent features', badge: 'v19.2' },
      { name: 'TypeScript', desc: 'Strict type safety across the entire codebase', badge: 'v6.0' },
      { name: 'Vite', desc: 'Lightning-fast HMR and optimised build pipeline', badge: 'v8.0' },
    ],
  },
  {
    category: '3D Visualization',
    color: 'var(--neon-purple)',
    icon: '⬡',
    items: [
      { name: 'Three.js', desc: 'WebGL-powered 3D road and layer geometry', badge: 'r184' },
      { name: 'React Three Fiber', desc: 'Declarative Three.js with React reconciler', badge: 'v9.6' },
      { name: '@react-three/drei', desc: 'OrbitControls, Grid, Stars, Html overlays', badge: 'v10.7' },
    ],
  },
  {
    category: 'UI & Animations',
    color: 'var(--neon-pink)',
    icon: '✦',
    items: [
      { name: 'Framer Motion', desc: 'Spring physics animations, AnimatePresence', badge: 'v12' },
      { name: 'Lucide React', desc: 'Crisp icon set for engineering UI', badge: 'v1.14' },
      { name: 'CSS Variables', desc: 'Token-based design system, glassmorphism', badge: 'Native' },
    ],
  },
  {
    category: 'State & Routing',
    color: 'var(--neon-green)',
    icon: '⟳',
    items: [
      { name: 'Zustand', desc: 'Lightweight reactive state — JSON-to-Road pattern', badge: 'v5.0' },
      { name: 'React Router', desc: 'Client-side routing — /, /editor, /about', badge: 'v7.15' },
      { name: 'Recharts', desc: 'Engineering data charts in panel views', badge: 'v3.8' },
    ],
  },
  {
    category: 'Engineering Engine',
    color: 'var(--neon-amber)',
    icon: '⚙',
    items: [
      { name: 'IRC:37-2012', desc: 'Pavement thickness — bilinear interpolation table', badge: 'Built-in' },
      { name: 'IRC:103-2012', desc: 'Urban road geometry, lane & ROW compliance', badge: 'Built-in' },
      { name: 'Rational Method', desc: 'Drainage discharge Q = C·I·A / 360', badge: 'Built-in' },
    ],
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Start from Dashboard',
    color: 'var(--neon-cyan)',
    icon: '🏠',
    desc: 'The Dashboard shows your recent projects with IRC compliance scores. Click any project card to open it in the editor, or click "+ New Project" to start fresh.',
    tips: ['Click any project card to jump to the editor', 'Use Quick Start templates for common road types (MDR, NH, VR)', 'The compliance score colour — green ≥90%, amber ≥75%, red below'],
  },
  {
    step: '02',
    title: 'Configure Project Parameters',
    color: 'var(--neon-purple)',
    icon: '⚙️',
    desc: 'In the left panel, set your project details and engineering inputs. All values auto-trigger recalculation of pavement thickness, compliance checks, and BoQ.',
    tips: ['Road Category (NH/SH/MDR/ODR/VR) controls minimum lane widths', 'Climate Zone (IRC:37) influences material recommendations', 'CBR slider (2–10%) directly changes pavement thickness', 'Traffic (CVPD) + Design Life = design traffic in msa'],
  },
  {
    step: '03',
    title: 'Design the Cross-Section',
    color: 'var(--neon-green)',
    icon: '✂️',
    desc: 'Switch to the "Segments" tab in the left panel to add/remove road elements. The 2D section editor at the bottom shows your live cross-section.',
    tips: ['Click segment type buttons to add a new segment', 'Drag the ⟺ cyan handles in the 2D editor to resize widths', 'Drag segments left/right in the 2D editor to reorder them', 'Hover a segment and click ✕ to remove it'],
  },
  {
    step: '04',
    title: 'Explore the 3D Viewport',
    color: 'var(--neon-amber)',
    icon: '🌐',
    desc: 'The centre canvas shows a real-time 3D model of your road. Use mouse controls to orbit, pan, and zoom. Toggle labels and dimensions from the top bar.',
    tips: ['Left drag — orbit the camera', 'Right drag — pan the view', 'Scroll — zoom in / out', 'Toggle Grid, Dims, Labels from the top bar buttons'],
  },
  {
    step: '05',
    title: 'Activate Antigravity Exploded View',
    color: 'var(--neon-purple)',
    icon: '⬆️',
    desc: 'Click "⬆ Exploded" in the top bar. The road surface hover-lifts to reveal the complete IRC:37-2012 pavement layer stack — BC, DBM, WMM, GSB, Subgrade — plus underground utilities.',
    tips: ['Layers separate with staggered animation (antigravity effect)', 'Right-side labels show material, thickness (mm), and IRC reference', 'Underground utilities (water, sewer, cable, gas) appear below', 'Switch back to Surface to collapse the view smoothly'],
  },
  {
    step: '06',
    title: 'Review Engineering Panels',
    color: 'var(--neon-orange)',
    icon: '📊',
    desc: 'The right panel contains five engineering modules — switch between them using the tab strip at the top.',
    tips: [
      '⬡ Pavement — IRC:37-2012 layer thicknesses with % breakdown',
      '〜 Drainage — Q=CIA/360 rational method calculator',
      '✓ Compliance — per-clause IRC:103-2012 pass/fail/warning table',
      '₹ BoQ — Bill of Quantities with MORT&H SOR 2019 rates',
      '✦ AI — Ask the IRC Design AI about compliance, costs, green infra',
    ],
  },
  {
    step: '07',
    title: 'Ask the AI Design Partner',
    color: 'var(--neon-cyan)',
    icon: '✦',
    desc: 'Open the AI tab in the right panel. Type questions about your project or click the quick-prompt buttons. The AI is aware of your current project parameters.',
    tips: [
      '"Check IRC compliance" — full clause-by-clause review',
      '"Explain pavement layers" — WMM, DBM, BC explanation',
      '"Drainage sizing help" — Q formula walkthrough',
      '"Green infra suggestions" — bioswales, porous pavement',
      '"Cost optimization tips" — RAP recycled asphalt, value engineering',
    ],
  },
  {
    step: '08',
    title: 'Export Your Design',
    color: 'var(--neon-green)',
    icon: '⤓',
    desc: 'Click "⤓ Export" in the top-right to export your design. The BoQ panel also lets you review item-wise quantities and rates before exporting.',
    tips: ['BoQ export includes all MORT&H SOR 2019 rates', 'PDF format maintains professional report formatting', 'DWG/DXF export planned for Phase 2'],
  },
];

const IRC_REFS = [
  { code: 'IRC:103-2012', title: 'Urban Roads — Geometric Design', use: 'Lane widths, footpath, median, ROW' },
  { code: 'IRC:37-2012', title: 'Pavement Design (Flexible)', use: 'Total thickness, layer distribution' },
  { code: 'IRC:86-1983', title: 'Geometric Design of State Roads', use: 'Minimum ROW per road category' },
  { code: 'IRC:111-2009', title: 'Bituminous Mixes', use: 'BC and DBM material specs' },
  { code: 'IRC:109-1997', title: 'WMM Specifications', use: 'Wet Mix Macadam base course' },
  { code: 'IRC:SP:50-2013', title: 'Urban Drainage', use: 'Rational method, drain sizing' },
  { code: 'IRC:SP:72-2015', title: 'GSB Specifications', use: 'Granular Sub-Base Grade-I' },
  { code: 'MORT&H 5th Rev', title: 'Specifications for Road Works', use: 'BoQ rates, construction items' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', overflowY: 'auto', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
      {/* Grid bg */}
      <div className="grid-bg" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-5%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1140, margin: '0 auto', padding: '0 36px 80px' }}>

        {/* ── Nav ───────────────────────────────────── */}
        <motion.header {...fadeUp(0)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}>⬡</motion.div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em' }}>StreetForge</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>IRC DESIGN PLATFORM v2.0</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/')}>← Dashboard</button>
            <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => navigate('/editor')}>Open Editor →</button>
          </div>
        </motion.header>

        {/* ── Hero ──────────────────────────────────── */}
        <motion.section {...fadeUp(0.05)} style={{ textAlign: 'center', marginBottom: 80 }}>
          <div className="badge badge-purple" style={{ marginBottom: 16, fontSize: 11 }}>Platform Documentation</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            <span className="gradient-text">About StreetForge</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            A next-generation IRC-compliant road design platform built for Indian Civil Engineers — combining the intuition of StreetMix with the precision of Civil 3D and the aesthetics of premium 3D web tools.
          </p>
        </motion.section>

        {/* ── Tech Stack ────────────────────────────── */}
        <motion.section {...fadeUp(0.1)} style={{ marginBottom: 88 }}>
          <SectionTitle icon="⚙" label="Tech Stack" subtitle="Every library chosen for performance, precision, and premium UX" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {TECH_STACK.map((group, gi) => (
              <motion.div key={group.category} {...fadeUp(0.12 + gi * 0.07)} className="glass" style={{ padding: '22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `${group.color}18`, border: `1px solid ${group.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: group.color }}>
                    {group.icon}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: group.color, letterSpacing: '0.04em' }}>{group.category}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {group.items.map(item => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ marginTop: 2, width: 5, height: 5, borderRadius: '50%', background: group.color, flexShrink: 0, boxShadow: `0 0 6px ${group.color}` }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</span>
                          <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 100, background: `${group.color}15`, color: group.color, fontFamily: 'var(--font-mono)', border: `1px solid ${group.color}30` }}>{item.badge}</span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Usage Guide ───────────────────────────── */}
        <motion.section {...fadeUp(0.15)} style={{ marginBottom: 88 }}>
          <SectionTitle icon="📖" label="How to Use StreetForge" subtitle="Step-by-step guide from project setup to export" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {STEPS.map((step, si) => (
              <motion.div key={step.step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + si * 0.06, duration: 0.4 }}
                className="glass" style={{ padding: '24px 28px', display: 'flex', gap: 24, borderLeft: `3px solid ${step.color}` }}>
                {/* Step number */}
                <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 14, background: `${step.color}12`, border: `1px solid ${step.color}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{step.icon}</span>
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: step.color, fontWeight: 700, marginTop: 2 }}>{step.step}</span>
                </div>
                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{step.title}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 12 }}>{step.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {step.tips.map((tip, ti) => (
                      <div key={ti} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: step.color, fontSize: 12, flexShrink: 0, marginTop: 1 }}>›</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── IRC References ────────────────────────── */}
        <motion.section {...fadeUp(0.2)} style={{ marginBottom: 72 }}>
          <SectionTitle icon="📋" label="IRC Standards Referenced" subtitle="All calculations are anchored to official BIS/IRC publications" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {IRC_REFS.map((ref, ri) => (
              <motion.div key={ref.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 + ri * 0.05 }}
                style={{ display: 'flex', gap: 14, padding: '16px 20px', background: 'rgba(0,212,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-green)', boxShadow: '0 0 6px var(--neon-green)', flexShrink: 0, marginTop: 6 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>{ref.code}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>{ref.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Used for: {ref.use}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ───────────────────────────────────── */}
        <motion.div {...fadeUp(0.25)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <motion.div whileHover={{ scale: 1.01 }} onClick={() => navigate('/editor')} className="glass"
            style={{ padding: '28px 32px', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(0,212,255,0.07), rgba(59,130,246,0.04))', borderColor: 'rgba(0,212,255,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⬡</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Open the Editor</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.6 }}>Start designing an IRC-compliant road with the full 3D visualization suite.</div>
            <button className="btn btn-primary" style={{ fontSize: 13 }}>Launch Editor →</button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.01 }} onClick={() => navigate('/')} className="glass"
            style={{ padding: '28px 32px', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(139,92,246,0.07), rgba(139,92,246,0.03))', borderColor: 'rgba(139,92,246,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⬆</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>View Dashboard</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.6 }}>Browse your projects, check compliance scores, and start from quick-start templates.</div>
            <button className="btn btn-purple" style={{ fontSize: 13 }}>Go to Dashboard →</button>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}

function SectionTitle({ icon, label, subtitle }: { icon: string; label: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{label}</h2>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', paddingLeft: 28 }}>{subtitle}</p>
    </div>
  );
}
