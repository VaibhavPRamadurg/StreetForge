import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useStreetStore } from '../../store/useStreetStore';
import { SEGMENT_COLORS } from '../../types/street';
import * as THREE from 'three';

const ROAD_LENGTH = 40;
const SEG_DEPTH = 0.065;

const COLOR_MAP: Record<string, string> = {
  carriageway:   '#1e2847',
  footpath:      '#4a3c30',
  median:        '#14472a',
  'cycle-track': '#0c2d5c',
  parking:       '#5c2d0e',
  'green-buffer':'#143322',
  drain:         '#0a1c38',
};

// Tree component for medians / green buffers
function Tree({ x, z, size = 1 }: { x: number; z: number; size?: number }) {
  return (
    <group position={[x, SEG_DEPTH + 0.02, z]}>
      {/* Trunk */}
      <mesh>
        <cylinderGeometry args={[0.03 * size, 0.05 * size, 0.3 * size, 6]} />
        <meshStandardMaterial color="#5c3d11" roughness={1} />
      </mesh>
      {/* Canopy — two layers */}
      <mesh position={[0, 0.28 * size, 0]}>
        <coneGeometry args={[0.22 * size, 0.4 * size, 7]} />
        <meshStandardMaterial color="#1a5c2e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.45 * size, 0]}>
        <coneGeometry args={[0.15 * size, 0.3 * size, 7]} />
        <meshStandardMaterial color="#256b38" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Streetlight pole
function Streetlight({ x, z, side = 1 }: { x: number; z: number; side?: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Pole */}
      <mesh position={[0, SEG_DEPTH + 2.5, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 5, 6]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.3 * side, SEG_DEPTH + 5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.6, 5]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Lamp head */}
      <mesh position={[0.6 * side, SEG_DEPTH + 5, 0]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
      </mesh>
      {/* Light source */}
      <pointLight position={[0.6 * side, SEG_DEPTH + 4.8, 0]} intensity={0.6} color="#fff8e1" distance={12} />
    </group>
  );
}

// Animated surface segment with highlight on hover
function SegmentMesh({ seg, cx }: { seg: any; cx: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const color = COLOR_MAP[seg.type] || '#2a2a3a';
  const isCarriageway = seg.type === 'carriageway';
  const isMedian = seg.type === 'median';
  const isGreen = seg.type === 'green-buffer' || isMedian;
  const isFootpath = seg.type === 'footpath';
  const isDrain = seg.type === 'drain';

  // Subtle idle hover shimmer on carriageway
  useFrame(({ clock }) => {
    if (meshRef.current && isCarriageway) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.015 + Math.sin(clock.elapsedTime * 0.8) * 0.005;
    }
  });

  const trees = useMemo(() => {
    if (!isGreen) return [];
    const spacing = 6;
    const count = Math.max(1, Math.floor(ROAD_LENGTH / spacing));
    return Array.from({ length: count }, (_, i) => ({
      z: -ROAD_LENGTH / 2 + spacing * 0.6 + i * spacing,
      size: 0.6 + Math.sin(i * 2.3) * 0.15,
    }));
  }, [isGreen]);

  return (
    <group key={seg.id} position={[cx, 0, 0]}>
      {/* Main slab */}
      <mesh ref={meshRef} receiveShadow castShadow position={[0, SEG_DEPTH / 2, 0]}>
        <boxGeometry args={[seg.width - 0.02, SEG_DEPTH, ROAD_LENGTH]} />
        <meshStandardMaterial
          color={color}
          roughness={isCarriageway ? 0.88 : isGreen ? 0.95 : 0.65}
          metalness={isCarriageway ? 0.04 : 0}
          emissive={isCarriageway ? '#3b82f6' : '#000000'}
          emissiveIntensity={isCarriageway ? 0.015 : 0}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* Carriageway lane markings */}
      {isCarriageway && (seg.lanes || 2) > 1 &&
        Array.from({ length: (seg.lanes || 2) - 1 }).map((_, li) => {
          const laneW = seg.width / (seg.lanes || 2);
          const lx = -seg.width / 2 + laneW * (li + 1);
          return (
            <group key={li} position={[lx, SEG_DEPTH + 0.002, 0]}>
              {Array.from({ length: 11 }).map((_, di) => (
                <mesh key={di} position={[0, 0, -ROAD_LENGTH / 2 + 2 + di * 3.5]}>
                  <boxGeometry args={[0.1, 0.002, 2.0]} />
                  <meshStandardMaterial color="#f5f0b0" emissive="#f5f0b0" emissiveIntensity={0.25} />
                </mesh>
              ))}
            </group>
          );
        })
      }

      {/* Centre double-yellow line */}
      {isCarriageway && (
        <>
          <mesh position={[0.1, SEG_DEPTH + 0.003, 0]}>
            <boxGeometry args={[0.08, 0.002, ROAD_LENGTH]} />
            <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[-0.1, SEG_DEPTH + 0.003, 0]}>
            <boxGeometry args={[0.08, 0.002, ROAD_LENGTH]} />
            <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.35} />
          </mesh>
        </>
      )}

      {/* Edge lines on carriageway */}
      {isCarriageway && (
        <>
          <mesh position={[-seg.width / 2 + 0.12, SEG_DEPTH + 0.002, 0]}>
            <boxGeometry args={[0.12, 0.002, ROAD_LENGTH]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[seg.width / 2 - 0.12, SEG_DEPTH + 0.002, 0]}>
            <boxGeometry args={[0.12, 0.002, ROAD_LENGTH]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
          </mesh>
        </>
      )}

      {/* Green grass fill */}
      {isGreen && (
        <mesh position={[0, SEG_DEPTH + 0.03, 0]}>
          <boxGeometry args={[Math.max(seg.width - 0.2, 0.1), 0.06, ROAD_LENGTH - 1]} />
          <meshStandardMaterial color="#1a5c28" roughness={1} />
        </mesh>
      )}

      {/* Trees in median/buffer */}
      {isGreen && trees.map((t, ti) => (
        <Tree key={ti} x={0} z={t.z} size={t.size} />
      ))}

      {/* Kerb stones on footpath */}
      {isFootpath && (
        <>
          <mesh position={[-seg.width / 2 + 0.08, SEG_DEPTH + 0.07, 0]}>
            <boxGeometry args={[0.16, 0.14, ROAD_LENGTH]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.5} metalness={0.1} />
          </mesh>
          <mesh position={[seg.width / 2 - 0.08, SEG_DEPTH + 0.07, 0]}>
            <boxGeometry args={[0.16, 0.14, ROAD_LENGTH]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.5} metalness={0.1} />
          </mesh>
          {/* Footpath paving pattern */}
          {Array.from({ length: 8 }).map((_, pi) => (
            <mesh key={pi} position={[0, SEG_DEPTH + 0.001, -ROAD_LENGTH / 2 + 3 + pi * 5]}>
              <boxGeometry args={[seg.width - 0.4, 0.002, 0.01]} />
              <meshStandardMaterial color="rgba(255,255,255,0.06)" transparent opacity={0.06} />
            </mesh>
          ))}
        </>
      )}

      {/* Drain channel */}
      {isDrain && (
        <>
          <mesh position={[0, SEG_DEPTH + 0.1, 0]}>
            <boxGeometry args={[Math.max(seg.width - 0.1, 0.3), 0.2, ROAD_LENGTH]} />
            <meshStandardMaterial color="#0c1f40" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0, SEG_DEPTH + 0.01, 0]}>
            <boxGeometry args={[Math.max(seg.width - 0.15, 0.25), 0.01, ROAD_LENGTH]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.08} transparent opacity={0.5} />
          </mesh>
        </>
      )}

      {/* Streetlights on footpath edges */}
      {isFootpath && [-ROAD_LENGTH / 2 + 5, -ROAD_LENGTH / 2 + 17, -ROAD_LENGTH / 2 + 29].map((lz, li) => (
        <Streetlight key={li} x={seg.width / 2 - 0.2} z={lz} side={1} />
      ))}

      {/* Dimension label */}
      {useStreetStore.getState().showDimensions && (
        <Html position={[0, 2.2, ROAD_LENGTH / 2 + 0.6]} center distanceFactor={18} zIndexRange={[10, 11]}>
          <div style={{
            background: 'rgba(3,7,18,0.88)',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: 4,
            padding: '2px 8px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', letterSpacing: '0.04em' }}>
              {seg.width.toFixed(1)}m
            </span>
          </div>
        </Html>
      )}

      {/* Segment label */}
      {useStreetStore.getState().showLabels && (
        <Html position={[0, 1.3, 0]} center distanceFactor={20} zIndexRange={[10, 11]}>
          <div style={{
            background: 'rgba(3,7,18,0.82)',
            border: `1px solid ${(SEGMENT_COLORS as any)[seg.type] || '#ffffff'}44`,
            borderRadius: 4,
            padding: '1px 7px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: '#c0d0ff', letterSpacing: '0.04em' }}>
              {seg.label}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function RoadGeometry() {
  const { project } = useStreetStore();
  const { segments } = project;

  const totalWidth = useMemo(() => segments.reduce((s, sg) => s + sg.width, 0), [segments]);

  const positioned = useMemo(() => {
    let x = -totalWidth / 2;
    return segments.map(seg => {
      const cx = x + seg.width / 2;
      x += seg.width;
      return { ...seg, cx };
    });
  }, [segments, totalWidth]);

  return (
    <group>
      {positioned.map(seg => (
        <SegmentMesh key={seg.id} seg={seg} cx={seg.cx} />
      ))}

      {/* Road end caps with neon glow */}
      <mesh position={[0, SEG_DEPTH / 2, ROAD_LENGTH / 2 + 0.015]}>
        <boxGeometry args={[totalWidth, SEG_DEPTH + 0.012, 0.04]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, SEG_DEPTH / 2, -ROAD_LENGTH / 2 - 0.015]}>
        <boxGeometry args={[totalWidth, SEG_DEPTH + 0.012, 0.04]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.8} />
      </mesh>

      {/* Total width dimension */}
      {useStreetStore.getState().showDimensions && (
        <Html position={[0, 4, ROAD_LENGTH / 2 + 1.2]} center distanceFactor={18} zIndexRange={[12, 13]}>
          <div style={{
            background: 'rgba(3,7,18,0.93)',
            border: '1px solid rgba(0,212,255,0.5)',
            borderRadius: 6,
            padding: '4px 12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 0 16px rgba(0,212,255,0.12)',
          }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: 700 }}>
              Total ROW: {totalWidth.toFixed(1)}m
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
