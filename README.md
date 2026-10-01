# 📚 Study Planner

A lightweight, browser-based task manager designed to help students organise their study schedule. No account, no server, no install — just open the file and start planning.

---

## What It Does

Study Planner lets you create, track, and manage study tasks entirely in your browser. Every task you add is stored in `localStorage`, so your data persists between sessions without any backend or database.

---

## Features

- **Add study tasks** — each task captures a subject, a description, and a due date.
- **Due-date awareness** — tasks are automatically labelled *Overdue*, *Due today*, or left unlabelled for upcoming work.
- **Mark complete** — check off a task to mark it done; the card is visually distinguished and can be unchecked at any time.
- **Delete tasks** — remove a task with a smooth fade-out animation.
- **Filter by subject** — the subject dropdown is populated dynamically from your own task list.
- **Filter by status** — show all tasks, only pending, or only completed.
- **Sort by due date** — toggle ascending (earliest first) or descending (latest first).
- **Live task counter** — a stats bar shows how many tasks are currently displayed, how many are pending, and the total count.
- **XSS-safe rendering** — all user input is HTML-escaped before being injected into the DOM.
- **Zero dependencies** — plain HTML, CSS, and vanilla JavaScript; no frameworks or build tools required.

---

## Project Structure

```
study planner/
├── index.html        # App shell and markup
├── css/
│   └── style.css     # All styling
└── js/
    └── app.js        # State management, rendering, and event handling
```

---

## How to Run

Because the app is entirely static, running it requires nothing more than opening the HTML file.

### Option 1 — Open directly in a browser

1. Download or clone this repository.
2. Double-click `index.html`, or drag it into any modern browser tab.

> **Note:** `localStorage` works on `file://` URLs in most browsers. If you see any issues, use Option 2.

### Option 2 — Serve with a local HTTP server

If you have Node.js installed:

```bash
npx serve .
```

Or with Python:

```bash
# Python 3
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

---

## Browser Support

Any modern browser that supports ES6+ and the `localStorage` API:

| Browser | Minimum version |
|---------|----------------|
| Chrome  | 60+            |
| Firefox | 55+            |
| Safari  | 11+            |
| Edge    | 79+            |

---

## Data Storage

All tasks are stored in your browser's `localStorage` under the key `studyPlanner_tasks`. Clearing browser data or site storage will erase your tasks. No data is ever sent to a server.

---

## Built With

- **HTML5** — semantic markup
- **CSS3** — custom properties, flexbox layout
- **Vanilla JavaScript (ES6+)** — no frameworks or libraries

---

## Built Using IBM Bob

This project was built with the assistance of **[IBM Bob](https://www.ibm.com/products/bob)**, IBM's AI software engineering assistant. IBM Bob helped scaffold the application structure, implement features, and author this documentation.
