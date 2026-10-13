# Pune JalRakshak: AI-Powered Waterlogging Risk Prediction and Response Prioritisation
**Genesis Hackathon — Track 2 Decision-Support Prototype**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB?style=flat-square&logo=react)](https://vitejs.dev)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet_%2B_OpenStreetMap-199900?style=flat-square&logo=leaflet)](https://leafletjs.com)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?style=flat-square&logo=scikit-learn)](https://scikit-learn.org)
[![Status](https://img.shields.io/badge/Mode-Seeded_Demo_Baseline-amber?style=flat-square)](#)

---

## 1. Project Overview

**Pune JalRakshak** is a web-based geospatial decision-support prototype built for the Genesis Hackathon (Track 2). It estimates short-horizon (1h, 3h, 6h) waterlogging risk across 18 chronic flood hotspots and road corridors in Pune, Maharashtra.

The prototype synthesizes:
- **Simulated IMD precipitation telemetry** (1h, 3h, 6h accumulation and forecast profiles).
- **SRTM digital elevation contours & slope gradients** (540m–620m MSL).
- **PMC stormwater drainage conduit capacity ratings** and road geometry (underpasses vs surface corridors).
- **Crowdsourced citizen field reports** with human review and status workflows.
- **Transparent inspection prioritization** to assist municipal emergency response.
- **Cautious route risk comparison** across commuter corridors with clear experimental warnings.

> **DEMO DATA DISCLOSURE**: This prototype runs on calibrated simulation baselines and transparent hydrological catchment rules. It is not an official municipal emergency warning system. All simulated elements are visibly marked with `DEMO DATA` indicators.

---

## 2. Architecture & Processing Flow

```
[Simulated IMD AWS Feeds]  ──┐
[SRTM 30m Digital Elevation] ──┼─► [Validation & Range Audit] ──► [Catchment Hydrological Feature Engine]
[PMC Drainage Infrastructure]──┤
[OpenStreetMap Corridors]   ──┘
                                                                       │
                                                                       ▼
                                                          [Hybrid Risk Estimator]
                                              (Catchment Rules + Scikit-Learn Random Forest)
                                                                       │
                                                                       ▼
                                                         [Attribution Explanations]
                                                      (Feature impact %, drivers, warnings)
                                                                       │
                                                                       ▼
                                                 ┌────────────────────────────────────────┐
                                                 │       FastAPI REST Endpoints           │
                                                 └───────────────────┬────────────────────┘
                                                                     │
                         ┌───────────────────────────────────────────┼────────────────────────────────────────┐
                         ▼                                           ▼                                        ▼
             [Screen A: Dashboard]                         [Screen B: Leaflet Map]                   [Screen F: Priorities]
       (KPIs, Recharts bar distribution)             (Pins, severity pulse, drawers)            (Transparent inspection ranks)
                         │                                           │                                        │
                         ▼                                           ▼                                        ▼
             [Screen D: Report Flood]                      [Screen E: Verification]                  [Screen H: Safe Routes]
       (Submit crowdsourced field alert)             (Demo Reviewer status updates)             (Compare alternative corridors)
```

---

## 3. Technology Stack

- **Backend**: Python 3.9+, FastAPI, Pydantic V2, SQLAlchemy, SQLite, Pandas, NumPy, Scikit-learn (RandomForestClassifier with Seed 42).
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Leaflet + OpenStreetMap (`L.divIcon` customized SVG pins), Recharts, Lucide Icons.
- **Testing**: Pytest (11 automated test suites covering all routes, status transitions, and data integrity).
- **Development**: Zero external paid API keys or cloud dependencies required. Works 100% offline with seeded demo data.

---

## 4. Beginner-Friendly Mac Terminal Instructions (macOS / MacBook Air)

Open **Terminal** on your Mac (press `Cmd + Space`, type `Terminal`, and press `Enter`).

### Step 1: Open the Project Directory
```zsh
cd /Users/sabareshiyer/Documents/genesis
```

---

### Step 2: Start the Backend Server (Terminal 1)

1. Navigate to the backend directory and activate the virtual environment:
```zsh
cd backend
source venv/bin/activate
```

2. Start the FastAPI backend server:
```zsh
python3 run.py
```

*Expected output:*
```
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

Verify backend health in another terminal tab:
```zsh
curl -s http://127.0.0.1:8000/api/health
```
*(Should return `{"status":"healthy", "database_connected":true, ...}`)*

---

### Step 3: Start the Frontend Application (Terminal 2)

1. Open a **new tab** in Terminal (`Cmd + T`), and navigate to the frontend:
```zsh
cd /Users/sabareshiyer/Documents/genesis/frontend
```

2. Start the Vite development server:
```zsh
npm run dev
```

*Expected output:*
```
  VITE v5.4.21  ready in 126 ms

  ➜  Local:   http://127.0.0.1:5173/
  ➜  press h + enter to show help
```

3. Open **Google Chrome** or **Safari** and navigate to:
**`http://127.0.0.1:5173/`**

---

### Step 4: Run the Backend Automated Tests
Open a terminal in the project root and run:
```zsh
PYTHONPATH=backend backend/venv/bin/pytest backend/tests -v
```

*Expected output:*
```
============================== 11 passed in 2.80s ==============================
```

---

### Step 5: How to Stop and Restart the Servers

- **To Stop a Server**: Click inside that Terminal window and press `Ctrl + C`.
- **To Restart Backend**: Run `python3 run.py` inside `backend/` with `venv` activated.
- **To Restart Frontend**: Run `npm run dev` inside `frontend/`.

---

## 5. Screen-by-Screen User Journey Walkthrough

### Screen A — Overview Dashboard
- Shows high-level KPIs: 18 Assessed Corridors, Severe & High Risk Hotspots, Citizen Reports, and Simulated Peak Rainfall.
- Interactive Recharts bar distribution comparing Low, Moderate, High, and Severe categories.
- High-priority municipal inspection queue preview.
- Recent crowdsourced citizen reports stream.
- Prominent `DEMO DATA MODE` banner.

### Screen B — Interactive Risk Map (Leaflet)
- Centered on Pune (`18.5204° N, 73.8567° E`).
- Color-coded circular markers with severity-pulse animations on severe hotspots:
  - 🔴 **Red**: Severe Risk (e.g. Shivajinagar Railway Underpass, Alka Talkies Chowk)
  - 🟠 **Orange**: High Risk (e.g. Swargate Chowk, Katraj Chowk, Baner High Street)
  - 🟡 **Amber**: Moderate Risk (e.g. Yerawada Gunjan Chowk, Dhanori, Hadapsar)
  - 🟢 **Green**: Low Risk (e.g. Kothrud Chandani Chowk, Bavdhan NDA Road)
- Crowdsourced citizen report markers (amber for unverified, teal for corroborated).
- Filter controls by Risk Category and Municipal Zone.
- Clicking any location marker opens the Location Risk Details drawer.

### Screen C — Location Risk Details
- Displays location name, zone, elevation, and road type.
- Risk category and estimated hazard susceptibility score.
- Dynamic forecast horizon switcher (`1h`, `3h`, `6h`).
- Contributing factor breakdown (Underpass geometry impact, rainfall burden, drainage deficit, impervious surface %).
- Data freshness timestamp and explicit non-incident disclaimer.

### Screen D — Citizen Report Submission
- Click **"Report Flood"** in the top navigation header.
- Choose a monitored Pune hotspot or enter custom street details.
- Select estimated water depth (Ankle, Knee, Waist deep, Submerged).
- Enter description and optional photo attachment (validated <5MB).
- Submissions immediately enter the system with the **Unverified** status.

### Screen E — Reports & Verification (Demo Review Center)
- Lists all crowdsourced incident reports with proximity clustering alerts (warns if another report exists within 350m).
- Demo Reviewer action allows changing status:
  - `Unverified` ➔ `Under review` ➔ `Corroborated` ➔ `Verified` ➔ `Rejected`
- Adding reviewer notes and confirming decisions updates SQLite in real time.
- Citizen reports are quarantined from automated model retraining.

### Screen F — Inspection Priorities
- Ranked list (1 to 18) for municipal teams based on:
  `Hazard Score + Corroborated Reports (+0.25) + Unverified Backlog (+0.05) + Infrastructure Vulnerability + Population Density`
- Displays transparent drivers for each rank and suggested municipal intervention (e.g. "Deploy Rapid Dewatering Suction Unit").

### Screen G — Data & Model Transparency
- Interactive 6-stage end-to-end processing flow.
- Input data registry table detailing agencies, sync status, and update cadence.
- Quality & leakage prevention audit checklist.
- Model architecture specifications (Hydrological Heuristic + Scikit-Learn Random Forest, Seed 42, feature definitions, known limitations).

### Screen H — Safe Corridor Routing (Experimental)
- Compares candidate travel corridors across Pune (e.g. Swargate ➔ Pune Station, Baner ➔ Shivajinagar, Kothrud ➔ Pune Camp).
- Highlights waterlogged hotspots along candidate paths.
- Cautious navigational advice and one-click "Overlay Route on Map".

---

## 6. 2–3 Minute Hackathon Demo Script

| Time | Action | Speaking Points |
| :--- | :--- | :--- |
| **0:00 - 0:30** | Open Dashboard | *"Pune faces acute urban flooding during monsoon cloudbursts due to natural river basins, choked stormwater outfalls, and depressed railway subways. Pune JalRakshak is our AI decision-support prototype built for Track 2."* |
| **0:30 - 1:00** | Interactive Map | *"On our Leaflet map, you can observe 18 monitored hotspots. For instance, clicking Shivajinagar Underpass reveals a Severe Risk score of 89%. Notice the transparent factor decomposition: the subterranean underpass geometry contributes +24%, combined with 28mm/h simulated rainfall and a choked 2.1/10 drainage score."* |
| **1:00 - 1:30** | Forecast Horizon Toggle | *"Switching from a 1-hour to a 3-hour horizon updates simulated accumulations, expanding high-risk zones across Katraj and Alka Talkies."* |
| **1:30 - 2:00** | Citizen Report & Review | *"Citizens can report active waterlogging via the 'Report Flood' button. Every report enters as 'Unverified'. In the Verification Center, demo reviewers can corroborate alerts with field CCTV, triggering proximity cluster warnings."* |
| **2:00 - 2:30** | Inspection Queue & Routes | *"In the Inspection Priorities tab, municipal teams receive an explainable ranking of where to deploy suction dewatering pumps. Drivers can also compare routes on the Safe Corridor tab to bypass inundated subways."* |
| **2:30 - 3:00** | Transparency & Closing | *"Finally, our Model Transparency tab explicitly discloses all simulated data feeds and limitations. We do not claim fabricated accuracy; rather, we provide an honest, explainable decision-support baseline ready for empirical PMC telemetry."* |

---

## 7. Demo Video Recording Checklist

- [ ] Clear desktop resolution set to 1920x1080 (1080p).
- [ ] Both Backend (`uvicorn`) and Frontend (`npm run dev`) verified active.
- [ ] Browser window open at `http://127.0.0.1:5173/` in full-screen view.
- [ ] Audio microphone checked for clear narration.
- [ ] Demonstrate:
  1. Overview KPI cards and Risk Distribution chart.
  2. Map interaction, marker selection, and Location Details panel.
  3. Horizon switcher (1h ➔ 3h ➔ 6h).
  4. Submit citizen report form (`Unverified` badge).
  5. Audit review in the Reports Center (`Corroborated` transition).
  6. Inspection priorities ranking.
  7. Route comparison and Model Transparency tabs.
- [ ] Demo Video URL Placeholder: `https://youtu.be/pune-jalrakshak-demo-genesis`
