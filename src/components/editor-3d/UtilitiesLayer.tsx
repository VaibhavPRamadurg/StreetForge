import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useStreetStore } from '../../store/useStreetStore';
import * as THREE from 'three';

const ROAD_LENGTH = 40;

// Underground utility definitions — xOffset in metres from road centre
const UTILITIES = [
  { id: 'water',   label: 'Water Main (DN300)',    diameter: 0.30, color: '#0ea5e9', emissive: '#0ea5e9', xOffset: -3.5, depth: -1.2 },
  { id: 'sewer',   label: 'Sewer Line (DN450)',    diameter: 0.45, color: '#84cc16', emissive: '#84cc16', xOffset: -1.8, depth: -1.8 },
  { id: 'electric',label: 'HT Cable Duct (2×100)', diameter: 0.15, color: '#fbbf24', emissive: '#fbbf24', xOffset:  0.5, depth: -0.9 },
  { id: 'telecom', label: 'Telecom Conduit (OFC)', diameter: 0.12, color: '#a855f7', emissive: '#a855f7', xOffset:  2.2, depth: -0.75 },
  { id: 'gas',     label: 'Gas Pipeline (DN200)',  diameter: 0.20, color: '#f97316', emissive: '#f97316', xOffset:  3.8, depth: -1.5 },
];

interface PipeProps {
  diameter: number;
  color: string;
  emissive: string;
  xOffset: number;      // metres from road centre
  depth: number;
  targetY: number;
  isExploded: boolean;
  label: string;
}

function Pipe({ diameter, color, emissive, xOffset, depth, targetY, isExploded, label }: PipeProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const currentY = useRef(depth);

  useFrame((_, delta) => {
    const dest = depth + targetY;
    currentY.current = THREE.MathUtils.lerp(currentY.current, dest, delta * 3.5);
    if (groupRef.current) {
      groupRef.current.position.y = currentY.current;
    }
  });

  return (
    <group ref={groupRef} position={[xOffset, depth, 0]}>
      {/* Pipe body */}
      <mesh>
        <cylinderGeometry args={[diameter / 2, diameter / 2, ROAD_LENGTH, 10]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.6}
          emissive={isExploded ? emissive : '#000000'}
          emissiveIntensity={isExploded ? 0.3 : 0}
        />
      </mesh>

      {/* End cap front */}
      <mesh position={[0, 0, ROAD_LENGTH / 2 + 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[diameter / 2 + 0.01, 12]} />
        <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={isExploded ? 1.5 : 0} transparent opacity={0.9} />
      </mesh>

      {/* Glow ring at front when exploded */}
      {isExploded && (
        <mesh position={[0, 0, ROAD_LENGTH / 2 + 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[diameter / 2 + 0.01, diameter / 2 + 0.06, 12]} />
          <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={2} transparent opacity={0.5} />
        </mesh>
      )}

      {/* Label */}
      {isExploded && (
        <Html position={[0, 0, ROAD_LENGTH / 2 + 0.5]} center distanceFactor={16} zIndexRange={[25, 26]}>
          <div style={{
            background: 'rgba(3,7,18,0.9)',
            border: `1px solid ${emissive}55`,
            borderRadius: 4,
            padding: '2px 8px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: emissive, letterSpacing: '0.04em' }}>
              {label}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function UtilitiesLayer() {
  const { project, viewMode } = useStreetStore();
  const { segments } = project;
  const isExploded = viewMode === 'exploded';

  // Explode utilities downward when exploded
  const explodeOffset = isExploded ? -3.0 : 0;
  const totalWidth = useMemo(() => segments.reduce((s, sg) => s + sg.width, 0), [segments]);

  return (
    <group>
      {UTILITIES.map(util => (
        <Pipe
          key={util.id}
          diameter={util.diameter}
          color={util.color}
          emissive={util.emissive}
          xOffset={util.xOffset}
          depth={util.depth}
          targetY={explodeOffset}
          isExploded={isExploded}
          label={util.label}
        />
      ))}

      {/* Trench indicator when exploded */}
      {isExploded && (
        <mesh position={[0, -1.4 + explodeOffset, 0]}>
          <boxGeometry args={[10, 0.02, ROAD_LENGTH]} />
          <meshStandardMaterial color="#0a1628" emissive="#00d4ff" emissiveIntensity={0.04} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Legend — fixed position to left of road */}
      {isExploded && (
        <Html position={[-12, -2 + explodeOffset, ROAD_LENGTH / 4]} center distanceFactor={16} zIndexRange={[30, 31]}>
          <div style={{
            background: 'rgba(3,7,18,0.92)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 8,
            padding: '8px 12px',
            pointerEvents: 'none',
            minWidth: 160,
          }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', marginBottom: 7, letterSpacing: '0.08em' }}>
              ⬇ UNDERGROUND UTILITIES
            </div>
            {UTILITIES.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.color, boxShadow: `0 0 5px ${u.color}`, flexShrink: 0 }} />
                <span style={{ fontSize: 8, color: '#8ba3cc', fontFamily: 'var(--font-mono)' }}>{u.label}</span>
              </div>
            ))}
          </div>
        </Html>
      )}
    </group>
  );
}
