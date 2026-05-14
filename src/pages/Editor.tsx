import { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import LeftPanel from '../components/layout/LeftPanel';
import RightPanel from '../components/layout/RightPanel';
import RoadScene from '../components/editor-3d/RoadScene';
import SectionEditor from '../components/editor-2d/SectionEditor';
import { useStreetStore } from '../store/useStreetStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Editor() {
  const { showDimensions, viewMode, complianceChecks } = useStreetStore();
  const [sectionOpen, setSectionOpen] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const passed = complianceChecks.filter(c => c.status === 'pass').length;
  const total = complianceChecks.length;
  const score = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-void)',
      overflow: 'hidden',
    }}>
      <TopBar onToggleSection={() => setSectionOpen(v => !v)} sectionOpen={sectionOpen} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* ── Left Panel ───────────────────────────── */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.div
              key="left"
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                width: 280,
                flexShrink: 0,
                borderRight: '1px solid var(--border-subtle)',
                overflowY: 'auto',
                overflowX: 'hidden',
                zIndex: 10,
                background: 'var(--bg-deep)',
              }}
            >
              <LeftPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle left */}
        <motion.button
          onClick={() => setLeftOpen(v => !v)}
          whileHover={{ scale: 1.1 }}
          style={{
            position: 'absolute',
            left: leftOpen ? 280 : 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderLeft: leftOpen ? 'none' : undefined,
            borderRight: leftOpen ? undefined : 'none',
            borderRadius: leftOpen ? '0 7px 7px 0' : '7px 0 0 7px',
            padding: '10px 5px',
            cursor: 'pointer',
            color: 'var(--neon-cyan)',
            transition: 'left 0.35s cubic-bezier(0.4,0,0.2,1)',
            fontSize: 11,
          }}
        >
          {leftOpen ? '‹' : '›'}
        </motion.button>

        {/* ── Centre 3D Viewport ───────────────────── */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <RoadScene />

            {/* Bottom-left badge strip */}
            <div style={{
              position: 'absolute', bottom: 16, left: 16,
              display: 'flex', gap: 8, zIndex: 10,
              flexWrap: 'wrap',
            }}>
              <ViewportBadge label="Three.js R3F" color="var(--neon-cyan)" />
              <ViewportBadge label="IRC:37-2012" color="var(--neon-green)" />
              {showDimensions && <ViewportBadge label="Dims ON" color="var(--neon-amber)" />}
              <ViewportBadge label={`${score}% Compliant`} color={score >= 90 ? 'var(--neon-green)' : score >= 75 ? 'var(--neon-amber)' : 'var(--neon-red)'} />
            </div>

            {/* Top-left scene mode indicator */}
            <div style={{
              position: 'absolute', top: 12, left: 12,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(3,7,18,0.75)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6, padding: '4px 10px',
              pointerEvents: 'none',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: viewMode === 'exploded' ? '#8b5cf6' : '#00d4ff', boxShadow: `0 0 6px ${viewMode === 'exploded' ? '#8b5cf6' : '#00d4ff'}`, animation: 'pulse-glow 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: viewMode === 'exploded' ? 'var(--neon-purple)' : 'var(--neon-cyan)', letterSpacing: '0.08em' }}>
                {viewMode === 'exploded' ? 'EXPLODED · ANTIGRAVITY VIEW' : 'SURFACE VIEW · LIVE'}
              </span>
            </div>
          </div>

          {/* ── 2D Section Editor ─────────────────── */}
          <AnimatePresence initial={false}>
            {sectionOpen && (
              <motion.div
                key="section"
                initial={{ y: 220, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 220, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                style={{
                  height: 190,
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'rgba(6,13,31,0.95)',
                  backdropFilter: 'blur(12px)',
                  flexShrink: 0,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                }}
              >
                <SectionEditor />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle right */}
        <motion.button
          onClick={() => setRightOpen(v => !v)}
          whileHover={{ scale: 1.1 }}
          style={{
            position: 'absolute',
            right: rightOpen ? 308 : 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: rightOpen ? '7px 0 0 7px' : '0 7px 7px 0',
            padding: '10px 5px',
            cursor: 'pointer',
            color: 'var(--neon-cyan)',
            transition: 'right 0.35s cubic-bezier(0.4,0,0.2,1)',
            fontSize: 11,
          }}
        >
          {rightOpen ? '›' : '‹'}
        </motion.button>

        {/* ── Right Panel ──────────────────────────── */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.div
              key="right"
              initial={{ x: 310, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 310, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                width: 308,
                flexShrink: 0,
                borderLeft: '1px solid var(--border-subtle)',
                overflowY: 'auto',
                overflowX: 'hidden',
                zIndex: 10,
                background: 'var(--bg-deep)',
              }}
            >
              <RightPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ViewportBadge({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(3,7,18,0.82)',
      border: `1px solid ${color}44`,
      borderRadius: 5,
      padding: '3px 9px',
      fontSize: 10,
      fontFamily: 'var(--font-mono)',
      color,
      letterSpacing: '0.06em',
      backdropFilter: 'blur(8px)',
    }}>
      {label}
    </div>
  );
}
