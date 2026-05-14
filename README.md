<div align="center">

<img src="https://img.shields.io/badge/StreetForge-IRC%20Civil%20Engineering%20Platform-00d4ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzAwZDRmZiIgZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNS0xMC01LTEwIDV6TTIgMTJsMTAgNSAxMC01LTEwLTUtMTAgNXoiLz48L3N2Zz4="/>

# StreetForge

### IRC-Compliant 3D Road Design Platform for Indian Civil Engineers

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Three.js](https://img.shields.io/badge/Three.js-R184-black?style=flat-square&logo=three.js)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Design IRC-compliant urban roads with real-time 3D visualization, automated pavement thickness calculations, exploded sub-surface views, wellbeing scoring, and instant PDF + BoQ generation.**

[**Live Demo →**](https://street-forge.vercel.app) &nbsp;·&nbsp; [Report Bug](https://github.com/VaibhavPRamadurg/StreetForge/issues) &nbsp;·&nbsp; [Request Feature](https://github.com/VaibhavPRamadurg/StreetForge/issues)

</div>

---

## ✨ Features

### 🛣️ Engineering Core
- **IRC:37-2012 Pavement Design** — Auto-calculates BC, DBM, WMM, GSB thicknesses using design traffic (MSA), subgrade CBR, design life, and climate zone via the standard IRC interpolation formula
- **IRC:103-2012 Cross-Section Compliance** — Real-time validation of carriageway widths, footpath dimensions, median requirements, and lane configurations for all road categories (NH / SH / MDR / ODR / VR)
- **Rational Method Drainage (IRC:SP:50)** — Computes peak discharge Q = CIA/360, recommends drain diameter, and calculates runoff volume
- **Bill of Quantities (BoQ)** — Auto-generated itemised estimate in INR using MoRT&H SOR 2024 rates, with cost-per-km summary

### 🎮 3D Visualisation
- **React Three Fiber (R3F)** powered real-time 3D road model
- **Exploded View** — Lifts the road surface to expose all sub-surface pavement layers (BC → DBM → WMM → GSB → Subgrade) with emissive glow and live labels
- **Underground Utilities Layer** — Visualises water main, sewer, HT cable duct, telecom conduit, and gas pipeline in correct positions and depths
- **Live Surface View** — Orbit, pan, and zoom with keyboard-accessible controls
- **2D Cross-Section Editor** — Drag-to-reorder and resize segments with proportional flex layout

### 🌿 Wellbeing & Environment Scoring
- **7-metric scoring model** (0–100 scale) — Pedestrian Safety, Air & Noise Quality, Stormwater Management, Urban Heat Island, Accessibility, Active Transport, Maintenance Ease
- **Weighted composite score** with configurable per-metric weights via an admin panel
- **Piecewise linear interpolation** maps raw geometry/traffic values to normalised scores
- Color-coded score rings and expandable per-metric rationale text

### 📄 PDF Export
- **Client-side jsPDF report** — no server required, instant download
- Covers: IRC design inputs, design traffic + thickness result tiles, proportional layer diagram, detailed layer table, compliance checks, wellbeing breakdown, and recommended actions
- Professional A4 layout with branded header, colour-coded data, and page footer

### 🧠 UX Enhancements
- **Plain-English Parameter Tooltips** — click ⓘ on any slider to get a non-jargon explanation, safe range, and quick presets (e.g. "Quiet village road → 50 CVPD")
- **Cinematic Intro Animation** — 3-second brand reveal, session-aware (shows once), skips on `prefers-reduced-motion`
- **AI Design Partner** tab — In-editor chat for engineering guidance
- **Compliance badge** — Live IRC pass/fail percentage in TopBar

---

## 🖼️ Screenshots

| Dashboard | 3D Editor — Surface View |
|---|---|
| *Project dashboard with metrics, recent projects, and quick-start templates* | *Live 3D road with segment labels and dimension overlays* |

| Exploded View | Wellbeing Score Stack |
|---|---|
| *Sub-surface layers and underground utilities revealed* | *7-metric environment panel with composite score ring* |

---

## 🏗️ Architecture

```
src/
├── components/
│   ├── editor-2d/          # 2D cross-section drag-and-resize editor
│   ├── editor-3d/          # React Three Fiber 3D scene, layers, utilities
│   ├── layout/             # TopBar, LeftPanel, RightPanel
│   ├── panels/             # PavementCalcPanel, DrainagePanel, CompliancePanel,
│   │                       # BoQPanel, WellbeingScorePanel
│   └── ui/                 # IntroAnimation, ParameterTooltip
├── pages/
│   ├── Dashboard.tsx        # Project dashboard
│   ├── Editor.tsx           # Main 3D editor
│   └── About.tsx            # Tech stack & guide
├── store/
│   └── useStreetStore.ts    # Zustand global state
├── utils/
│   ├── ircCalc.ts           # IRC:37-2012 & IRC:103-2012 calculation engine
│   ├── wellbeingScore.ts    # 7-metric weighted scoring model
│   └── exportPDF.ts         # jsPDF client-side report generator
└── types/
    └── street.ts            # StreetProject, StreetSegment, PavementLayer types
```

---

## 🔬 Engineering Model

### Pavement Design — IRC:37-2012

Design traffic is calculated using the standard compound growth formula:

```
N = 365 × A × D × F × [(1 + r)ⁿ − 1] / r  ÷  1,000,000  MSA
```

| Parameter | Value | Source |
|---|---|---|
| Growth rate (r) | 7.5% | IRC:37-2012 |
| Vehicle Damage Factor (VDF) | 2.5 | IRC:37-2012 |
| Lane Distribution Factor (LDF) | 0.75 | IRC:37-2012 Table-3 |

Pavement layer thicknesses are then read by interpolating IRC:37-2012 Table-1 against the computed MSA and subgrade CBR.

### Wellbeing Scoring Formula

```
Composite = Σ (score_i × weight_i) / Σ weight_i
```

Each `score_i` is derived via piecewise linear interpolation across domain breakpoints specific to that metric. Default weights:

| Metric | Default Weight |
|---|---|
| Pedestrian Safety | 20% |
| Air & Noise Quality | 15% |
| Stormwater Management | 15% |
| Urban Heat Island | 15% |
| Accessibility | 15% |
| Active Transport | 10% |
| Maintenance Ease | 10% |

---

## 🚀 Getting Started

### Prerequisites

- Node.js **v18+**
- npm **v9+**

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/VaibhavPRamadurg/StreetForge.git
cd StreetForge

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Production Build

```bash
npm run build      # Runs tsc -b && vite build
npm run preview    # Serves the dist/ bundle locally
```

---

## 🧰 Tech Stack

| Category | Technology | Version |
|---|---|---|
| UI Framework | React | 19 |
| Language | TypeScript | ~6.0 |
| Bundler | Vite | 8 |
| 3D Rendering | Three.js + React Three Fiber | ^0.184 / ^9 |
| 3D Helpers | @react-three/drei | ^10 |
| Animations | Framer Motion | ^12 |
| State Management | Zustand | ^5 |
| Routing | React Router DOM | ^7 |
| PDF Generation | jsPDF | ^4 |
| Charts | Recharts | ^3 |
| Icons | Lucide React | ^1 |
| Deployment | Vercel | — |

---

## 📐 IRC Standards Implemented

| Standard | Scope |
|---|---|
| IRC:37-2012 | Flexible pavement design — layer thicknesses, design traffic |
| IRC:103-2012 | Urban road cross-sections — widths, footpaths, medians |
| IRC:86-1983 | Geometric design of state highways |
| IRC:SP:50 | Storm water drains — rational method, sizing |
| IRC:111-2009 | Bituminous mix specifications (VG-30 grades) |
| MoRT&H 5th Rev | Material specifications and SOR rates for BoQ |
| IRC:36-2010 | Compacted subgrade construction |

---

## 🗂️ Project Structure — Key Files

| File | Purpose |
|---|---|
| `src/utils/ircCalc.ts` | All IRC engineering calculations (pavement, drainage, compliance) |
| `src/utils/wellbeingScore.ts` | 7-metric wellbeing engine with piecewise linear scoring |
| `src/utils/exportPDF.ts` | Client-side A4 PDF generation using jsPDF v4 |
| `src/store/useStreetStore.ts` | Zustand store — single source of truth for all project state |
| `src/components/panels/WellbeingScorePanel.tsx` | Environment score UI with admin weight configurator |
| `src/components/ui/ParameterTooltip.tsx` | Plain-English tooltips with quick-preset buttons |
| `src/components/ui/IntroAnimation.tsx` | Session-aware cinematic brand intro |
| `src/components/editor-3d/` | Full 3D scene: road mesh, pavement layers, utilities |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes, then run the build to verify
npm run build

# Push and open a PR
git push origin feature/your-feature-name
```

Please ensure the production build (`npm run build`) passes without TypeScript errors before submitting.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Vaibhav P Ramadurg**

[![GitHub](https://img.shields.io/badge/GitHub-VaibhavPRamadurg-181717?style=flat-square&logo=github)](https://github.com/VaibhavPRamadurg)

---

<div align="center">

Built with ⬡ for Indian Civil Engineering

*IRC:37-2012 · IRC:103-2012 · Three.js R3F · React 19*

</div>
