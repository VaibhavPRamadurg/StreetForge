/**
 * IntroAnimation
 *
 * A 3-second brand-reveal animation shown on initial page load.
 * Features:
 *  - Configurable: enable/disable via localStorage flag
 *  - Skip on subsequent loads within same browser session
 *  - Respects prefers-reduced-motion (accessibility)
 *  - Cinematic: dark background → logo reveal → tag-line → progress bar → fade out
 *  - Skip button (keyboard + pointer)
 *  - Zero layout impact (fixed overlay, removes itself from DOM when done)
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'sf_intro_shown';
const INTRO_DURATION_MS = 3200;

/** Admin config: set window.__SF_SKIP_INTRO__ = true to always skip */
declare global {
  interface Window { __SF_SKIP_INTRO__?: boolean; }
}

function shouldShowIntro(): boolean {
  // Admin override
  if (typeof window !== 'undefined' && window.__SF_SKIP_INTRO__) return false;
  // Respect reduced motion
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  // Show only once per session
  if (sessionStorage.getItem(SESSION_KEY)) return false;
  return true;
}

interface IntroAnimationProps {
  onComplete?: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [show, setShow] = useState(shouldShowIntro);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'progress' | 'done'>('logo');

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem(SESSION_KEY, '1');

    // Phase timeline
    const t1 = setTimeout(() => setPhase('tagline'), 800);
    const t2 = setTimeout(() => setPhase('progress'), 1400);

    // Progress bar animation
    let start: number;
    let raf: number;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      setProgress(Math.min(100, (elapsed / (INTRO_DURATION_MS - 1400)) * 100));
      if (elapsed < INTRO_DURATION_MS - 1400) {
        raf = requestAnimationFrame(animate);
      } else {
        setProgress(100);
        setTimeout(finish, 300);
      }
    };
    const t3 = setTimeout(() => { raf = requestAnimationFrame(animate); }, 1400);

    function finish() {
      setPhase('done');
      setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 400);
    }

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      cancelAnimationFrame(raf);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  function skip() {
    setPhase('done');
    setProgress(100);
    setTimeout(() => { setShow(false); onComplete?.(); }, 200);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed', inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at 50% 40%, #060d1f 0%, #020510 100%)',
            overflow: 'hidden',
            userSelect: 'none',
          }}
          role="dialog"
          aria-label="StreetForge intro"
          aria-modal="true"
        >
          {/* Animated grid background */}
          <GridBackground />

          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              width: 80, height: 80, borderRadius: 22,
              background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38,
              boxShadow: '0 0 60px rgba(0,212,255,0.35), 0 0 120px rgba(139,92,246,0.2)',
              marginBottom: 24,
            }}
          >
            ⬡
          </motion.div>

          {/* App name */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            style={{
              fontFamily: 'var(--font-sans, Inter, sans-serif)',
              fontSize: 38, fontWeight: 900,
              letterSpacing: '-0.04em',
              color: '#ffffff',
              marginBottom: 6,
            }}
          >
            Street<span style={{ color: '#00d4ff' }}>Forge</span>
          </motion.div>

          {/* Tag-line */}
          <AnimatePresence>
            {(phase === 'tagline' || phase === 'progress' || phase === 'done') && (
              <motion.div
                key="tagline"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 11, letterSpacing: '0.18em',
                  color: 'rgba(0,212,255,0.75)',
                  marginBottom: 32,
                  textTransform: 'uppercase',
                }}
              >
                IRC Civil Engineering Platform
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          <AnimatePresence>
            {(phase === 'progress' || phase === 'done') && (
              <motion.div
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ width: 240, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}
              >
                <div
                  style={{
                    height: '100%', borderRadius: 2,
                    background: 'linear-gradient(90deg, #00d4ff, #8b5cf6)',
                    width: `${progress}%`,
                    transition: 'width 0.1s linear',
                    boxShadow: '0 0 8px rgba(0,212,255,0.6)',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.8 }}
            whileHover={{ opacity: 1 }}
            onClick={skip}
            onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? skip() : null}
            style={{
              position: 'absolute', bottom: 28, right: 28,
              background: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6,
              color: 'rgba(255,255,255,0.5)',
              fontSize: 11,
              padding: '6px 14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.08em',
            }}
            aria-label="Skip intro animation"
            tabIndex={0}
          >
            Skip ↵
          </motion.button>

          {/* Decorative glow orbs */}
          <div style={{ position: 'absolute', top: '20%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '15%', right: '12%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GridBackground() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="sgrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00d4ff" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sgrid)" />
    </svg>
  );
}
