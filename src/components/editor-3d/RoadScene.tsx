import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stars, Preload, useProgress, Html as DreiHtml } from '@react-three/drei';
import { useStreetStore } from '../../store/useStreetStore';
import RoadGeometry from './RoadGeometry';
import PavementLayers from './PavementLayers';
import UtilitiesLayer from './UtilitiesLayer';
import { Suspense, useEffect, useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// ── Loading overlay ──────────────────────────────────────
function Loader() {
  const { progress } = useProgress();
  return (
    <DreiHtml center>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        background: 'rgba(3,7,18,0.95)', border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 12, padding: '24px 36px', color: '#f0f6ff',
      }}>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', letterSpacing: '0.1em' }}>
          LOADING 3D SCENE
        </div>
        <div style={{ width: 160, height: 3, background: '#0f1f3d', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#00d4ff,#8b5cf6)', borderRadius: 2, transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ fontSize: 10, color: '#4a6080', fontFamily: 'var(--font-mono)' }}>
          {Math.round(progress)}% — Three.js R3F
        </div>
      </div>
    </DreiHtml>
  );
}

// ── Camera preset animation ──────────────────────────────
const CAMERA_PRESETS = {
  surface:  { pos: [0, 12, 28] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
  exploded: { pos: [22, 18, 30] as [number, number, number], target: [0, -1, 0] as [number, number, number] },
  top:      { pos: [0, 40, 0] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
};

export default function RoadScene() {
  const { showGrid, viewMode } = useStreetStore();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Animate camera when view mode changes
  useEffect(() => {
    if (!controlsRef.current) return;
    const preset = CAMERA_PRESETS[viewMode as keyof typeof CAMERA_PRESETS] ?? CAMERA_PRESETS.surface;
    const ctrl = controlsRef.current as any;
    // Soft nudge — just update the target; three.js damping does the rest
    if (ctrl.target) {
      ctrl.target.set(...preset.target);
      ctrl.update();
    }
  }, [viewMode]);

  const gridY = viewMode === 'exploded' ? -5.0 : -0.05;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Subtle radial background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 35% 35%, #060d2a 0%, #030712 65%)',
        pointerEvents: 'none',
      }} />

      <Canvas
        camera={{ position: [0, 12, 28], fov: 45, near: 0.1, far: 2000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        shadows
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<Loader />}>
          {/* Scene background */}
          <color attach="background" args={['#030712']} />
          <fog attach="fog" args={['#030712', 70, 200]} />

          {/* ── Lighting rig ───────────────────────────────── */}
          <ambientLight intensity={0.25} color="#1a3a6a" />
          <directionalLight
            position={[10, 25, 10]} intensity={1.4} color="#ffffff" castShadow
            shadow-mapSize-width={2048} shadow-mapSize-height={2048}
            shadow-camera-far={80} shadow-camera-left={-35} shadow-camera-right={35}
            shadow-camera-top={22} shadow-camera-bottom={-22}
            shadow-bias={-0.0005}
          />
          {/* Neon fill lights */}
          <pointLight position={[-18, 6, 0]} intensity={0.9} color="#00d4ff" distance={50} />
          <pointLight position={[18, 6, 0]} intensity={0.7} color="#8b5cf6" distance={50} />
          <pointLight position={[0, 3, -20]} intensity={0.5} color="#10b981" distance={35} />
          {viewMode === 'exploded' && (
            <>
              <pointLight position={[0, -1.5, 8]} intensity={0.6} color="#0ea5e9" distance={30} />
              <pointLight position={[0, -3, -5]} intensity={0.4} color="#f97316" distance={25} />
            </>
          )}

          {/* Stars */}
          <Stars radius={130} depth={60} count={1500} factor={3} saturation={0.4} fade speed={0.3} />

          {/* Grid Floor */}
          {showGrid && (
            <Grid
              position={[0, gridY, 0]}
              args={[100, 100]}
              cellSize={1}
              cellThickness={0.35}
              cellColor="#0a1628"
              sectionSize={5}
              sectionThickness={0.7}
              sectionColor="#00d4ff"
              fadeDistance={70}
              fadeStrength={1.5}
              infiniteGrid
            />
          )}

          {/* ── Road Geometry (surface) ─────────────────── */}
          <RoadGeometry />

          {/* ── Sub-surface pavement layers ────────────── */}
          <PavementLayers />

          {/* ── Underground utilities ──────────────────── */}
          <UtilitiesLayer />

          {/* ── Camera controls ────────────────────────── */}
          <OrbitControls
            ref={controlsRef as any}
            makeDefault
            enableDamping
            dampingFactor={0.06}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={4}
            maxDistance={120}
            target={[0, 0, 0]}
            rotateSpeed={0.7}
            zoomSpeed={0.9}
          />

          <Preload all />
        </Suspense>
      </Canvas>

      {/* ── Corner HUD overlay ─────────────────────────── */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        display: 'flex', flexDirection: 'column', gap: 4,
        pointerEvents: 'none',
      }}>
        <HudBadge label="ORBIT" sub="Left drag" />
        <HudBadge label="PAN" sub="Right drag" />
        <HudBadge label="ZOOM" sub="Scroll" />
      </div>

      {/* ── View mode indicator ────────────────────────── */}
      {viewMode === 'exploded' && (
        <div style={{
          position: 'absolute', bottom: 16, right: 16,
          background: 'rgba(3,7,18,0.85)',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: 8, padding: '6px 14px',
          pointerEvents: 'none',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 8px #00d4ff', animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#00d4ff', letterSpacing: '0.08em' }}>
            EXPLODED VIEW — SUBSURFACE LAYERS ACTIVE
          </span>
        </div>
      )}
    </div>
  );
}

function HudBadge({ label, sub }: { label: string; sub: string }) {
  return (
    <div style={{
      background: 'rgba(3,7,18,0.72)',
      border: '1px solid rgba(0,212,255,0.1)',
      borderRadius: 5, padding: '3px 9px', textAlign: 'right',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  );
}
