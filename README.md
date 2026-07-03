# ⚡ CalcSprint

**CalcSprint** is a high-performance, gamified mental calculation speed trainer designed specifically for competitive exam aspirants (SSC, Bank PO, IBPS, Railways, CSAT, etc.). Built with React, TypeScript, Vite, and Tailwind CSS v4, it provides a distraction-free, zero-lag environment to hone math reflexes, track history, and compete on global leaderboards.

---

## 🚀 Key Features

*   **21 Gamified Training Modes**:
    *   **Alphabet Operations**: Mirror mapping (e.g. A↔Z) and position matching (A=1 ... Z=26).
    *   **High-Speed Arithmetic**: Digit additions and subtractions with range boundaries ensuring non-negative results.
    *   **Multiplication**: 1-digit, 2-digit, and 3-digit configurations.
    *   **Exact Division**: Dynamically bounded divisors and quotients guaranteeing integer division (no decimal stutters).
    *   **Power Operations**: Squares, Cubes, and Square Roots of perfect squares up to 5 digits.
    *   **Divisibility Checks**: Yes/No quick checking covering divisors from 2 to 11.
*   **Precision Prep Countdown**: A 3-second preparation countdown precedes every session, letting the user align focus before inputs start. Timer loops are isolated so prep timing does not affect speed scores.
*   **Drift-Free Precision Timer**: Utilizes a timestamp differential mechanism within a 60fps `requestAnimationFrame` loop, preventing timer drift or freezes common in traditional interval timers.
*   **Deduplicated Global Rankings**: High-score leaderboards separated by question count (10, 20, 30, and 50 questions) with client-side deduplication grouping, displaying exactly one best run per player.
*   **Badge Accomplishments**: Automated achievement awarding ("First Quiz", "Speed Demon", "Perfectionist", "Century Club") stored in Firebase.
*   **Premium Visual Assets**: Includes 16 native high-resolution emoji-based avatars, light/dark styling layouts using **Outfit** (UI typography) and **JetBrains Mono** (quantitative number fields), and 150ms tactile incorrect-answer shakes and correctness flashes.

---

## 🛠️ Tech Stack

*   **Frontend**: React (v19) + Vite + TypeScript (v6)
*   **Styling**: Tailwind CSS v4
*   **Icons**: Lucide React
*   **Routing**: React Router DOM (v7)
*   **Database & Auth**: Cloud Firestore + Firebase Authentication (Email/Password + Google Sign-In)

---

## 📂 Project Structure

```text
calcsprint/
├── firestore.rules          # Security rules for collections
├── index.html               # Entry HTML with preconnected Outfit/JetBrains fonts
├── package.json             # Build script config and npm packages
├── vite.config.ts           # Vite + Tailwind compilation configs
└── src/
    ├── App.tsx              # Main Router and protected route guards
    ├── main.tsx             # Application mount point
    ├── index.css            # Styling system, tokens, and animations
    ├── components/          # Reusable UI widgets (Navbar, Card, Button, TimerBar)
    ├── config/              # Firebase configuration credentials
    ├── questionGenerators/  # 21 pure arithmetic mode generators
    └── pages/               # Views (Login, Onboarding, Dashboard, Settings, Quiz, Results, Leaderboard, Profile)
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Install Dependencies
Clone the repository and run the following command in the root folder to download the required node modules:
```bash
npm install
```

### 3. Run Locally in Development Mode
Launch the local dev server using:
```bash
npm run dev
```
Open your browser and navigate to the local address displayed in the console (usually `http://localhost:5173`).

### 4. Build for Production
To package and minify the assets into the production-ready `/dist` folder, run:
```bash
npm run build
```
You can verify the production bundle locally with:
```bash
npm run preview
```

---

## 🔒 Firebase Database Schema

### `users/{uid}`
Tracks user profiles, badges earned, and mode-specific statistics:
```typescript
interface UserProfile {
  username: string;
  usernameLower: string; // Used for uniqueness check on onboarding
  avatarId: string;      // Selection of 16 emojis
  badges: string[];      // Array of earned badges
  createdAt: Timestamp;
  stats: {
    [modeId: string]: {
      bestScore: number;
      bestAccuracy: number;
      bestTimeSeconds: number;
      totalAttempts: number;
    }
  }
}
```

### `usernames/{usernameLower}`
Stores username reservations to enforce case-insensitive uniqueness checks:
```json
{
  "uid": "user_auth_id"
}
```

### `scores/{uid_modeId_numQuestions}`
Maintains personal best scores. Using a deterministic document ID (`${uid}_${modeId}_${numQuestions}`) automatically enforces high-score replacement rules (updating records only when a user beats their previous best score/speed).
