import { useNavigate } from 'react-router-dom';
import { useStreetStore } from '../../store/useStreetStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { exportPDFReport } from '../../utils/exportPDF';
import { computeWellbeingScores, computeCompositeScore, DEFAULT_WEIGHTS } from '../../utils/wellbeingScore';

interface TopBarProps {
  onToggleSection: () => void;
  sectionOpen: boolean;
}

export default function TopBar({ onToggleSection, sectionOpen }: TopBarProps) {
  const navigate = useNavigate();
  const {
    project, viewMode, setViewMode,
    showGrid, toggleGrid,
    showDimensions, toggleDimensions,
    showLabels, toggleLabels,
    complianceChecks, designMSA, totalPavementThickness,
  } = useStreetStore();

  const [showTelemetry, setShowTelemetry] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const wellbeingMetrics = computeWellbeingScores(project, totalPavementThickness, DEFAULT_WEIGHTS);
      await exportPDFReport({
        project,
        designMSA,
        totalPavementThickness,
        drainageDischarge: useStreetStore.getState().drainageDischarge,
        complianceChecks,
        boqItems: useStreetStore.getState().boqItems,
        wellbeingMetrics,
        compositeWellbeingScore: computeCompositeScore(wellbeingMetrics),
      });
    } finally {
      setExporting(false);
    }
  }

  const passed = complianceChecks.filter(c => c.status === 'pass').length;
  const failed = complianceChecks.filter(c => c.status === 'fail').length;
  const total = complianceChecks.length;
  const score = total > 0 ? Math.round((passed / total) * 100) : 0;
  const scoreColor = score >= 90 ? 'var(--neon-green)' : score >= 75 ? 'var(--neon-amber)' : 'var(--neon-red)';

  return (
    <header style={{
      height: 54,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(6,13,31,0.96)',
      backdropFilter: 'blur(20px)',
      gap: 10,
      flexShrink: 0,
      zIndex: 30,
      position: 'relative',
    }}>
      {/* Scan line accent */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.3) 40%, rgba(139,92,246,0.3) 60%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <motion.button
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 12px 4px 0',
          borderRight: '1px solid var(--border-subtle)',
          marginRight: 2,
          flexShrink: 0,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}
        >
          ⬡
        </motion.div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            StreetForge
          </div>
          <div style={{ fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            IRC PLATFORM
          </div>
        </div>
      </motion.button>

      {/* Project info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {project.name}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--neon-cyan)' }}>{project.roadCategory}</span>
          <span>·</span>
          <span>{project.location}</span>
          <span>·</span>
          <span>{project.climateZone.toUpperCase()}</span>
          <span>·</span>
          <span style={{ color: 'var(--neon-amber)' }}>CBR {project.cbr}%</span>
        </div>
      </div>

      <div style={{ width: 1, height: 30, background: 'var(--border-subtle)' }} />

      {/* Telemetry strip */}
      <motion.button
        onClick={() => setShowTelemetry(v => !v)}
        whileHover={{ scale: 1.02 }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '3px 8px',
          borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: 'var(--font-mono)', fontSize: 10,
        }}
      >
        <TelemetryItem label="MSA" value={`${designMSA}`} color="var(--neon-cyan)" />
        <TelemetryItem label="THICK" value={`${totalPavementThickness}mm`} color="var(--neon-amber)" />
        <TelemetryItem
          label="ROW"
          value={`${project.segments.reduce((s, sg) => s + sg.width, 0).toFixed(1)}m`}
          color="var(--neon-green)"
        />
      </motion.button>

      <div style={{ width: 1, height: 30, background: 'var(--border-subtle)' }} />

      {/* View Mode Toggle */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-elevated)',
        borderRadius: 8, padding: 3, gap: 2,
        border: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        {(['surface', 'exploded'] as const).map(mode => (
          <motion.button
            key={mode}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(mode)}
            style={{
              padding: '4px 11px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s',
              background: viewMode === mode
                ? mode === 'exploded'
                  ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
                  : 'linear-gradient(135deg, var(--neon-cyan), var(--neon-blue))'
                : 'transparent',
              color: viewMode === mode ? 'var(--bg-void)' : 'var(--text-secondary)',
              boxShadow: viewMode === mode
                ? mode === 'exploded'
                  ? '0 2px 8px rgba(139,92,246,0.4)'
                  : '0 2px 8px rgba(0,212,255,0.3)'
                : 'none',
            }}
          >
            {mode === 'surface' ? '⬛ Surface' : '⬆ Exploded'}
          </motion.button>
        ))}
      </div>

      <div style={{ width: 1, height: 30, background: 'var(--border-subtle)' }} />

      {/* Viewport toggles */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {[
          { label: 'Grid', active: showGrid, onClick: toggleGrid, icon: '⌗' },
          { label: 'Dims', active: showDimensions, onClick: toggleDimensions, icon: '↔' },
          { label: 'Labels', active: showLabels, onClick: toggleLabels, icon: '⊞' },
        ].map(t => (
          <button
            key={t.label}
            onClick={t.onClick}
            title={t.label}
            style={{
              padding: '4px 9px',
              borderRadius: 6,
              border: `1px solid ${t.active ? 'var(--border-glow)' : 'var(--border-subtle)'}`,
              background: t.active ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: t.active ? 'var(--neon-cyan)' : 'var(--text-muted)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <span style={{ fontSize: 10 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 30, background: 'var(--border-subtle)' }} />

      {/* Section toggle */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggleSection}
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          border: `1px solid ${sectionOpen ? 'rgba(139,92,246,0.45)' : 'var(--border-subtle)'}`,
          background: sectionOpen ? 'rgba(139,92,246,0.1)' : 'transparent',
          color: sectionOpen ? 'var(--neon-purple)' : 'var(--text-muted)',
          fontSize: 11, fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: 'var(--font-sans)',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        <span>✂</span>
        2D Section {sectionOpen ? '▾' : '▴'}
      </motion.button>

      {/* Compliance score */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          borderRadius: 20,
          background: `${scoreColor}12`,
          border: `1px solid ${scoreColor}44`,
          cursor: 'default',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: scoreColor,
          boxShadow: `0 0 8px ${scoreColor}`,
          animation: 'pulse-glow 2s ease-in-out infinite',
        }} />
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: scoreColor,
          fontFamily: 'var(--font-mono)',
        }}>
          {score}%
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          IRC
        </span>
        {failed > 0 && (
          <span style={{
            fontSize: 9, background: 'rgba(239,68,68,0.15)',
            color: 'var(--neon-red)', padding: '1px 5px',
            borderRadius: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
          }}>
            {failed}✗
          </span>
        )}
      </motion.div>

      {/* About link */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => navigate('/about')}
        style={{ padding: '5px 11px', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0 }}
      >
        ? Guide
      </motion.button>

      {/* Export PDF button */}
      <motion.button
        className="btn btn-primary"
        whileHover={{ scale: exporting ? 1 : 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleExport}
        disabled={exporting}
        title="Export styled PDF report"
        style={{
          fontSize: 11, padding: '5px 14px', flexShrink: 0,
          gap: 5, display: 'flex', alignItems: 'center',
          opacity: exporting ? 0.7 : 1,
          cursor: exporting ? 'wait' : 'pointer',
        }}
      >
        {exporting ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block' }}
            >
              ↻
            </motion.span>
            Generating…
          </>
        ) : (
          <><span>⤓</span> Export PDF</>
        )}
      </motion.button>
    </header>
  );
}

function TelemetryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color, lineHeight: 1.2 }}>{value}</span>
    </div>
  );
}
