# System Design: SVG Graphic Editor

## 1. Application Architecture

### Architecture Pattern

The application follows a **unidirectional data flow** pattern built on a centralized store (Zustand). All shape data lives in a single global store. User interactions on the canvas dispatch actions to the store, the store updates, and React re-renders the SVG elements. This is the same pattern used by production vector editors (Figma's architecture, Excalidraw) scaled down to our requirements.

```
User Input (mouse/keyboard)
        |
        v
  Event Handlers (Canvas component)
        |
        v
  Actions (Zustand store mutations)
        |
        v
  State Update (immutable shape array)
        |
        v
  React Re-render (SVG elements)
        |
        v
  Visual Output (browser SVG rendering)
```

### Component Hierarchy

```
App
├── EditorProvider (context for non-shape UI state like panel visibility)
│
├── Header
│   ├── FileMenu (Save / Open SVG)
│   └── EditMenu (Undo / Redo / Delete)
│
├── Toolbar
│   ├── ToolButton (Select)
│   ├── ToolButton (Line)
│   ├── ToolButton (Rectangle)
│   ├── ToolButton (Circle/Ellipse)
│   ├── ToolButton (Polygon)
│   └── ToolButton (Text)
│
├── CanvasArea
│   ├── SVGCanvas
│   │   ├── ShapeRenderer (iterates shapes z-order)
│   │   │   ├── LineShape
│   │   │   ├── RectangleShape
│   │   │   ├── EllipseShape
│   │   │   ├── PolygonShape
│   │   │   └── TextShape
│   │   ├── SelectionOverlay (bounding box + handles)
│   │   └── DrawingPreview (shape being drawn, not yet committed)
│   └── CanvasControls (zoom display, optional)
│
└── PropertyPanel
    ├── TransformSection (x, y, width, height, rotation)
    ├── FillSection (fill color, opacity)
    ├── StrokeSection (stroke color, stroke width)
    └── TextSection (font size, text content — shown only for text shapes)
```

### Data Flow Description

1. **Tool selection**: User clicks a tool button. Toolbar calls `setActiveTool(tool)` on the store.
2. **Drawing**: User mousedown/mousemove/mouseup on SVGCanvas. The canvas event handler checks `activeTool` from the store, constructs a new shape object, and calls `addShape(shape)`.
3. **Selection**: When `activeTool === 'select'`, click events run hit detection against all shapes (reverse z-order). The first hit calls `setSelectedShapeIds([id])`.
4. **Property editing**: PropertyPanel reads the selected shape from the store, displays its properties. User edits trigger `updateShape(id, partialProps)`.
5. **Move/resize**: Mouse drag on a selected shape or its handles calls `updateShape(id, { x, y, ... })` on each mousemove.
6. **Undo/redo**: Every mutating action pushes the previous state snapshot onto a history stack. Undo pops the stack and restores.

---

## 2. Component Structure

### Canvas Component (`SVGCanvas`)

**Responsibilities:**

- Render an `<svg>` element that fills the canvas area
- Iterate over `shapes` array and render each via `ShapeRenderer`
- Handle all mouse events (mousedown, mousemove, mouseup) on the SVG element
- Delegate event logic based on `activeTool`:
  - `select`: hit detection, drag-to-move, click-to-select
  - Drawing tools: create preview shape on drag, commit on mouseup
- Handle keyboard events (Delete key, Ctrl+Z, Ctrl+Shift+Z)
- Render selection overlay (bounding box, resize handles) for selected shapes
- Render the in-progress drawing preview shape

**Key props:** None (reads from store directly via hooks).

### Toolbar Component (`Toolbar`)

**Responsibilities:**

- Display tool buttons for each available tool
- Highlight the currently active tool
- Call `setActiveTool(tool)` on click
- Stateless presentation component (reads `activeTool` from store)

### Property Panel Component (`PropertyPanel`)

**Responsibilities:**

- Read the currently selected shape(s) from the store
- Display editable fields for position, dimensions, fill, stroke, opacity
- Show shape-specific fields (e.g., text content and font size for TextShape)
- On input change, call `updateShape(id, { [property]: value })`
- Show "No selection" placeholder when nothing is selected
- Handle multi-select by showing shared properties only (future enhancement)

### Shape Components

Each shape type has a corresponding React component that receives shape data as props and renders the appropriate SVG element.

| Component        | SVG Element | Key Props                   |
| ---------------- | ----------- | --------------------------- |
| `LineShape`      | `<line>`    | x1, y1, x2, y2              |
| `RectangleShape` | `<rect>`    | x, y, width, height, rx, ry |
| `EllipseShape`   | `<ellipse>` | cx, cy, rx, ry              |
| `PolygonShape`   | `<polygon>` | points                      |
| `TextShape`      | `<text>`    | x, y, content, fontSize     |

All shape components receive common style props: `fill`, `fillOpacity`, `stroke`, `strokeWidth`, `opacity`.

Shape components are pure renderers. They do NOT handle events. All interaction events are handled at the SVGCanvas level using coordinate math and hit detection.

---

## 3. State Management Strategy

### Approach: Zustand

**Why Zustand over alternatives:**

- **vs Context + useReducer**: Context re-renders all consumers on any state change. With 100+ shapes, this causes performance issues. Zustand supports granular subscriptions via selectors.
- **vs Redux Toolkit**: Redux adds boilerplate (slices, action creators, provider setup). Zustand is ~1KB, has no provider requirement, and the API surface is minimal. For an app of this scope, Redux is overkill.
- **vs Jotai/Recoil**: Atom-based state works well for independent pieces of state but makes undo/redo (whole-state snapshots) more complex. Our shapes array is inherently a single collection.

### Global State Shape

```typescript
interface EditorState {
  // Shape data
  shapes: Shape[];

  // Selection
  selectedShapeIds: string[];

  // Active tool
  activeTool: ToolType;

  // Drawing state (in-progress shape before commit)
  drawingPreview: Shape | null;

  // History for undo/redo
  history: HistoryState;

  // Clipboard
  clipboard: Shape[] | null;
}

interface HistoryState {
  past: ShapeSnapshot[];
  future: ShapeSnapshot[];
}

type ShapeSnapshot = Shape[];
```

### Actions / Mutations

```typescript
interface EditorActions {
  // Tool
  setActiveTool: (tool: ToolType) => void;

  // Shapes — all shape mutations push to history
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<ShapeProperties>) => void;
  deleteShape: (id: string) => void;
  deleteSelectedShapes: () => void;

  // Batch updates (for move/resize during drag — only final position pushes history)
  updateShapeTransient: (id: string, updates: Partial<ShapeProperties>) => void;
  commitTransient: () => void;

  // Selection
  setSelectedShapeIds: (ids: string[]) => void;
  clearSelection: () => void;

  // Drawing preview
  setDrawingPreview: (shape: Shape | null) => void;
  commitDrawingPreview: () => void;

  // Z-order
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  // History
  undo: () => void;
  redo: () => void;

  // Clipboard
  copySelected: () => void;
  pasteClipboard: () => void;

  // File operations
  loadShapes: (shapes: Shape[]) => void;
  clearAll: () => void;
}
```

### Undo/Redo Implementation

The store maintains a `past` and `future` stack of shape array snapshots.

- **Before every mutating action** (add, update, delete): push current `shapes` to `past`, clear `future`.
- **Undo**: pop `past`, push current `shapes` to `future`, restore popped snapshot.
- **Redo**: pop `future`, push current `shapes` to `past`, restore popped snapshot.
- **Transient updates** (drag-move in progress): do NOT push to history. Only `commitTransient()` pushes a snapshot. This prevents flooding the history stack with intermediate positions.
- **Max history depth**: 50 snapshots. Drop oldest when exceeded.

### Zustand Store Definition (structural outline)

```typescript
import { create } from 'zustand';

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  shapes: [],
  selectedShapeIds: [],
  activeTool: 'select',
  drawingPreview: null,
  history: { past: [], future: [] },
  clipboard: null,

  setActiveTool: (tool) => set({ activeTool: tool }),

  addShape: (shape) => {
    const { shapes, history } = get();
    set({
      shapes: [...shapes, shape],
      history: pushHistory(history, shapes),
    });
  },

  updateShape: (id, updates) => {
    const { shapes, history } = get();
    set({
      shapes: shapes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      history: pushHistory(history, shapes),
    });
  },

  deleteShape: (id) => {
    const { shapes, history, selectedShapeIds } = get();
    set({
      shapes: shapes.filter((s) => s.id !== id),
      selectedShapeIds: selectedShapeIds.filter((sid) => sid !== id),
      history: pushHistory(history, shapes),
    });
  },

  undo: () => {
    const { history, shapes } = get();
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    set({
      shapes: previous,
      history: {
        past: history.past.slice(0, -1),
        future: [shapes, ...history.future],
      },
    });
  },

  redo: () => {
    const { history, shapes } = get();
    if (history.future.length === 0) return;
    const next = history.future[0];
    set({
      shapes: next,
      history: {
        past: [...history.past, shapes],
        future: history.future.slice(1),
      },
    });
  },

  // ... remaining actions follow same pattern
}));

function pushHistory(history: HistoryState, currentShapes: Shape[]): HistoryState {
  const past = [...history.past, currentShapes];
  if (past.length > MAX_HISTORY) past.shift();
  return { past, future: [] };
}
```

---

## 4. SVG Rendering Workflow

### State to SVG Pipeline

```
Store.shapes (Shape[])
    |
    v
SVGCanvas component subscribes via useEditorStore(state => state.shapes)
    |
    v
.map() over shapes in array order (index 0 = bottom, last = top)
    |
    v
Switch on shape.type → render <LineShape>, <RectangleShape>, etc.
    |
    v
Each component renders native SVG element with props mapped from Shape data
    |
    v
Browser paints SVG
```

Shape array order defines z-order. Index 0 is rendered first (bottom layer). Last element is rendered last (top layer, visually in front).

### Event Handling Strategy

All mouse events are captured on the root `<svg>` element, not on individual shape elements. This avoids problems with event bubbling, overlapping shapes, and the drawing preview intercepting events.

```
<svg
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
>
  {shapes.map(shape => <ShapeRenderer key={shape.id} shape={shape} />)}
  {drawingPreview && <ShapeRenderer shape={drawingPreview} />}
  {selectedShapeIds.length > 0 && <SelectionOverlay />}
</svg>
```

**Event handler logic by tool:**

```
handleMouseDown(e):
  point = svgPoint(e)  // convert client coords to SVG coords

  if activeTool === 'select':
    hit = hitTest(point, shapes)  // reverse z-order
    if hit:
      setSelectedShapeIds([hit.id])
      startDrag(hit, point)
    else:
      clearSelection()

  else:  // drawing tool
    startDrawing(point)

handleMouseMove(e):
  point = svgPoint(e)

  if isDragging:
    dx = point.x - dragStart.x
    dy = point.y - dragStart.y
    updateShapeTransient(dragTarget.id, { x: original.x + dx, y: original.y + dy })

  if isDrawing:
    setDrawingPreview(buildPreviewShape(activeTool, drawStart, point))

handleMouseUp(e):
  if isDragging:
    commitTransient()  // push to history
    stopDrag()

  if isDrawing:
    commitDrawingPreview()  // add final shape to shapes array
    stopDrawing()
```

### Hit Detection Approach

We use **geometric hit testing** rather than relying on SVG DOM events. This gives us full control over selection behavior.

```typescript
function hitTest(point: Point, shapes: Shape[]): Shape | null {
  // Iterate in reverse (top-most shape first)
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (isPointInShape(point, shape)) {
      return shape;
    }
  }
  return null;
}

function isPointInShape(point: Point, shape: Shape): boolean {
  const tolerance = 5; // pixels, for strokes/lines

  switch (shape.type) {
    case 'rectangle':
      return (
        point.x >= shape.x &&
        point.x <= shape.x + shape.width &&
        point.y >= shape.y &&
        point.y <= shape.y + shape.height
      );

    case 'ellipse':
      // Ellipse equation: ((x-cx)/rx)^2 + ((y-cy)/ry)^2 <= 1
      const dx = (point.x - shape.cx) / shape.rx;
      const dy = (point.y - shape.cy) / shape.ry;
      return dx * dx + dy * dy <= 1;

    case 'line':
      // Distance from point to line segment <= tolerance
      return distanceToSegment(point, shape.x1, shape.y1, shape.x2, shape.y2) <= tolerance;

    case 'polygon':
      // Point-in-polygon ray casting algorithm
      return isPointInPolygon(point, shape.points);

    case 'text':
      // Approximate with bounding box
      return (
        point.x >= shape.x &&
        point.x <= shape.x + estimateTextWidth(shape) &&
        point.y >= shape.y - shape.fontSize &&
        point.y <= shape.y
      );
  }
}
```

### Coordinate System Management

The SVG canvas uses a viewBox to decouple logical coordinates from screen pixels:

```html
<svg
  viewBox="{`${viewBox.x}"
  ${viewBox.y}
  ${viewBox.width}
  ${viewBox.height}`}
  width="100%"
  height="100%"
></svg>
```

**Client-to-SVG coordinate conversion:**

```typescript
function clientToSvgPoint(e: React.MouseEvent, svgElement: SVGSVGElement): Point {
  const ctm = svgElement.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const inverse = ctm.inverse();
  return {
    x: inverse.a * e.clientX + inverse.c * e.clientY + inverse.e,
    y: inverse.b * e.clientX + inverse.d * e.clientY + inverse.f,
  };
}
```

This ensures all shape coordinates are stored in logical SVG units and remain stable regardless of window size or zoom level.

---

## 5. Key TypeScript Types

```typescript
// ─── Unique IDs ───

type ShapeId = string; // UUID v4 via crypto.randomUUID()

// ─── Geometry Primitives ───

interface Point {
  x: number;
  y: number;
}

// ─── Tool Types ───

type ToolType = 'select' | 'line' | 'rectangle' | 'ellipse' | 'polygon' | 'text';

// ─── Common Shape Properties ───

interface BaseShapeProperties {
  id: ShapeId;
  type: ShapeType;
  fill: string; // CSS color, e.g. '#ff0000' or 'transparent'
  fillOpacity: number; // 0..1
  stroke: string; // CSS color
  strokeWidth: number; // pixels
  opacity: number; // 0..1, overall element opacity
  rotation: number; // degrees, for future use
}

// ─── Individual Shape Types ───

type ShapeType = 'line' | 'rectangle' | 'ellipse' | 'polygon' | 'text';

interface LineShape extends BaseShapeProperties {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface RectangleShape extends BaseShapeProperties {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EllipseShape extends BaseShapeProperties {
  type: 'ellipse';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

interface PolygonShape extends BaseShapeProperties {
  type: 'polygon';
  points: Point[];
}

interface TextShape extends BaseShapeProperties {
  type: 'text';
  x: number;
  y: number;
  content: string;
  fontSize: number;
  fontFamily: string;
}

// ─── Discriminated Union ───

type Shape = LineShape | RectangleShape | EllipseShape | PolygonShape | TextShape;

// ─── Shape Properties (for partial updates) ───

type ShapeProperties = Omit<Shape, 'id' | 'type'>;

// ─── Editor State Types ───

interface HistoryState {
  past: Shape[][];
  future: Shape[][];
}

interface EditorState {
  shapes: Shape[];
  selectedShapeIds: ShapeId[];
  activeTool: ToolType;
  drawingPreview: Shape | null;
  history: HistoryState;
  clipboard: Shape[] | null;
}

// ─── Event Types ───

interface CanvasMouseEvent {
  point: Point; // SVG coordinate
  originalEvent: React.MouseEvent<SVGSVGElement>;
  shiftKey: boolean;
  ctrlKey: boolean;
}

interface DragState {
  isDragging: boolean;
  targetId: ShapeId | null;
  startPoint: Point;
  originalShape: Shape | null;
}

interface DrawingState {
  isDrawing: boolean;
  tool: ToolType;
  startPoint: Point | null;
  currentPoint: Point | null;
  // For polygon: accumulated vertices
  vertices: Point[];
}

// ─── File I/O Types ───

interface SvgExportOptions {
  width: number;
  height: number;
  background?: string;
}

// ─── Component Prop Types ───

interface ShapeRendererProps {
  shape: Shape;
  isSelected: boolean;
}

interface ToolButtonProps {
  tool: ToolType;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: (tool: ToolType) => void;
}

interface PropertyFieldProps {
  label: string;
  value: string | number;
  type: 'text' | 'number' | 'color';
  onChange: (value: string | number) => void;
}

// ─── Defaults ───

const DEFAULT_SHAPE_STYLE: Pick<
  BaseShapeProperties,
  'fill' | 'fillOpacity' | 'stroke' | 'strokeWidth' | 'opacity' | 'rotation'
> = {
  fill: 'transparent',
  fillOpacity: 1,
  stroke: '#000000',
  strokeWidth: 2,
  opacity: 1,
  rotation: 0,
};
```

---

## 6. Testing Strategy

### Unit Testing (Jest)

**Target: utility functions and pure logic.**

| Module                       | What to test                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `hitTest` / `isPointInShape` | Point-in-rect, point-in-ellipse, point-near-line, point-in-polygon edge cases |
| `clientToSvgPoint`           | Coordinate transform with mock CTM                                            |
| `buildPreviewShape`          | Correct shape construction from start/end points                              |
| `svgSerializer`              | Shape array to valid SVG string                                               |
| `svgParser`                  | SVG string to Shape array (round-trip fidelity)                               |
| `pushHistory`                | Stack size capped at MAX_HISTORY, future cleared                              |
| Shape factory functions      | Default values applied, ID generated                                          |

```typescript
// Example test
describe('isPointInShape', () => {
  it('detects point inside rectangle', () => {
    const rect: RectangleShape = {
      id: '1',
      type: 'rectangle',
      x: 10,
      y: 10,
      width: 100,
      height: 50,
      fill: '#000',
      fillOpacity: 1,
      stroke: '#000',
      strokeWidth: 1,
      opacity: 1,
      rotation: 0,
    };
    expect(isPointInShape({ x: 50, y: 30 }, rect)).toBe(true);
    expect(isPointInShape({ x: 5, y: 5 }, rect)).toBe(false);
  });
});
```

### Component Testing (React Testing Library + Jest)

**Target: React components render correctly and respond to interactions.**

| Component       | What to test                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Toolbar`       | Renders all tool buttons; clicking sets active tool; active tool visually highlighted                               |
| `PropertyPanel` | Shows correct fields for selected shape type; input changes call `updateShape`; shows placeholder when no selection |
| `ShapeRenderer` | Renders correct SVG element type; applies style props                                                               |
| `SVGCanvas`     | Renders shapes from store; fires events (mock store to verify action calls)                                         |

**Important**: Use `@testing-library/react` for DOM assertions and `@testing-library/user-event` for simulating clicks and inputs. Shapes render as SVG elements, so use `querySelector` for SVG-specific selectors (`rect`, `ellipse`, `line`, `polygon`, `text`).

### Integration Testing

**Target: full workflows end-to-end within the component tree (no browser, still in jsdom).**

| Workflow         | Steps                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Draw a rectangle | Select rect tool, mousedown+move+mouseup on canvas, verify shape in store, verify SVG `<rect>` in DOM |
| Select and move  | Draw shape, switch to select, click shape, drag, verify updated coordinates                           |
| Edit properties  | Draw shape, select it, change stroke color in PropertyPanel, verify shape in store and SVG attribute  |
| Undo/redo        | Draw shape, undo (shape gone), redo (shape back)                                                      |
| Save and load    | Draw shapes, export SVG string, clear canvas, import SVG string, verify shapes restored               |
| Delete           | Draw shape, select it, press Delete key, verify removed from store and DOM                            |

### What to Mock vs Real SVG

**Mock:**

- `SVGSVGElement.getScreenCTM()` - jsdom does not implement this. Provide a mock identity matrix.
- `getBBox()` on SVG elements - needed for text measurement. Return fixed dimensions in tests.
- File download/upload browser APIs (`URL.createObjectURL`, `<a>.click()`).
- `crypto.randomUUID()` - mock for deterministic test IDs.

**Use real:**

- Zustand store (create a fresh store per test).
- React rendering of SVG elements (jsdom parses SVG adequately for attribute checks).
- All hit detection math (pure functions, no mocking needed).
- SVG serialization/parsing logic (string operations, no browser API needed).

---

## 7. Technical Decisions & Tradeoffs

### SVG vs Canvas Rendering

**Decision: SVG**

| Factor               | SVG                                                          | Canvas                                                   |
| -------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| DOM integration      | Each shape is a DOM node; React can manage them naturally    | Single bitmap; React has no visibility into what's drawn |
| Hit detection        | Free via DOM events (though we use math instead for control) | Must implement from scratch                              |
| Styling              | CSS properties, easy theming                                 | Manual pixel manipulation                                |
| Export               | The SVG is already in the DOM; serialize the `<svg>` element | Must reconstruct SVG from internal state                 |
| Performance at scale | Degrades above ~1000-5000 nodes                              | Handles tens of thousands of objects                     |
| Accessibility        | Screen readers can parse SVG structure                       | Opaque canvas                                            |

For our requirement of ~100 shapes, SVG is well within performance limits. The primary advantage is that the rendered output IS the export format, which simplifies save/load significantly.

### State Management: Zustand

**Decision: Zustand**

Rationale documented in Section 3. Key factor: selector-based subscriptions prevent re-rendering the PropertyPanel when shapes move, and prevent re-rendering the Canvas when the tool changes. With 100+ shapes, this granularity matters.

**Tradeoff accepted**: Zustand stores are singletons by default, which makes test isolation require care (create store per test via factory function rather than importing global).

### File Save/Load Approach

**Save (.svg export):**

1. Serialize the `shapes` array into SVG markup string.
2. Wrap in `<svg xmlns="http://www.w3.org/2000/svg" ...>` root element.
3. Create a `Blob`, generate `URL.createObjectURL`, trigger download via hidden `<a>` element.

We do NOT serialize by reading `innerHTML` of the rendered SVG element, because:

- The rendered SVG contains selection overlays, drawing previews, and event handler attributes that should not appear in the export.
- Serializing from state gives us full control over the output format.

**Load (.svg import):**

1. User selects a file via `<input type="file" accept=".svg">`.
2. Read file as text via `FileReader`.
3. Parse with `DOMParser` into an SVG DOM.
4. Walk child elements, map each recognized element (`<rect>`, `<ellipse>`, `<line>`, `<polygon>`, `<text>`) to our `Shape` types.
5. Extract attributes (position, dimensions, style) into shape objects.
6. Call `loadShapes(parsedShapes)` to replace current canvas content.

**Tradeoff accepted**: We only import SVG files that use basic elements. Complex SVGs with `<path>`, `<g>` transforms, `<use>`, `<defs>`, or CSS classes will not be fully supported. This is acceptable for an editor that produces its own files.

### Event Handling: SVG-Level vs Shape-Level

**Decision: SVG-level (single handler on root `<svg>`)**

Attaching event handlers to individual shape elements has problems:

- Overlapping shapes make event targeting unpredictable.
- The drawing preview layer intercepts events during drawing.
- Adding/removing handlers on 100+ elements has overhead.
- Coordinating drag state across shape boundaries is complex.

With SVG-level handling + geometric hit testing, we have deterministic, testable selection logic that works identically regardless of shape overlap or z-order.

**Tradeoff accepted**: We must implement hit testing math ourselves. This is straightforward for our shape set (rect, ellipse, line, polygon, text bounding box) and makes the system more testable since hit detection is a pure function.

### ID Generation

**Decision: `crypto.randomUUID()`**

Provides collision-free IDs without a counter or external library. Available in all modern browsers and Node.js 19+. Mocked in tests for determinism.

### Polygon Drawing UX

**Decision: Click-to-add-vertex, double-click-to-close**

Polygon is the only shape that requires multiple clicks to define. The interaction is:

1. Switch to polygon tool.
2. Each click adds a vertex.
3. Double-click (or click near the first vertex) closes the polygon and commits it.
4. Escape key cancels the in-progress polygon.

The `DrawingState.vertices` array accumulates points during polygon drawing. The preview renders a `<polygon>` with the accumulated points plus the current mouse position as the tentative next vertex.

### Performance Considerations for 100+ Shapes

- **React.memo** on all shape components: prevents re-render when a sibling shape changes.
- **Stable keys**: shape IDs as React keys ensure minimal DOM mutations.
- **Transient updates during drag**: use Zustand's `set` without history push to avoid creating 100+ snapshots per drag operation. Only `commitTransient` pushes one snapshot.
- **Selector granularity**: components subscribe to specific slices of state:
  ```typescript
  const activeTool = useEditorStore((s) => s.activeTool);
  const shapes = useEditorStore((s) => s.shapes);
  const selectedIds = useEditorStore((s) => s.selectedShapeIds);
  ```
  This prevents the toolbar from re-rendering when shapes change.
- **SVG element count**: With 100 shapes + selection overlay + preview, we are well under the ~5000 node threshold where SVG performance degrades in modern browsers.

### Directory Structure

```
src/
├── app/
│   ├── page.tsx              # Main editor page
│   └── layout.tsx            # Next.js layout
├── components/
│   ├── Canvas/
│   │   ├── SVGCanvas.tsx     # Root SVG element + event handling
│   │   ├── ShapeRenderer.tsx # Switch component that delegates to shape components
│   │   ├── SelectionOverlay.tsx
│   │   └── DrawingPreview.tsx
│   ├── Shapes/
│   │   ├── LineShape.tsx
│   │   ├── RectangleShape.tsx
│   │   ├── EllipseShape.tsx
│   │   ├── PolygonShape.tsx
│   │   └── TextShape.tsx
│   ├── Toolbar/
│   │   ├── Toolbar.tsx
│   │   └── ToolButton.tsx
│   ├── PropertyPanel/
│   │   ├── PropertyPanel.tsx
│   │   ├── TransformSection.tsx
│   │   ├── FillSection.tsx
│   │   ├── StrokeSection.tsx
│   │   └── TextSection.tsx
│   └── Header/
│       ├── Header.tsx
│       ├── FileMenu.tsx
│       └── EditMenu.tsx
├── store/
│   ├── editorStore.ts        # Zustand store definition
│   └── historyMiddleware.ts  # Undo/redo logic (if extracted)
├── types/
│   ├── shapes.ts             # Shape type definitions
│   ├── editor.ts             # Editor state types
│   └── events.ts             # Event-related types
├── utils/
│   ├── hitTest.ts            # Geometric hit detection
│   ├── coordinates.ts        # SVG coordinate transforms
│   ├── shapeFactory.ts       # Create shapes with defaults
│   ├── svgSerializer.ts      # Shapes → SVG string
│   ├── svgParser.ts          # SVG file → Shapes
│   └── geometry.ts           # Math helpers (distance, point-in-polygon)
└── __tests__/
    ├── utils/
    │   ├── hitTest.test.ts
    │   ├── svgSerializer.test.ts
    │   ├── svgParser.test.ts
    │   └── geometry.test.ts
    ├── components/
    │   ├── Toolbar.test.tsx
    │   ├── PropertyPanel.test.tsx
    │   └── SVGCanvas.test.tsx
    └── integration/
        ├── drawShape.test.tsx
        ├── selectAndMove.test.tsx
        └── undoRedo.test.tsx
```
