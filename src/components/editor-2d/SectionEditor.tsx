import { useMemo, useState, useCallback } from 'react';
import { useStreetStore } from '../../store/useStreetStore';
import { SEGMENT_COLORS, SEGMENT_LABELS } from '../../types/street';
import type { SegmentType, StreetSegment } from '../../types/street';
import { motion, AnimatePresence } from 'framer-motion';

const MIN_SEG_PX = 36;

// Visual color-matched style for each type
const SEGMENT_GRADIENTS: Record<SegmentType, string> = {
  carriageway:   'linear-gradient(180deg, #252e55 0%, #1a2040 100%)',
  footpath:      'linear-gradient(180deg, #4a3c30 0%, #362c24 100%)',
  median:        'linear-gradient(180deg, #1c5c34 0%, #144226 100%)',
  'cycle-track': 'linear-gradient(180deg, #0d3870 0%, #082660 100%)',
  parking:       'linear-gradient(180deg, #6a3210 0%, #4e2408 100%)',
  'green-buffer':'linear-gradient(180deg, #1c4a30 0%, #123520 100%)',
  drain:         'linear-gradient(180deg, #0c2040 0%, #081530 100%)',
};

const SEGMENT_PATTERNS: Partial<Record<SegmentType, string>> = {
  carriageway: 'repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(255,255,255,0.018) 3px, rgba(255,255,255,0.018) 4px)',
  footpath: 'repeating-linear-gradient(45deg, transparent 0px, transparent 8px, rgba(255,255,255,0.02) 8px, rgba(255,255,255,0.02) 9px)',
  drain: 'repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(14,165,233,0.06) 4px, rgba(14,165,233,0.06) 5px)',
};

interface SegmentBlockProps {
  seg: StreetSegment;
  index: number;
  isLast: boolean;
  isDragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (id: string) => void;
}

function SegmentBlock({ seg, index: _index, isLast, isDragging, onDragStart, onDragEnd, onDragOver }: SegmentBlockProps) {
  const { updateSegment, removeSegment } = useStreetStore();
  const isCarriageway = seg.type === 'carriageway';
  const isGreen = seg.type === 'median' || seg.type === 'green-buffer';
  const isDrain = seg.type === 'drain';
  const accentColor = SEGMENT_COLORS[seg.type as SegmentType] || '#333';
  const gradient = SEGMENT_GRADIENTS[seg.type as SegmentType] || 'var(--bg-elevated)';
  const pattern = SEGMENT_PATTERNS[seg.type as SegmentType];

  const flexGrow = Math.max(seg.width, 0.5);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow,
        flexShrink: 0,
        minWidth: MIN_SEG_PX,
        position: 'relative',
        height: 100,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
      }}
      draggable
      onDragStart={() => onDragStart(seg.id)}
      onDragEnd={onDragEnd}
      onDragOver={e => { e.preventDefault(); onDragOver(seg.id); }}
    >
      {/* Width label */}
      <div style={{
        textAlign: 'center',
        fontSize: 9,
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
        lineHeight: 1.4,
        flexShrink: 0,
        paddingTop: 2,
        letterSpacing: '0.04em',
      }}>
        {seg.width.toFixed(1)}m
      </div>

      {/* Main block */}
      <motion.div
        className="seg-block"
        whileHover={{ filter: 'brightness(1.18)', y: -1 }}
        transition={{ duration: 0.15 }}
        style={{
          flex: 1,
          margin: '0 1px',
          borderRadius: '5px 5px 0 0',
          background: gradient,
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${accentColor}44`,
          borderBottom: 'none',
          boxShadow: `inset 0 1px 0 ${accentColor}22`,
        }}
      >
        {/* Texture pattern overlay */}
        {pattern && (
          <div style={{ position: 'absolute', inset: 0, background: pattern, pointerEvents: 'none' }} />
        )}

        {/* Top highlight */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `${accentColor}55`,
          pointerEvents: 'none',
        }} />

        {/* Lane dividers on carriageway */}
        {isCarriageway && (seg.lanes || 2) > 1 &&
          Array.from({ length: (seg.lanes || 2) - 1 }).map((_, li) => (
            <div key={li} style={{
              position: 'absolute',
              top: '25%', bottom: 0,
              left: `${((li + 1) / (seg.lanes || 2)) * 100}%`,
              width: 1,
              background: 'rgba(245,240,176,0.3)',
              pointerEvents: 'none',
            }} />
          ))
        }

        {/* Centre line (carriageway) */}
        {isCarriageway && (
          <div style={{
            position: 'absolute',
            top: '50%', left: '48%', right: '49%', bottom: 0,
            background: 'rgba(255,204,0,0.4)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Green fill */}
        {isGreen && (
          <div style={{
            position: 'absolute',
            bottom: 0, left: '20%', right: '20%',
            height: '38%',
            background: 'linear-gradient(180deg, #2a8044, #1a5c2e)',
            borderRadius: '2px 2px 0 0',
            pointerEvents: 'none',
          }} />
        )}

        {/* Drain water fill */}
        {isDrain && (
          <div style={{
            position: 'absolute',
            bottom: 0, left: '10%', right: '10%',
            height: '30%',
            background: 'rgba(14,165,233,0.25)',
            borderRadius: '2px 2px 0 0',
            pointerEvents: 'none',
          }} />
        )}

        {/* Segment name */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: seg.width < 1.5 ? 7 : 8,
            fontFamily: 'var(--font-mono)',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            letterSpacing: '0.04em',
            userSelect: 'none',
            writingMode: seg.width < 1.5 ? 'vertical-rl' : undefined,
            pointerEvents: 'none',
          }}>
            {seg.label}
          </span>
        </div>

        {/* Resize handle (right edge) */}
        {!isLast && (
          <div
            style={{
              position: 'absolute', right: -4, top: 0, bottom: 0,
              width: 8, cursor: 'ew-resize', zIndex: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const startX = e.clientX;
              const startW = seg.width;
              const onMove = (me: MouseEvent) => {
                const dx = (me.clientX - startX) / 40;
                const newW = Math.max(0.5, Math.min(20, startW + dx));
                updateSegment(seg.id, { width: Math.round(newW * 10) / 10 });
              };
              const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
              };
              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onUp);
            }}
          >
            <div style={{
              width: 2, height: 28, borderRadius: 1,
              background: 'rgba(0,212,255,0.7)',
              boxShadow: '0 0 4px rgba(0,212,255,0.5)',
            }} />
          </div>
        )}

        {/* Delete button */}
        <button
          onClick={() => removeSegment(seg.id)}
          style={{
            position: 'absolute', top: 3, right: 4,
            background: 'rgba(239,68,68,0.25)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 3,
            color: '#ef4444',
            fontSize: 8,
            cursor: 'pointer',
            padding: '1px 3px',
            lineHeight: 1,
            opacity: 0,
            transition: 'opacity 0.2s',
            zIndex: 6,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
        >✕</button>

        {/* Drag indicator */}
        <div style={{
          position: 'absolute', top: 3, left: 4,
          display: 'flex', flexDirection: 'column', gap: 2,
          opacity: 0.3, pointerEvents: 'none',
        }}>
          <div style={{ width: 10, height: 1, background: 'rgba(255,255,255,0.4)' }} />
          <div style={{ width: 7, height: 1, background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ width: 10, height: 1, background: 'rgba(255,255,255,0.4)' }} />
        </div>
      </motion.div>

      {/* Ground level bar */}
      <div style={{
        height: 10,
        margin: '0 1px',
        background: isDrain ? '#0c1f40' : isGreen ? '#1a2e20' : '#1e2535',
        borderRadius: '0 0 3px 3px',
        border: `1px solid ${accentColor}22`,
        borderTop: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '60%',
          height: 1,
          background: isDrain ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.06)',
        }} />
      </div>
    </div>
  );
}

export default function SectionEditor() {
  const { project, reorderSegments } = useStreetStore();
  const { segments } = project;

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const totalWidth = useMemo(() => segments.reduce((s, sg) => s + sg.width, 0), [segments]);

  const handleDragEnd = useCallback(() => {
    if (draggingId && dragOverId && draggingId !== dragOverId) {
      const reordered = [...segments];
      const fromIdx = reordered.findIndex(s => s.id === draggingId);
      const toIdx = reordered.findIndex(s => s.id === dragOverId);
      if (fromIdx !== -1 && toIdx !== -1) {
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);
        reorderSegments(reordered);
      }
    }
    setDraggingId(null);
    setDragOverId(null);
  }, [draggingId, dragOverId, segments, reorderSegments]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 16px', userSelect: 'none' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 0 6px',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          2D CROSS-SECTION
        </span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-muted)' }} />
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: 600 }}>
          ROW: {totalWidth.toFixed(1)}m
        </span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-muted)' }} />
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
          {segments.length} segments
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          IRC:103-2012 · Drag to reorder · ⟺ resize handles
        </span>

        {/* Compliance mini-strip */}
        <div style={{ display: 'flex', gap: 4 }}>
          {segments.map(seg => {
            const color = SEGMENT_COLORS[seg.type as SegmentType] || '#333';
            return (
              <div key={seg.id} style={{
                width: Math.max(seg.width * 5, 6),
                height: 6,
                borderRadius: 1,
                background: color,
                opacity: 0.7,
              }} />
            );
          })}
        </div>
      </div>

      {/* Section strip */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '8px 0',
      }}>
        {/* Left GL marker */}
        <div style={{
          width: 28, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end',
          height: 100, paddingBottom: 22,
        }}>
          <div style={{ width: 1, flex: 1, background: 'var(--border-subtle)' }} />
          <span style={{
            fontSize: 7, color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            writingMode: 'vertical-rl',
            marginTop: 4, letterSpacing: '0.06em',
          }}>G/L</span>
        </div>

        <AnimatePresence>
          {segments.map((seg, i) => (
            <motion.div
              key={seg.id}
              layout
              initial={{ opacity: 0, scaleY: 0.8 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 28 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: Math.max(seg.width, 0.5),
                flexShrink: 0,
                minWidth: MIN_SEG_PX,
                position: 'relative',
                height: 100,
              }}
            >
              <SegmentBlock
                seg={seg}
                index={i}
                isLast={i === segments.length - 1}
                isDragging={draggingId === seg.id}
                onDragStart={setDraggingId}
                onDragEnd={handleDragEnd}
                onDragOver={setDragOverId}
              />
              {/* Drop zone highlight */}
              {dragOverId === seg.id && draggingId !== seg.id && (
                <div style={{
                  position: 'absolute', inset: 0,
                  border: '2px dashed rgba(0,212,255,0.5)',
                  borderRadius: 5,
                  pointerEvents: 'none',
                  background: 'rgba(0,212,255,0.04)',
                }} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Right GL marker */}
        <div style={{
          width: 28, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end',
          height: 100, paddingBottom: 22,
        }}>
          <div style={{ width: 1, flex: 1, background: 'var(--border-subtle)' }} />
          <span style={{
            fontSize: 7, color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            writingMode: 'vertical-rl',
            marginTop: 4, letterSpacing: '0.06em',
          }}>G/L</span>
        </div>
      </div>

      {/* Scale bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '4px 0 6px',
        borderTop: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        <div style={{ position: 'relative', height: 10, width: 40 }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--text-muted)' }} />
          <div style={{ position: 'absolute', top: 2, left: 0, width: 1, height: 6, background: 'var(--text-muted)' }} />
          <div style={{ position: 'absolute', top: 2, right: 0, width: 1, height: 6, background: 'var(--text-muted)' }} />
        </div>
        <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>1m</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 12 }}>
          {Object.entries(SEGMENT_LABELS).slice(0, 4).map(([type, label]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: SEGMENT_COLORS[type as SegmentType] }} />
              <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
