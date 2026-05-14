/**
 * ParameterTooltip — plain-English help for complex civil-engineering params.
 * Usage: wrap any <Field> label with <ParameterTooltip paramKey="cbr" />
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

export interface ParamMeta {
  label: string;
  plainEnglish: string;
  unit?: string;
  safeRange?: [number, number];
  presets?: Array<{ label: string; value: number }>;
  glossary?: string;
}

export const PARAM_GLOSSARY: Record<string, ParamMeta> = {
  cbr: {
    label: 'Subgrade CBR',
    plainEnglish:
      'How strong the soil under your road is. Think of it like soil "firmness" on a 0–100 scale. Soft clay = 2%, hard gravel = 10%. Higher = thinner (cheaper) pavement needed.',
    unit: '%',
    safeRange: [2, 10],
    presets: [
      { label: 'Soft clay (very weak)', value: 2 },
      { label: 'Silty soil (weak)', value: 3 },
      { label: 'Typical urban soil', value: 4 },
      { label: 'Sandy soil (moderate)', value: 5 },
      { label: 'Gravelly soil (good)', value: 7 },
      { label: 'Compacted gravel (strong)', value: 10 },
    ],
    glossary: 'California Bearing Ratio (IRC:37-2012). Lab test on soil sample at 95% MDD.',
  },
  trafficVolume: {
    label: 'Traffic Volume (CVPD)',
    plainEnglish:
      'How many commercial trucks use the road daily. Cars barely damage roads — trucks do. This drives how thick your pavement needs to be.',
    unit: 'CVPD (Commercial Vehicles Per Day)',
    safeRange: [50, 5000],
    presets: [
      { label: 'Quiet village road', value: 50 },
      { label: 'Residential street', value: 200 },
      { label: 'Mixed urban road', value: 500 },
      { label: 'Busy urban arterial', value: 1500 },
      { label: 'High-activity commercial', value: 3000 },
    ],
    glossary: 'Commercial Vehicles Per Day. Excludes cars, two-wheelers. Used in IRC:37-2012 Table-1.',
  },
  designLife: {
    label: 'Design Life',
    plainEnglish:
      'How many years the pavement should last before needing major reconstruction. Longer life = thicker, more expensive pavement today, but less disruption later.',
    unit: 'years',
    safeRange: [10, 30],
    presets: [
      { label: 'Short-term (budget)', value: 10 },
      { label: 'Standard (IRC default)', value: 20 },
      { label: 'Long-term (major highway)', value: 30 },
    ],
    glossary: 'Design period per IRC:37-2012. Does not include maintenance overlays.',
  },
  roadLength: {
    label: 'Road Length',
    plainEnglish: 'Total length of the road section being designed. Affects Bill of Quantities (material volumes and costs).',
    unit: 'metres',
    safeRange: [100, 5000],
    glossary: 'Used only for BoQ quantity calculations. Does not affect pavement thickness design.',
  },
  footpathWidth: {
    label: 'Footpath Width',
    plainEnglish:
      'Space reserved for people walking. IRC requires ≥1.5m for urban roads. ≥1.8m is needed for wheelchair access. Wider = safer and more comfortable.',
    unit: 'metres',
    safeRange: [1.5, 5],
    presets: [
      { label: 'Minimum (IRC:103)', value: 1.5 },
      { label: 'Accessible (wheelchair)', value: 1.8 },
      { label: 'Comfortable urban', value: 2.5 },
      { label: 'High pedestrian activity', value: 4.0 },
    ],
    glossary: 'IRC:103-2012 Cl.5.7. Includes clear walking zone only — excludes planters/furniture.',
  },
};

const TOOLTIP_WIDTH = 260;

export default function ParameterTooltip({ paramKey, onPresetSelect }: {
  paramKey: string;
  onPresetSelect?: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const meta = PARAM_GLOSSARY[paramKey];
  if (!meta) return null;

  function handleOpen(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawLeft = rect.left;
    const x = Math.min(rawLeft, window.innerWidth - TOOLTIP_WIDTH - 12);
    const y = rect.bottom + 6;
    setCoords({ x, y });
    setOpen(v => !v);
  }

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleOpen}
        title="What does this mean?"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--neon-cyan)', fontSize: 10, padding: '0 3px',
          lineHeight: 1, verticalAlign: 'middle', opacity: 0.75,
        }}
        aria-label={`Help for ${meta.label}`}
      >
        ⓘ
      </button>

      <AnimatePresence>
        {open && (
          <TooltipPortal
            coords={coords}
            meta={meta}
            onPresetSelect={onPresetSelect}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </span>
  );
}

function TooltipPortal({
  coords, meta, onPresetSelect, onClose,
}: {
  coords: { x: number; y: number };
  meta: ParamMeta;
  onPresetSelect?: (value: number) => void;
  onClose: () => void;
}) {
  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
        aria-hidden="true"
      />

      <motion.div
        key="tooltip"
        initial={{ opacity: 0, scale: 0.93, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'fixed',
          left: coords.x,
          top: coords.y,
          zIndex: 9999,
          width: TOOLTIP_WIDTH,
          background: 'rgba(6,13,31,0.98)',
          border: '1px solid rgba(0,212,255,0.35)',
          borderRadius: 9,
          padding: 13,
          boxShadow: '0 12px 40px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,212,255,0.08)',
          backdropFilter: 'blur(16px)',
          fontFamily: 'var(--font-sans, Inter, sans-serif)',
        }}
        role="dialog"
        aria-label={`Help: ${meta.label}`}
      >
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', letterSpacing: '0.1em', marginBottom: 7, textTransform: 'uppercase' }}>
          {meta.label}
        </div>

        <div style={{ fontSize: 10.5, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 10 }}>
          {meta.plainEnglish}
        </div>

        {meta.presets && onPresetSelect && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 5 }}>
              QUICK PRESETS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {meta.presets.map(p => (
                <button
                  key={p.value}
                  onClick={() => { onPresetSelect(p.value); onClose(); }}
                  style={{
                    textAlign: 'left', padding: '5px 9px', borderRadius: 5,
                    border: '1px solid rgba(0,212,255,0.2)',
                    background: 'rgba(0,212,255,0.06)',
                    cursor: 'pointer', fontSize: 9.5,
                    color: 'var(--text-secondary)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.14)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.06)')}
                >
                  <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {p.value}
                  </span>
                  {' '}{meta.unit} — {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {meta.glossary && (
          <div style={{
            fontSize: 8.5, color: 'var(--text-muted)',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 8, lineHeight: 1.55,
          }}>
            📖 {meta.glossary}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 7, right: 9,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 14, lineHeight: 1,
            padding: '0 2px',
          }}
          aria-label="Close help"
        >
          ×
        </button>
      </motion.div>
    </>,
    document.body,
  );
}
