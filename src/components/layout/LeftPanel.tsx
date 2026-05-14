import { useState } from 'react';
import { useStreetStore } from '../../store/useStreetStore';
import { ROAD_CATEGORY_LABELS, CLIMATE_ZONE_LABELS, SEGMENT_LABELS, SEGMENT_COLORS } from '../../types/street';
import type { SegmentType, RoadCategory, ClimateZone } from '../../types/street';
import { motion } from 'framer-motion';
import ParameterTooltip from '../ui/ParameterTooltip';

const SEGMENT_TYPES: SegmentType[] = ['carriageway', 'footpath', 'median', 'cycle-track', 'parking', 'green-buffer', 'drain'];

let segCounter = 100;

export default function LeftPanel() {
  const { project, updateProject, updateSegment, addSegment, removeSegment, designMSA, totalPavementThickness, roadLength, setRoadLength } = useStreetStore();
  const [tab, setTab] = useState<'project' | 'segments'>('project');

  const totalWidth = project.segments.reduce((s, sg) => s + sg.width, 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      {/* Tab Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', padding: '8px 12px 0', gap: 4 }}>
        {(['project', 'segments'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '6px 8px', border: 'none', background: 'none', borderRadius: '6px 6px 0 0', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', transition: 'all 0.2s',
              color: tab === t ? 'var(--neon-cyan)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--neon-cyan)' : '2px solid transparent' }}>
            {t === 'project' ? '⚙ Project' : '⬡ Segments'}
          </button>
        ))}
      </div>

      <div className="scroll-panel" style={{ flex: 1, padding: 12 }}>
        {tab === 'project' ? (
          <motion.div key="project" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Project Name">
              <input className="input" value={project.name} onChange={e => updateProject({ name: e.target.value })} />
            </Field>
            <Field label="Location">
              <input className="input" value={project.location} onChange={e => updateProject({ location: e.target.value })} />
            </Field>
            <Field label="Road Category">
              <select className="select" value={project.roadCategory} onChange={e => updateProject({ roadCategory: e.target.value as RoadCategory })}>
                {Object.entries(ROAD_CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{v} — {l}</option>)}
              </select>
            </Field>
            <Field label="Climate Zone (IRC:37)">
              <select className="select" value={project.climateZone} onChange={e => updateProject({ climateZone: e.target.value as ClimateZone })}>
                {Object.entries(CLIMATE_ZONE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>

            <div className="divider" />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: -6 }}>Design Parameters</div>

            <Field label={<>Design Life: {project.designLife} yrs <ParameterTooltip paramKey="designLife" onPresetSelect={v => updateProject({ designLife: v })} /></>}>
              <input type="range" className="slider" min={10} max={30} step={5} value={project.designLife} onChange={e => updateProject({ designLife: +e.target.value })} />
            </Field>
            <Field label={<>CBR: {project.cbr}% <ParameterTooltip paramKey="cbr" onPresetSelect={v => updateProject({ cbr: v })} /></>}>
              <input type="range" className="slider" min={2} max={10} step={1} value={project.cbr} onChange={e => updateProject({ cbr: +e.target.value })} />
            </Field>
            <Field label={<>Traffic: {project.trafficVolume} CVPD <ParameterTooltip paramKey="trafficVolume" onPresetSelect={v => updateProject({ trafficVolume: v })} /></>}>
              <input type="range" className="slider" min={50} max={5000} step={50} value={project.trafficVolume} onChange={e => updateProject({ trafficVolume: +e.target.value })} />
            </Field>
            <Field label={<>Road Length: {roadLength}m <ParameterTooltip paramKey="roadLength" onPresetSelect={v => setRoadLength(v)} /></>}>
              <input type="range" className="slider" min={100} max={5000} step={100} value={roadLength} onChange={e => setRoadLength(+e.target.value)} />
            </Field>

            <div className="divider" />

            {/* Computed summary */}
            <div className="glass" style={{ padding: 12, background: 'rgba(0,212,255,0.04)' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8 }}>COMPUTED OUTPUTS</div>
              <StatRow label="Design Traffic" value={`${designMSA} msa`} color="var(--neon-cyan)" />
              <StatRow label="Pavement Thickness" value={`${totalPavementThickness} mm`} color="var(--neon-amber)" />
              <StatRow label="Total Road Width" value={`${totalWidth.toFixed(1)} m`} color="var(--neon-green)" />
            </div>
          </motion.div>
        ) : (
          <motion.div key="segments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Palette */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Add Segment</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {SEGMENT_TYPES.map(type => (
                <motion.button key={type} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => addSegment({ id: `seg-${segCounter++}`, type, label: SEGMENT_LABELS[type], width: type === 'carriageway' ? 7 : type === 'median' ? 1.5 : 2.0, lanes: type === 'carriageway' ? 2 : undefined })}
                  style={{ padding: '7px 8px', border: '1px solid var(--border-subtle)', borderRadius: 7, cursor: 'pointer', background: 'var(--bg-glass-light)', color: 'var(--text-secondary)', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: SEGMENT_COLORS[type], flexShrink: 0 }} />
                  {SEGMENT_LABELS[type]}
                </motion.button>
              ))}
            </div>

            <div className="divider" />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Segments ({project.segments.length}) — {totalWidth.toFixed(1)}m</div>

            {project.segments.map((seg, i) => (
              <motion.div key={seg.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="glass" style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 24, borderRadius: 3, background: SEGMENT_COLORS[seg.type], flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seg.label}</div>
                  <button onClick={() => removeSegment(seg.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neon-red)', fontSize: 13, padding: '0 2px', lineHeight: 1 }}>✕</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>W: {seg.width.toFixed(1)}m</span>
                  <input type="range" className="slider" style={{ flex: 1 }} min={0.5} max={20} step={0.5} value={seg.width}
                    onChange={e => updateSegment(seg.id, { width: +e.target.value })} />
                </div>
                {seg.type === 'carriageway' && (
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Lanes:</span>
                    {[1, 2, 3, 4].map(n => (
                      <button key={n} onClick={() => updateSegment(seg.id, { lanes: n })}
                        style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${seg.lanes === n ? 'var(--neon-cyan)' : 'var(--border-subtle)'}`, background: seg.lanes === n ? 'rgba(0,212,255,0.15)' : 'transparent', color: seg.lanes === n ? 'var(--neon-cyan)' : 'var(--text-muted)', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}>{n}</button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 5, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 2 }}>{label}</div>
      {children}
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color }}>{value}</span>
    </div>
  );
}
