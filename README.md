# StreetForge — IRC Street Design & Visualization Platform

> Next-generation 3D civil engineering tool for Indian road design.  
> IRC:103-2012 · IRC:37-2012 · MORT&H compliant · React Three Fiber

---

## 🚀 Quick Start

```bash
npm install
npm run dev          # http://localhost:5173
```

---

## 📁 Project Structure

```
StreetDesign/
├── index.html               # Vite entry point
├── vite.config.ts
├── tsconfig.json
├── package.json
│
└── src/
    ├── main.tsx             # App bootstrap
    ├── App.tsx              # Router (/, /editor, /about)
    │
    ├── styles/
    │   └── index.css        # Global design system — tokens, glassmorphism, animations
    │
    ├── pages/               # Route-level page components
    │   ├── Dashboard.tsx    # Project overview, metrics, quick start
    │   ├── Editor.tsx       # Main workspace (3D + 2D + panels)
    │   └── About.tsx        # Tech stack & usage guide
    │
    ├── components/
    │   ├── editor-2d/       # 2D cross-section editor
    │   │   ├── SectionEditor.tsx    # Drag-to-reorder segment strip
    │   │   └── index.ts
    │   │
    │   ├── editor-3d/       # Three.js / React Three Fiber scene
    │   │   ├── RoadScene.tsx        # Canvas, lighting, controls, fog
    │   │   ├── RoadGeometry.tsx     # Surface slabs, trees, streetlights, markings
    │   │   ├── PavementLayers.tsx   # Exploded BC/DBM/WMM/GSB/Subgrade stack
    │   │   ├── UtilitiesLayer.tsx   # Underground water/sewer/cable/gas pipes
    │   │   └── index.ts
    │   │
    │   ├── layout/          # App chrome
    │   │   ├── TopBar.tsx           # Project info, view mode toggle, compliance score
    │   │   ├── LeftPanel.tsx        # Project config, segment management
    │   │   ├── RightPanel.tsx       # Engineering panel tab host
    │   │   └── index.ts
    │   │
    │   ├── panels/          # Right-panel engineering modules
    │   │   ├── PavementCalcPanel.tsx  # IRC:37-2012 layer stack
    │   │   ├── DrainagePanel.tsx      # Q = C·I·A/360 rational method
    │   │   ├── CompliancePanel.tsx    # Per-clause IRC pass/fail table
    │   │   ├── BoQPanel.tsx           # Bill of Quantities (MORT&H SOR)
    │   │   ├── AIAssistant.tsx        # IRC design chatbot
    │   │   └── index.ts
    │   │
    │   └── ui/              # Shared primitive components (future)
    │
    ├── store/
    │   ├── useStreetStore.ts  # Zustand store — single source of truth
    │   └── index.ts
    │
    ├── constants/
    │   ├── irc.ts           # All static IRC data: colours, tables, offsets, widths
    │   └── index.ts
    │
    ├── types/
    │   ├── street.ts        # StreetProject, StreetSegment, PavementLayer types
    │   └── index.ts
    │
    ├── utils/
    │   ├── ircCalc.ts       # Engineering calculations (pavement, drainage, BoQ)
    │   └── index.ts
    │
    └── hooks/               # Custom React hooks (future)
```

---

## 🏗️ Architecture

### Data Flow: JSON-to-Road Pattern

```
User Input (sliders / 2D editor)
        ↓
useStreetStore (Zustand)      ← single reactive state atom
        ↓
ircCalc.ts                    ← engineering recalculation
        ↓
  ┌─────────────┬──────────────────┐
  ▼             ▼                  ▼
RoadGeometry  PavementLayers  RightPanels
(surface 3D)  (exploded 3D)   (numbers/charts)
```

Every UI action triggers a store update → calculations run → all views re-render reactively.

### View Modes
| Mode | Description |
|---|---|
| **Surface** | Standard 3D road view with trees, streetlights, markings |
| **Exploded** | "Antigravity" pavement layer separation — BC/DBM/WMM/GSB stagger upward, utilities drop downward |

---

## 🔧 Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | React | 19 |
| Language | TypeScript | 6.0 |
| Build | Vite | 8.0 |
| 3D Engine | Three.js + React Three Fiber | r184 / v9.6 |
| 3D Helpers | @react-three/drei | v10.7 |
| Animation | Framer Motion | v12 |
| State | Zustand | v5.0 |
| Routing | React Router | v7.15 |
| Charts | Recharts | v3.8 |

---

## 📐 IRC Standards Implemented

| Code | Standard | Usage |
|---|---|---|
| IRC:103-2012 | Urban Roads Geometric Design | Lane widths, footpath, median, ROW compliance |
| IRC:37-2012 | Flexible Pavement Design | Thickness via CBR × MSA bilinear interpolation |
| IRC:86-1983 | Geometric Design of State Roads | Minimum ROW per category |
| IRC:SP:50-2013 | Urban Drainage | Q = C·I·A/360 rational method |
| MORT&H 5th Rev | Specifications for Road Works | BoQ item rates |

---

## 🎨 Design System

All design tokens live in `src/styles/index.css`:

| Token | Value | Usage |
|---|---|---|
| `--bg-void` | `#030712` | Page background |
| `--neon-cyan` | `#00d4ff` | Primary accent |
| `--neon-purple` | `#8b5cf6` | Exploded mode |
| `--neon-green` | `#10b981` | Compliance pass |
| `--neon-amber` | `#f59e0b` | Warnings |
| `--font-mono` | JetBrains Mono | HUD, technical values |

---

## 📍 Routes

| Path | Component | Description |
|---|---|---|
| `/` | Dashboard | Project list, metrics, quick start |
| `/editor` | Editor | Full 3D + 2D design workspace |
| `/about` | About | Tech stack, usage guide, IRC references |
