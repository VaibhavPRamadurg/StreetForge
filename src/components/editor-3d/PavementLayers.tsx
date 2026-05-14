import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useStreetStore } from '../../store/useStreetStore';
import * as THREE from 'three';

const ROAD_LENGTH = 40;

// Y offsets in EXPLODED state — staggered upward for dramatic reveal
const EXPLODE_OFFSETS = [4.8, 3.2, 2.0, 0.9, 0.0];
const SURFACE_OFFSETS = [0.0, 0.0, 0.0, 0.0, 0.0];

const LAYER_COLORS: Record<string, string> = {
  bc:       '#1a1a2e',
  dbm:      '#2d3561',
  wmm:      '#4a3728',
  gsb:      '#8b6914',
  subgrade: '#6b4f2a',
};
const LAYER_EMISSIVE: Record<string, string> = {
  bc:       '#00d4ff',
  dbm:      '#3b82f6',
  wmm:      '#f97316',
  gsb:      '#f59e0b',
  subgrade: '#92400e',
};

interface LayerMeshProps {
  width: number;
  thickness: number;
  yBase: number;
  targetY: number;
  color: string;
  emissive: string;
  label: string;
  shortName: string;
  material: string;
  irc_ref: string;
  showLabels: boolean;
  isExploded: boolean;
  index: number;
}

function LayerMesh({
  width, thickness, yBase, targetY,
  color, emissive, label, shortName, material, irc_ref,
  showLabels, isExploded, index,
}: LayerMeshProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const currentY = useRef(yBase);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    const dest = yBase + targetY;
    currentY.current = THREE.MathUtils.lerp(currentY.current, dest, delta * 3.8);
    if (groupRef.current) {
      groupRef.current.position.y = currentY.current;
    }
    // Animate glow intensity
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      const targetIntensity = isExploded ? 0.8 : 0;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetIntensity, delta * 4);
    }
  });

  const w = width * 0.97;

  return (
    <group ref={groupRef} position={[0, yBase, 0]}>
      {/* Main layer slab */}
      <mesh position={[0, thickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, thickness, ROAD_LENGTH]} />
        <meshStandardMaterial
          color={color}
          roughness={0.75}
          metalness={0.08}
          emissive={emissive}
          emissiveIntensity={isExploded ? 0.055 : 0}
        />
      </mesh>

      {/* Top-face highlight when exploded (gives "lifted" feel) */}
      {isExploded && (
        <mesh position={[0, thickness + 0.002, 0]}>
          <boxGeometry args={[w, 0.003, ROAD_LENGTH]} />
          <meshStandardMaterial
            color={emissive}
            emissive={emissive}
            emissiveIntensity={0.6}
            transparent
            opacity={0.45}
          />
        </mesh>
      )}

      {/* Front-face edge glow */}
      <mesh ref={glowRef} position={[0, thickness / 2, ROAD_LENGTH / 2 + 0.01]}>
        <boxGeometry args={[w, thickness, 0.025]} />
        <meshStandardMaterial
          color={emissive}
          emissive={emissive}
          emissiveIntensity={isExploded ? 0.8 : 0}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Back edge glow */}
      {isExploded && (
        <mesh position={[0, thickness / 2, -ROAD_LENGTH / 2 - 0.01]}>
          <boxGeometry args={[w, thickness, 0.02]} />
          <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={0.4} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Layer label (right side) */}
      {showLabels && isExploded && (
        <Html
          position={[w / 2 + 0.6, thickness / 2, 0]}
          center
          distanceFactor={16}
          zIndexRange={[20, 21]}
        >
          <div style={{
            background: 'rgba(3,7,18,0.94)',
            border: `1px solid ${emissive}66`,
            borderRadius: 6,
            padding: '5px 11px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: `0 0 16px ${emissive}22`,
            animation: 'slide-up 0.35s ease forwards',
          }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: emissive, fontWeight: 700, letterSpacing: '0.07em' }}>
              {shortName}
            </div>
            <div style={{ fontSize: 9, color: '#8ba3cc', marginTop: 1 }}>{label}</div>
            <div style={{ fontSize: 8, color: '#4a6080', marginTop: 2 }}>{material}</div>
            <div style={{ fontSize: 8, color: emissive + '88', fontFamily: 'var(--font-mono)' }}>{irc_ref}</div>
          </div>
        </Html>
      )}

      {/* Thickness dimension — left side */}
      {isExploded && (
        <Html
          position={[-w / 2 - 0.5, thickness / 2, ROAD_LENGTH / 3]}
          center
          distanceFactor={16}
          zIndexRange={[20, 21]}
        >
          <div style={{ pointerEvents: 'none', textAlign: 'right' }}>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: emissive + 'bb', whiteSpace: 'nowrap' }}>
              ◀ {index === 4 ? '≥500' : Math.round(thickness * 1000)}mm
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function PavementLayers() {
  const { project, viewMode, showLabels } = useStreetStore();
  const { pavementLayers, segments } = project;
  const isExploded = viewMode === 'exploded';

  const totalWidth = useMemo(() => segments.reduce((s, sg) => s + sg.width, 0), [segments]);

  // Build Y positions bottom-up (subgrade at bottom)
  const layerStack = useMemo(() => {
    let yBase = 0;
    return [...pavementLayers].reverse().map((layer, ri) => {
      const thickness = layer.thickness / 1000;
      // Scale up for 3D visibility; subgrade gets extra height
      const displayThick = Math.max(thickness * 3, ri === 0 ? 0.6 : 0.18);
      const result = { layer, yBase: -(yBase + displayThick), thickness: displayThick };
      yBase += displayThick;
      return result;
    }).reverse();
  }, [pavementLayers]);

  return (
    <group>
      {layerStack.map(({ layer, yBase, thickness }, i) => (
        <LayerMesh
          key={layer.id}
          width={totalWidth}
          thickness={thickness}
          yBase={yBase}
          targetY={isExploded ? EXPLODE_OFFSETS[i] ?? 0 : SURFACE_OFFSETS[i] ?? 0}
          color={LAYER_COLORS[layer.id] || '#2a2a3a'}
          emissive={LAYER_EMISSIVE[layer.id] || '#ffffff'}
          label={layer.name}
          shortName={layer.shortName}
          material={layer.material}
          irc_ref={layer.irc_ref}
          showLabels={showLabels}
          isExploded={isExploded}
          index={i}
        />
      ))}

      {/* Exploded view hero label */}
      {isExploded && (
        <Html position={[0, 7.5, -ROAD_LENGTH / 2 - 1.5]} center distanceFactor={16} zIndexRange={[30, 31]}>
          <div style={{
            background: 'rgba(3,7,18,0.93)',
            border: '1px solid rgba(0,212,255,0.4)',
            borderRadius: 10,
            padding: '8px 20px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 0 30px rgba(0,212,255,0.15)',
          }}>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: 700, letterSpacing: '0.1em' }}>
              ⬆ ANTIGRAVITY PAVEMENT VIEW
            </div>
            <div style={{ fontSize: 9, color: '#4a6080', marginTop: 3, textAlign: 'center' }}>
              IRC:37-2012 Layer Stack · Click layers for details
            </div>
          </div>
        </Html>
      )}

      {/* Layer stack total depth indicator */}
      {isExploded && (() => {
        const totalMM = layerStack.reduce((s, l) => s + Math.round(l.thickness * 1000), 0);
        return (
          <Html position={[totalWidth / 2 + 2, 2, 0]} center distanceFactor={18} zIndexRange={[30, 31]}>
            <div style={{
              background: 'rgba(3,7,18,0.9)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 6,
              padding: '5px 12px',
              pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#f59e0b', fontWeight: 700 }}>
                Total: {totalMM}mm
              </div>
              <div style={{ fontSize: 8, color: '#4a6080', fontFamily: 'var(--font-mono)' }}>
                IRC:37-2012
              </div>
            </div>
          </Html>
        );
      })()}
    </group>
  );
}
