# 🕵️ AI Mystery Room (The Detective's Terminal)

An interactive, browser-based detective deduction platform powered by **Google Gemini API** (`@google/genai`) and the **MERN** stack. The player enters a scenario prompt (or picks a preset), and the backend autonomously architects a logically coherent, Knox Fair-Play-compliant murder mystery.

---

## 🌟 Key Features

1. **Knox Fair-Play Deduction Engine**
   - Autonomous multi-stage case generator adhering to Ronald Knox Golden Age rules.
   - Every mystery contains a definitive, logically provable contradiction that invalidates the true culprit's alibi.
   - Zero-knowledge character architecture: innocent suspects do not know who the killer is in their prompt context, preventing hallucinations and accidental leaks.

2. **Multi-Modal Evidence Dossier**
   - **WhatsApp Simulator:** Interactive smartphone shell showing extracted group chats, sent/received timestamps, read receipts, and suspicious deleted messages.
   - **CCTV & Surveillance Monitor:** Multi-camera feed viewer with timeline scrubbing, forensic zoom, timestamp HUD overlay (`[CAM 04 - NORTH CORRIDOR]`), and CRT scanline effects.
   - **Forensic Autopsy & Badge Access Logs:** Authentic paper autopsy reports, coroner toxicology stamps, and door sensor badge logs.
   - **Evidence Corkboard:** Polaroid-style suspect mugshots, clue pins, and interactive red thread connections.

3. **Live Suspect Interrogation Terminal (WebSockets)**
   - Real-time interactive interrogation powered by Gemini 3.8 Flash.
   - Live EKG heart-rate & stress monitor (0–100%) that spikes when suspects are confronted with contradictory evidence.
   - Suspects crack and confess when undeniable proof is presented.
   - Built-in anti-jailbreak sanitization gateway protecting against prompt injection.

4. **Grand Jury Accusation & Scoring Engine**
   - Submit formal indictments: Accused Suspect, Motive, Murder Method, Critical Clue, and Deduction Argument.
   - Gemini evaluates logic from 0–100 and awards detective ranks:
     - **90–100:** *Master Sleuth*
     - **75–89:** *Senior Inspector*
     - **50–74:** *Inquisitive Detective*
     - **30–49:** *Amateur Sleuth*
     - **0–29:** *Baffled Constable*
   - Full post-mortem debrief revealing true motives, weapon mechanics, and chronological crime timeline.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Vite) | Single Page Application |
| **Styling** | Tailwind CSS + Lucide Icons | Dark Noir / Cyber-Forensics theme |
| **State** | Zustand | Reactive case state and evidence pinning |
| **Realtime** | Socket.io-client | Low-latency suspect interrogation streaming |
| **Backend** | Node.js + Express.js | REST API & WebSocket orchestration |
| **Database** | MongoDB / Mongoose + Embedded Store | Automatic dual-mode (MongoDB Atlas or embedded local persistence) |
| **AI Models** | Google Gemini (`@google/genai`) | `gemini-3.8-flash` & `gemini-3-pro-image` / Imagen |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v24)
- (Optional) **MongoDB** installed locally or MongoDB Atlas connection string. If MongoDB is not running, the application automatically runs in embedded persistent storage mode!
- (Optional) **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/). If not provided, rich procedural fallback mysteries are generated seamlessly.

### 2. Environment Configuration
Create or edit `server/.env`:
```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mystery_room
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

### 3. Install & Run
From the root directory:
```bash
# Install all root, server, and client packages
npm run install:all

# Run both backend server and frontend client concurrently
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 REST & WebSocket API Reference

### REST Endpoints
* `POST /api/v1/cases/generate`: Asynchronously initiates case synthesis.
* `GET /api/v1/cases/:id/status`: Polls generation progress percentage.
* `GET /api/v1/cases/:id`: Fetches redacted case dossier, suspects, and evidence.
* `POST /api/v1/cases/:id/accuse`: Submits player accusation and returns verdict score.
* `POST /api/v1/cases/:id/notes`: Persists detective scratchpad notes.
* `POST /api/v1/cases/seed-demo`: Instantly provisions pre-baked "The Faraday Protocol" case.

### WebSocket Protocol (`ws://localhost:5000/socket.io/`)
* **Client to Server:**
  - `interrogate_suspect`: `{ suspectId, message, presentedEvidenceId }`
  - `pin_evidence`: `{ evidenceId }`
* **Server to Client:**
  - `suspect_typing`: `{ suspectId, isTyping }`
  - `suspect_message`: `{ suspectId, content, stressLevel, cracked, timestamp }`
  - `evidence_pinned`: `{ evidenceId, pinned }`

---

## 🧪 Acceptance Test Verification (TC-01 through TC-07)
All test cases outlined in `SPEC-001` Section 9 are supported:
- **TC-01:** Custom prompt generation within 30-45s with 3+ suspects and 4+ evidence items.
- **TC-02:** WhatsApp evidence with timestamps, suspect dialogue, and deleted message markers.
- **TC-03:** Visual rendering of CCTV frames, crime scene, and suspect portraits.
- **TC-04:** Innocent suspects deny guilt plausibly without leaking the true killer.
- **TC-05:** Prompt injection attempts are caught by the sanitization gateway.
- **TC-06:** Correct accusation with critical clue yields score > 85% and 'Master Sleuth' rank.
- **TC-07:** Wrong suspect yields score < 40% with analytical feedback and truth reveal.
