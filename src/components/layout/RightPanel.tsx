import { useStreetStore } from '../../store/useStreetStore';
import { motion } from 'framer-motion';
import PavementCalcPanel from '../panels/PavementCalcPanel';
import CompliancePanel from '../panels/CompliancePanel';
import DrainagePanel from '../panels/DrainagePanel';
import BoQPanel from '../panels/BoQPanel';
import AIAssistant from '../panels/AIAssistant';

const TABS = [
  { id: 'pavement', label: '⬡ Pavement', short: 'PAV' },
  { id: 'drainage', label: '〜 Drainage', short: 'DRN' },
  { id: 'compliance', label: '✓ Compliance', short: 'IRC' },
  { id: 'boq', label: '₹ BoQ', short: 'BOQ' },
  { id: 'ai', label: '✦ AI', short: 'AI' },
] as const;

type PanelId = typeof TABS[number]['id'];

export default function RightPanel() {
  const { activePanel, setActivePanel } = useStreetStore();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      {/* Tab strip */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', padding: '6px 8px 0', gap: 2, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActivePanel(t.id as PanelId)}
            style={{ padding: '5px 8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-sans)', transition: 'all 0.2s', borderRadius: '5px 5px 0 0', letterSpacing: '0.02em',
              color: activePanel === t.id ? 'var(--neon-cyan)' : 'var(--text-muted)',
              borderBottom: activePanel === t.id ? '2px solid var(--neon-cyan)' : '2px solid transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="scroll-panel" style={{ flex: 1 }}>
        <motion.div key={activePanel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activePanel === 'pavement' && <PavementCalcPanel />}
          {activePanel === 'drainage' && <DrainagePanel />}
          {activePanel === 'compliance' && <CompliancePanel />}
          {activePanel === 'boq' && <BoQPanel />}
          {activePanel === 'ai' && <AIAssistant />}
        </motion.div>
      </div>
    </div>
  );
}
