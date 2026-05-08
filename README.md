# 📉 Expense Tracker PWA

A secure, mobile-first, and **offline-first** Expense Tracker application built with React and Vite. Say goodbye to loading screens—all your transaction data is processed instantly and securely on your own device through IndexedDB.

---

## ✨ Features

### 1. Offline-First & Lightning Fast ⚡
- Data is entirely localized to your browser using `idb` (IndexedDB layer). No connection needed to quickly log an expense or view your dashboard.
- Includes a Progressive Web App (PWA) manifest and Service Worker caching setup, allowing you to "Install" the app directly to your home screen.

### 2. Password Protection & Security 🔐
- Features an **App-Level Lock Screen**.
- Secures your application through a local robust `js-sha256` hashing algorithm. Your PIN is never stored as plaintext—even in the local database!
- On initial launch, seamlessly guides the user to set up their 4-digit PIN lock. 

### 3. Beautiful Dashboard & UI 📊
- Implements a modern dark-themed Glassmorphism UI aesthetic with fluid micro-animations.
- An interactive dashboard built with **Recharts**, calculating Category-wise breakdowns and Monthly Spending comparisons automatically.

### 4. Advanced "Splitting" & "Breakdowns" 🤝
- **Split Expense:** Did you pay for lunch with a friend? Log the large expense and hit the "🤝 Split" button. Easily generate Equal/Custom shares between you and an email contact.
- **Breakdown Expense:** Logged a massive "Shopping" expense? Hit the "🗂️ Breakdown" button to categorize sub-items precisely. Features a strict validator that guarantees all sub-items add up exactly to the total parental amount!

### 5. Automated SMS Detection (Simulated) 📩
- Integrated regex processors capable of safely reading banking and UPI debit messages.
- Extract Amounts, Dates, and Categories automatically from an SMS format. *Since native SMS scanning requires a Capacitor/PhoneGap wrapper, a handy test simulation tool has been added directly to the "Settings" menu.*

### 6. Cloud Sync Queueing (Future-Proofed) 🔄
- Operates via an event queue manager. All local changes are tagged as `"local"` status and pushed to a `syncQueue` database store. 
- You can attempt to clear the queue and flag them as `"synced"` via the "Run Background Sync" simulation inside the Settings panel!

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and NPM installed on your machine.

### Installation & Running 
1. Navigate into the application directory:
   ```bash
   cd expense-tracker
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Boot up the local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173/](http://localhost:5173/) in your web browser!

---

## 🧪 Testing

This project incorporates a robust suite of **61 automated tests** spanning unit testing for complex utility logic and DOM integration testing for full React UI workflows.

To run the full suite using **Vitest**:
```bash
npm test
```

*Note: The mock testing handles the intricate IndexedDB constraints as well as the app-level PIN locks entirely automatically.*

---

## 🛠️ Tech Stack & Library Map

| Tool | Usage |
|------|-------|
| **React 18** | Core architecture & Component Lifecycle |
| **Vite 8** | Lightning-fast bundler and hot-reloading |
| **Vanilla CSS** | Token-based theming and raw native styling controls, no heavy frameworks |
| **idb** | Lightweight async wrapper over raw browser IndexedDB primitives |
| **Recharts** | Rendering responsive SVG-based charts |
| **js-sha256** | Zero-dependency localized cryptography plugin for PIN hashes |
| **Vitest & RTL** | Advanced mock injection, assertion, and rendering environment |

---

## 📱 Standard Walkthrough

- **First Launch**: You will be greeted perfectly centered numeric pad. Create your 4-digit PIN to kick-off.
- **Add Transactions**: Click the **(+) Add** FAB button hovering at the bottom right. Pick a sum, title, and categorize it (Food, Travel, Bills, etc).
- **Edit/Delete**: Switch to the **Expenses** view. Tap directly onto it to edit, click 🤝 or 🗂️ to manage the split details, or click the Red 🗑️ button.
- **Review**: Switch back to the **Dashboard** Tab to instantly visualize how your charts react to your data inputs.
- **Tinker Settings**: Open the **Settings** view and tap `Simulate Incoming SMS` or `Run Background Sync` to try out backend connectivity modules!
