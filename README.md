# DorkQuery - Advanced OSINT & Google Hacking Query Studio

**DorkQuery** is a high-performance web studio designed for cybersecurity researchers, penetration testers, bug bounty hunters, and OSINT analysts to build, test, explore, and optimize search engine dorks with precision.

---

## 🚀 Key Features

### 🧩 Visual Query Studio & Drag-and-Drop Workspace
- **Rich Operator Palette**: Organized by Core (`site:`, `inurl:`, `intitle:`, `intext:`, `filetype:`, `ext:`), Advanced (`allinurl:`, `allintitle:`, `allintext:`, `related:`, `cache:`), and Logic/Modifiers (`""`, `-`, `OR`, `*`, `()`, `after:`, `before:`).
- **Dual Interaction**: Click the `+` button on any operator for instant addition, or drag-and-drop to place it at a specific position.
- **Smart Operator Sanitization**: Avoids double prefixes (e.g. `site:site:target.com`) and formats exact phrases, negation, and logic cleanly.
- **Autocomplete Suggestions**: Quick suggestion chips for common filetypes (`pdf`, `env`, `sql`, `log`, `bak`) and URL paths.
- **Block Controls**: Duplicate block (⎘), reorder up/down (↑/↓), and remove (✕).
- **Undo / Redo**: Full workspace history support (`Ctrl+Z` / `Ctrl+Y`).
- **One-Click Workspace Actions**: Copy query, share link (`#q=...`), export, and clear workspace.

### ⚡ Security & OSINT Templates (Presets)
- Curated library of 27+ ready-to-use security audit presets across 9 categories:
  - 🔑 Passwords, Leaked Keys & Secrets (`.env`, SQL dumps, RSA private keys)
  - 🚪 Admin & Authentication Portals (cPanel, wp-admin, phpMyAdmin)
  - ⚙️ Configuration Files & Exposed `.git` Repositories
  - 📁 Open Directory Listings (`"Index of /"`)
  - 💾 Database Backups & Dumps (`.sql`, `.bak`, `.dump`)
  - ☁️ Cloud Buckets Exposure (AWS S3, Azure Blob, Google Cloud Storage, Firebase)
  - 📜 Application Error & Debug Logs (Django debug, server stack traces)
  - 📹 Exposed Webcams & IoT Hardware (Axis cameras, network video streams)
  - 📄 Confidential Documents & Payroll Leaks
- **Dynamic Target Domain Injection**: Enter your target domain once, and all presets automatically format with your scope.

### 📥 Intelligent Dork String Import
- Paste any complex dork query (e.g. `site:github.com filetype:env "DB_PASSWORD" -test`) to automatically parse and deconstruct it into interactive workspace blocks.

### 🔍 Dork Database Explorer & Instant Search
- **Instant Non-Blocking Startup**: High-speed loading of **7,944 verified Exploit-DB Google Hacking Database (GHDB)** dorks in milliseconds (< 50ms).
- **Deep Search with Web Worker**: Seamlessly switch to the **Unified 900,000+ DorkHub + GHDB dataset** via a background Web Worker without freezing the browser UI.
- **Live Debounced Search**: Multi-word token search with keyword highlighting in results.
- **Card Actions**:
  - `+ To Workspace`: Smartly deconstructs the dork into workspace blocks.
  - `🚀 Search`: Launch search directly in your preferred engine.
  - `📋 Copy`: Fast 1-click clipboard copy.
  - `⭐ Star / Favorite`: Bookmark dorks locally with dedicated Favorites tab.
- **Advanced Pagination**: Page numbers, jump-to-page input, and items-per-page selector (15, 30, 50, 100).

### 🌐 Multi-Engine & OSINT Target Support
- Launch queries directly into:
  - Google Search
  - DuckDuckGo
  - Microsoft Bing
  - GitHub Code Search
  - Shodan Search
  - Yahoo!
  - Yandex
  - URLScan.io

### 🎨 Modern Cyber Aesthetic & Themes
- Dark Cyber theme (default)
- Terminal / Hacker Green theme
- Clean Light theme

---

## 📁 Project Structure

```
DorkQuery/
├── index.html               # Main application markup & modal layouts
├── style.css                # Polished responsive cybersecurity theme
├── test_suite.mjs           # Automated test suite (ESM Node.js)
├── js/
│   ├── main.js              # Application bootstrap & event coordination
│   ├── blockManager.js      # Workspace blocks, history, palette & export
│   ├── dorkParser.js        # Dork query parser & serializer
│   ├── presets.js           # Vetted OSINT & security templates
│   ├── dorkWorker.js        # Web Worker for non-blocking 900k-record search
│   ├── ghdbService.js       # Data service (GHDB, Web Worker, favorites)
│   ├── ghdbExplorerUI.js    # Dork explorer UI, pagination & card rendering
│   ├── customBlock.js       # Custom block creator & LocalStorage persistence
│   ├── dnd.js               # Drag-and-drop orchestration (SortableJS)
│   ├── domUtils.js          # DOM utility helpers
│   └── toast.js             # Non-intrusive notification toast system
├── data/
│   ├── ghdb_clean.json      # 7,944 verified Exploit-DB GHDB dorks
│   ├── unified_dorks.json.gz# 909,715 unified dorks (GHDB + DorkHub)
│   └── ...                  # Dataset parsers & extraction scripts
└── assets/                  # Favicons, web manifest, and touch icons
```

---

## 🛠️ Local Development & Running

Because the application fetches local data files (`data/*.json` and `data/*.json.gz`), an HTTP server is recommended:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (e.g. npx serve)
npx serve .
```

Then open `http://localhost:8000` in your browser.

---

## 🧪 Automated Testing

Run the automated test suite with Node.js:

```bash
node test_suite.mjs
```

This verifies:
1. `dorkParser.js` tokenization and bidirectional serialization.
2. `presets.js` template structure and dynamic domain substitution.
3. `ghdb_clean.json` dataset integrity and record count.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> | Launch search in active search engine |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | Focus Explorer search bar |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> | Copy generated query to clipboard |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo workspace change |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Redo workspace change |
| <kbd>Esc</kbd> | Close open modal (Presets, Cheat Sheet, Import) |

---

## 📜 Credits & Data Sources

- **Google Hacking Database (GHDB)** curated by [OffSec / Exploit-DB](https://www.exploit-db.com/google-hacking-database).
- **DorkHub** community repository by [TrixSec](https://github.com/TrixSec/DorkHub).
- Built with ❤️ by [pr0ff3](https://sproffes.github.io/resources/).
