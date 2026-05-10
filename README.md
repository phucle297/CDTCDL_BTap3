# CDTCDL - Bài tập 3: SVG Graphic Editor

A web-based SVG graphic editor built with React, TypeScript, and Next.js. Supports creating rectangles, ellipses, lines, and text with full property editing, undo/redo, keyboard shortcuts, and file I/O.

## Live Demo

[https://cdtcdl-btap3.vercel.app](https://cdtcdl-btap3.vercel.app)

## Features

- Draw rectangles, ellipses, lines, and text
- Select, move, and delete shapes
- Edit shape properties (fill, stroke, opacity)
- Inline text editing with double-click
- Undo/Redo with 50-step history
- Keyboard shortcuts for all tools
- Zoom to fit all shapes
- Live mouse coordinate display
- Export/Import SVG files
- Responsive canvas with status bar

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run test suite |
| `npm run lint` | Lint with oxlint |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| V | Select tool |
| R | Rectangle tool |
| E | Ellipse tool |
| L | Line tool |
| T | Text tool |
| Delete / Backspace | Delete selected shape |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z / Ctrl+Y | Redo |
| Ctrl+S | Save as SVG |
| Escape | Deselect all |

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Next.js 16** — App framework and bundler
- **Zustand** — State management
- **Jest + Testing Library** — Test suite

## License

MIT
