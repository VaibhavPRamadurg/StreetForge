/**
 * WellbeingScorePanel
 * Renders the wellbeing/environment performance "layer stack" in the
 * Pavement panel. Mirrors the visual style of the material layer stack.
 *
 * Features
 * ─────────
 * • 0–100 score per metric with color-coded bar + icon
 * • Short textual rationale per metric
 * • Expandable admin weight configurator
 * • Animated composite score ring
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreetStore } from '../../store/useStreetStore';
import {
  computeWellbeingScores,
  computeCompositeScore,
  DEFAULT_WEIGHTS,
  type WellbeingWeights,
  type WellbeingMetric,
} from '../../utils/wellbeingScore';

const CATEGORY_COLORS = {
  safety: 'var(--neon-red)',
  environment: 'var(--neon-green)',
  mobility: 'var(--neon-cyan)',
  maintenance: 'var(--neon-amber)',
};

const CATEGORY_LABELS = {
  safety: 'Safety',
  environment: 'Environment',
  mobility: 'Mobility',
  maintenance: 'Maintenance',
};

export default function WellbeingScorePanel() {
  const { project, totalPavementThickness } = useStreetStore();
  const [weights, setWeights] = useState<WellbeingWeights>(DEFAULT_WEIGHTS);
  const [showWeights, setShowWeights] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const metrics = computeWellbeingScores(project, totalPavementThickness, weights);
  const composite = computeCompositeScore(metrics);
  const compositeColor =
    composite >= 75 ? 'var(--neon-green)'
    : composite >= 50 ? 'var(--neon-amber)'
    : composite >= 30 ? '#f97316'
    : 'var(--neon-red)';

  function updateWeight(key: keyof WellbeingWeights, val: number) {
    setWeights(prev => ({ ...prev, [key]: val }));
  }

  const WEIGHT_META: Array<{ key: keyof WellbeingWeights; label: string }> = [
    { key: 'pedestrianSafety', label: 'Pedestrian Safety' },
    { key: 'airNoisePollution', label: 'Air & Noise Quality' },
    { key: 'stormwaterManagement', label: 'Stormwater Mgmt' },
    { key: 'urbanHeatIsland', label: 'Urban Heat Island' },
    { key: 'accessibility', label: 'Accessibility' },
    { key: 'activeTransport', label: 'Active Transport' },
    { key: 'maintenanceBurden', label: 'Maintenance Ease' },
  ];

  // Group by category
  const byCategory = (['safety', 'environment', 'mobility', 'maintenance'] as const).map(cat => ({
    cat,
    items: metrics.filter(m => m.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 8 }}>

      {/* Header */}
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        WELLBEING & ENVIRONMENT SCORE
      </div>

      {/* Composite score ring */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 8, background: `${compositeColor}0a`, border: `1px solid ${compositeColor}33` }}>
        <CompositeRing score={composite} color={compositeColor} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            Composite Score
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', maxWidth: 160 }}>
            Weighted average across {metrics.length} wellbeing metrics (0–100 scale)
          </div>
        </div>
      </div>

      {/* Metric stacks by category */}
      {byCategory.map(({ cat, items }) => (
        <div key={cat}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: CATEGORY_COLORS[cat], letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
            {CATEGORY_LABELS[cat]}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {items.map((metric, i) => (
              <MetricRow
                key={metric.id}
                metric={metric}
                index={i}
                expanded={expandedMetric === metric.id}
                onToggle={() => setExpandedMetric(expandedMetric === metric.id ? null : metric.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Admin weight configurator */}
      <div>
        <button
          onClick={() => setShowWeights(v => !v)}
          style={{
            width: '100%', padding: '6px 10px', background: 'var(--bg-glass-light)',
            border: '1px solid var(--border-subtle)', borderRadius: 6, cursor: 'pointer',
            fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
            letterSpacing: '0.06em', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span>{showWeights ? '▾' : '▸'}</span>
          ⚙ ADMIN — Configure Metric Weights
        </button>
        <AnimatePresence>
          {showWeights && (
            <motion.div
              key="weights"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '10px 10px 6px', background: 'var(--bg-glass-light)', borderRadius: '0 0 6px 6px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {WEIGHT_META.map(({ key, label }) => {
                  const val = weights[key];
                  const pct = Math.round(val * 100);
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 9, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>{pct}%</span>
                      </div>
                      <input
                        type="range"
                        className="slider"
                        min={1} max={40} step={1}
                        value={pct}
                        onChange={e => updateWeight(key, +e.target.value / 100)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  );
                })}
                <button
                  onClick={() => setWeights(DEFAULT_WEIGHTS)}
                  style={{ alignSelf: 'flex-end', fontSize: 9, padding: '3px 10px', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 4, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  Reset to defaults
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Methodology note */}
      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', padding: '6px 10px', background: 'var(--bg-glass-light)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
        ⓘ All scores 0–100 (higher = better). Composite = Σ(score × weight) / Σ weight. Inputs: road geometry, pavement design, traffic volume.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricRow({
  metric, index, expanded, onToggle,
}: {
  metric: WellbeingMetric;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { score, color, icon, label, rationale } = metric;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{ borderRadius: 5, overflow: 'hidden', border: `1px solid ${color}22`, cursor: 'pointer' }}
      onClick={onToggle}
    >
      {/* Main row */}
      <div style={{ background: `${color}10`, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </div>
        </div>
        {/* Score chip */}
        <div style={{
          flexShrink: 0, minWidth: 38, textAlign: 'center',
          padding: '2px 6px', borderRadius: 4,
          background: `${color}22`, border: `1px solid ${color}44`,
        }}>
          <span style={{ fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-mono)', color }}>{score}</span>
          <span style={{ fontSize: 7, color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>/100</span>
        </div>
        <span style={{ fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>{expanded ? '▾' : '▸'}</span>
      </div>
      {/* Score bar */}
      <div style={{ height: 3, background: 'var(--bg-elevated)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: index * 0.08 }}
          style={{ height: '100%', background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
      {/* Expanded rationale */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="rationale"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '7px 10px', fontSize: 10, color: 'var(--text-secondary)',
              background: 'var(--bg-elevated)', borderTop: `1px solid ${color}22`,
              lineHeight: 1.5,
            }}>
              {rationale}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CompositeRing({ score, color }: { score: number; color: string }) {
  const R = 22;
  const circumference = 2 * Math.PI * R;
  const dash = (score / 100) * circumference;

  return (
    <svg width={56} height={56} style={{ flexShrink: 0 }}>
      <circle cx={28} cy={28} r={R} stroke="rgba(255,255,255,0.07)" strokeWidth={4} fill="none" />
      <motion.circle
        cx={28} cy={28} r={R}
        stroke={color}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        transform="rotate(-90 28 28)"
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      />
      <text
        x={28} y={28}
        textAnchor="middle" dominantBaseline="central"
        fontSize={13} fontWeight={800}
        fontFamily="var(--font-mono)" fill={color}
      >
        {score}
      </text>
    </svg>
  );
}
