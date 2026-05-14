import { useState, useRef, useEffect } from 'react';
import { useStreetStore } from '../../store/useStreetStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Message { id: string; role: 'user' | 'ai'; text: string; timestamp: Date; }

const CANNED_RESPONSES: Record<string, string> = {
  default: "I'm your IRC Design Assistant. Ask me about IRC standards, pavement design, drainage, or compliance requirements for your current project.",
  compliance: "Your current design has some compliance considerations. Per **IRC:103-2012**, each carriageway lane should be ≥3.5m for NH/SH or ≥3.0m for MDR. I recommend checking your footpath width meets the ≥1.5m urban minimum.",
  pavement: "Based on your CBR and traffic inputs, the pavement design follows **IRC:37-2012 Table-1**. For CBR 4% with moderate traffic, WMM base of 250mm with GSB 250mm is standard. Consider stabilised subgrade if CBR < 3%.",
  drainage: "Using the **Rational Method Q=CIA/360**, your catchment needs proper drain sizing. For urban roads, use **IRC:SP:50-2013** for storm water drains. Minimum slope of 0.5% is recommended to prevent silting.",
  green: "For a **Green Infrastructure** approach: (1) Replace conventional median with bioswales (800mm wide), (2) Add porous footpath paving for infiltration, (3) Tree pits in median reduce urban heat island by 3-5°C — aligns with **Smart Cities Mission** guidelines.",
  cost: "Your estimated cost includes standard MoRT&H SOR rates. Key cost drivers: Bituminous layers (BC+DBM) typically account for 45-55% of pavement cost. Consider using **Recycled Asphalt Pavement (RAP)** for DBM to reduce cost by 15-20%.",
  climate: "For your selected climate zone, IRC:37-2012 recommends: Wet/Humid zones require enhanced drainage provision, 2% cross-fall minimum. Arid zones — use modified bitumen VG-40 for high temperature stability. Hilly zones — special provision for frost action on subgrade.",
};

function getAIResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('compli') || lower.includes('irc')) return CANNED_RESPONSES.compliance;
  if (lower.includes('pavement') || lower.includes('cbr') || lower.includes('layer')) return CANNED_RESPONSES.pavement;
  if (lower.includes('drain') || lower.includes('water') || lower.includes('rainfall')) return CANNED_RESPONSES.drainage;
  if (lower.includes('green') || lower.includes('sustainab') || lower.includes('bioswale')) return CANNED_RESPONSES.green;
  if (lower.includes('cost') || lower.includes('boq') || lower.includes('price')) return CANNED_RESPONSES.cost;
  if (lower.includes('climat') || lower.includes('zone') || lower.includes('temperature')) return CANNED_RESPONSES.climate;
  return CANNED_RESPONSES.default;
}

const QUICK_PROMPTS = [
  'Check IRC compliance', 'Explain pavement layers', 'Drainage sizing help', 'Green infra suggestions', 'Cost optimization tips',
];

export default function AIAssistant() {
  const { project, complianceChecks } = useStreetStore();
  const score = complianceChecks.length > 0 ? Math.round((complianceChecks.filter(c => c.status === 'pass').length / complianceChecks.length) * 100) : 0;

  const [messages, setMessages] = useState<Message[]>([{
    id: 'init', role: 'ai', timestamp: new Date(),
    text: `Hello! I'm your **IRC Design AI**. Your current project "${project.name}" has a compliance score of **${score}%**. How can I help you optimize this design?`,
  }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const aiMsg: Message = { id: `a-${Date.now()}`, role: 'ai', text: getAIResponse(text), timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setThinking(false);
    }, 800 + Math.random() * 600);
  }

  function renderText(text: string) {
    return text.split('**').map((part, i) =>
      i % 2 === 1 ? <strong key={i} style={{ color: 'var(--neon-cyan)' }}>{part}</strong> : part
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✦</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>IRC Design AI</div>
            <div style={{ fontSize: 9, color: 'var(--neon-green)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--neon-green)', display: 'inline-block', boxShadow: '0 0 4px var(--neon-green)' }} />
              ONLINE · IRC:2012 knowledge base loaded
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="scroll-panel" style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}>
              {msg.role === 'ai' && (
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>✦</div>
              )}
              <div style={{ maxWidth: '85%', padding: '8px 10px', borderRadius: msg.role === 'user' ? '10px 2px 10px 10px' : '2px 10px 10px 10px',
                background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(59,130,246,0.1))' : 'var(--bg-elevated)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,255,0.25)' : 'var(--border-subtle)'}`,
                fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {renderText(msg.text)}
              </div>
            </motion.div>
          ))}
          {thinking && (
            <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✦</div>
              <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: '2px 10px 10px 10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-cyan)' }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '6px 12px', display: 'flex', gap: 4, flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => sendMessage(p)}
            style={{ fontSize: 9, padding: '3px 7px', borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-glass-light)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 12px 12px', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input className="input" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about IRC standards, costs, design..."
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          style={{ flex: 1, fontSize: 11 }} />
        <button className="btn btn-primary" onClick={() => sendMessage(input)} style={{ padding: '6px 10px', fontSize: 13, flexShrink: 0 }}>➤</button>
      </div>
    </div>
  );
}
