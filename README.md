# 🍃 EcoSphere AI — Carbon Footprint Platform

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

> **EcoSphere AI** is a state-of-the-art, gamified carbon footprint awareness platform. It utilizes advanced calculations, interactive simulations, and AI-assisted coaching to help individuals measure, reduce, and offset their carbon footprint while building a virtual sustainable city.

---

## 🌟 Key Features

### 1. 🧮 Interactive Carbon Footprint Calculator
- Computes daily/annual carbon emissions across **six categories**: Transport, Food, Home Energy, Shopping, Lifestyle, and Waste.
- Features dynamic inputs, category sub-tabs (e.g., Driving vs. Flights vs. Transit), and immediate graph updates.

### 2. 🤖 AI Eco Coach
- An interactive, context-aware chatbot styled with premium glassmorphism chat bubbles.
- Offers climate advice, green hacks, and responses tailored to carbon savings targets.
- Features one-click quick actions (e.g. *"Suggest vegan dinner"* or *"Draft transit plan"*).

### 3. 🗺️ Eco Route Planner & Interactive Map
- Plan routes and compare carbon footprints dynamically across walking, transit, biking, and driving options.
- Visual overlays built using `react-leaflet` to display emission details.

### 4. 🏢 EcoCity Builder
- A gamified city simulation where saving actual carbon emissions directly grows a virtual sustainable city.
- Unlocks turbines, parks, green schools, and carbon towers as you log footprints.
- Live city visualization viewport with spring animations and sun/cloud environments.

### 5. ⚡ Home Energy Simulator
- An interactive upgrade tool simulating ROI, payback timelines, and energy reductions.
- Toggle upgrades like **Solar Panels**, **LED Retrofits**, and **Heat Pumps** to review potential yearly cash and emissions savings.

### 6. 📸 Eco Scanner AI
- Simulate receipts, meals, or barcodes scanning using high-precision computer vision logs.
- Automatically extracts products, computes their carbon footprint scores, and recommends greener alternatives.

### 7. 🛒 Offset Marketplace & SVG Certificates
- Purchase verified carbon offsets for global projects (reforestation, wind farms, biodiversity corridors).
- Generates downloadable, high-fidelity custom SVG certificates verifying user contribution details.

### 8. 🏆 Community Feed & Leaderboards
- Share green tips, post achievements, and interact with comments.
- Track rank and achievements on a global leader board with levels, XP progression, and daily streaks.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | **React 19** | Modern UI rendering with state management |
| **Build Tooling** | **Vite 8** | High-performance bundling and fast hot module replacement (HMR) |
| **Language** | **TypeScript 6** | Full type safety and structured API models |
| **Styling** | **Tailwind CSS v4** | Utility-first styling combined with a custom design system |
| **Animations** | **Framer Motion** | High-performance page transitions, sliding tab indicators, and spring-physics modal entries |
| **Charts** | **Recharts** | Vertical bar charts, pie breakdowns, and responsive line progress indicators |
| **Maps** | **React Leaflet** | Geographic map overlays for routes and carbon comparisons |

---

## 📁 Repository Structure

```text
Ecosphere/
├── public/                 # Static assets (icons, images)
├── src/
│   ├── components/         # Common UI components (Navbar, Layout, RouteGuard)
│   ├── lib/                # Utility modules (Carbon calculator math, seed data, storage helpers)
│   ├── pages/              # Primary page views (Dashboard, Calculator, Scanner, EcoCity, etc.)
│   ├── providers/          # React Context Providers (Auth, Notification, Gamification, Data)
│   ├── types/              # TypeScript typings and interfaces
│   ├── index.css           # Global custom theme tokens and spacing standards
│   └── main.tsx            # Application mounting point
├── package.json            # Dependencies and npm scripts
├── vite.config.ts          # Vite build configurations
└── tsconfig.json           # TypeScript configuration parameters
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) and [npm](https://www.npmjs.com/) installed.

### 1. Clone & Navigate
```bash
git clone https://github.com/PrinceJ18/Ecosphere.git
cd Ecosphere
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
This builds the application using Vite's optimized production bundle inside the `/dist` directory.

---

## 📐 Design & Spacing System
All pages utilize a unified, sleek layout with dark and light mode adaptation, aligned with a strict layout grid:
- **Small spacing (8px)**: Flex rows, badge borders, and category list buttons.
- **Medium spacing (16px)**: Input form rows, details list rows, and inner card contents.
- **Large spacing (24px)**: Outer margins for dashboard card columns and page margins.
- **Border properties**: Smooth card transitions limited to visual parameters (`transform`, `box-shadow`, `border-color`, `background-color`) to prevent layout height animations from causing screen shifting.

---

## 🎯 Demo Personas (Quick Access)
For testing and validation, EcoSphere AI provides demo access to three preset profiles:
1. **Eco Warrior** (`eco_warrior`): Power profile containing advanced savings metrics and community badges.
2. **Casual User** (`average_user`): Average lifestyle inputs with typical day-to-day carbon statistics.
3. **Beginner** (`beginner`): Clean profile slate ready to calculate first emission logs.

*Click "Simulate Persona" on the login screen to access any profile instantly.*
