# SVG Graphic Editor -- Project Overview

## Description

This project is a web-based SVG graphic editor, similar in concept to simplified versions of Paint or Inkscape. Users can create, edit, and manipulate vector shapes directly in the browser. The editor supports five core shape types -- Line, Rectangle, Circle/Ellipse, Polygon, and Text -- each with configurable visual properties including stroke color, fill color, stroke width, and opacity.

The application provides a complete editing workflow: users select a drawing tool from the toolbar, draw shapes on an SVG canvas, then select and modify those shapes through a dedicated property panel. Shape operations include selection, movement, dimension editing, property changes, and deletion. The editor also supports file I/O, allowing users to save their work as standard `.svg` files and re-open them later for continued editing.

Built as a Next.js web application with TypeScript, the project follows a test-driven development methodology. The codebase is structured for maintainability and extensibility, using Zustand for state management and a clean component architecture that separates concerns between the canvas, toolbar, and property panel.

## Tech Stack

| Technology                | Role            | Justification                                                                                 |
| ------------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| **Next.js 14**            | Framework       | File-based routing, built-in optimizations, easy Vercel deployment                            |
| **TypeScript**            | Language        | Type safety for shape hierarchies and editor state; catches errors at compile time            |
| **React 18**              | UI library      | Component model fits the editor's panel-based UI; Context API sufficient for state management |
| **pnpm**                  | Package manager | Fast installs, strict dependency resolution, disk-efficient                                   |
| **Jest**                  | Testing         | Industry standard for React/TS testing; good watch mode for TDD                               |
| **React Testing Library** | Component tests | Tests user behavior rather than implementation details                                        |
| **ESLint + Prettier**     | Code quality    | Consistent formatting and lint rules across all contributors                                  |
| **GitHub Actions**        | CI              | Runs lint, typecheck, and tests on every push/PR                                              |
| **Vercel**                | Deployment      | Native Next.js hosting with automatic preview deployments per PR                              |

## Development Methodology

**Test-Driven Development (TDD):** Every feature begins with failing tests. The cycle is Red (write failing test) -> Green (minimal implementation) -> Refactor (clean up). This ensures high test coverage and shapes the API design from the consumer's perspective.

**Phased Delivery:** The project is split into six phases, each building on the previous:

1. **Phase 0** -- Documentation, diagrams, architecture decisions (current)
2. **Phase 1** -- Foundation: project scaffold, TypeScript types, state management, CI pipeline
3. **Phase 2** -- Core UI: Canvas, Toolbar, and PropertyPanel components
4. **Phase 3** -- Shape drawing: implement each shape tool one at a time
5. **Phase 4** -- Interactions: selection, move, resize, delete, live property editing
6. **Phase 5** -- File I/O: SVG serialization (save) and parsing (open)
7. **Phase 6** -- Polish: keyboard shortcuts, undo/redo, final deployment

Each phase produces a working, testable increment. No phase starts until the previous phase's tests pass and code is merged.

## Team Structure

The project uses a multi-agent development approach with specialized roles:

| Agent            | Responsibility                                           |
| ---------------- | -------------------------------------------------------- |
| **Agent 1**      | Project scaffold, configuration, CI/CD setup             |
| **Agent 2**      | TypeScript types, interfaces, and state management       |
| **Agent 3**      | Architecture Decision Records (ADRs)                     |
| **Agent 4**      | Diagrams and documentation (this document)               |
| **Orchestrator** | Coordinates agents, reviews deliverables, manages phases |

All agents work from the same repository and coordinate through the issue tracker and git workflow.
