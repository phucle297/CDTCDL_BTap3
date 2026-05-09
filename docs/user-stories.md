# User Stories & Product Requirements — SVG Graphic Editor

## Table of Contents

- [MVP Scope Definition](#mvp-scope-definition)
- [Epic 1: Canvas & Workspace](#epic-1-canvas--workspace)
- [Epic 2: Shape Creation](#epic-2-shape-creation)
- [Epic 3: Shape Editing](#epic-3-shape-editing)
- [Epic 4: Property Editing](#epic-4-property-editing)
- [Epic 5: File Management](#epic-5-file-management)
- [Epic 6: Text Editing](#epic-6-text-editing)
- [Priority & Dependency Map](#priority--dependency-map)
- [Task Breakdown](#task-breakdown)

---

## MVP Scope Definition

### In MVP (Phase 1 — ~2 weeks)

| Area       | Included                                                             |
| ---------- | -------------------------------------------------------------------- |
| Canvas     | Fixed-size canvas with coordinate system; basic zoom (fit-to-screen) |
| Shapes     | Rectangle, Circle/Ellipse, Line                                      |
| Selection  | Single-object click-to-select with visual indicator                  |
| Movement   | Drag-to-move selected object                                         |
| Deletion   | Delete selected object via keyboard or button                        |
| Properties | Stroke color, fill color, stroke width, opacity — editable via panel |
| File: Save | Export current canvas as downloadable `.svg` file                    |
| File: Open | Load and render a `.svg` file onto canvas                            |
| Toolbar    | Shape tool selector, select/move tool, delete action                 |
| Text       | Basic single-line text placement with font size                      |

### Deferred to Future Phases

| Area       | Deferred Feature                                                        |
| ---------- | ----------------------------------------------------------------------- |
| Canvas     | Infinite canvas, pan/scroll, grid/snap, rulers, zoom percentage control |
| Shapes     | Polygon (arbitrary vertex count), freehand drawing, polyline, arc       |
| Selection  | Multi-select (Shift+click, drag-to-select), group/ungroup               |
| Editing    | Resize handles, rotation, copy/paste, undo/redo                         |
| Properties | Gradients, dash patterns, rounded corners, arrowheads                   |
| Text       | Multi-line text, rich formatting, text-on-path                          |
| File       | Auto-save, recent files list, SVG code editor view                      |
| Layers     | Layer panel, z-order control, visibility toggle                         |

---

## Epic 1: Canvas & Workspace

### US-001: View a drawing canvas

**As a** user, **I want to** see a blank drawing canvas when I open the application, **so that** I have a workspace to create SVG graphics.

**Priority:** P0 | **Size:** M | **Dependencies:** None

**Acceptance Criteria:**

- [ ] Application loads and displays a white rectangular canvas area within the browser viewport.
- [ ] Canvas has a visible boundary (border or background contrast) distinguishing it from the surrounding UI.
- [ ] Canvas dimensions default to 800x600 pixels.
- [ ] The canvas renders using an `<svg>` element in the DOM.
- [ ] Canvas is centered in the available workspace area.
- [ ] The area outside the canvas is a neutral gray color to provide contrast.

---

### US-002: See mouse coordinates on canvas

**As a** user, **I want to** see the current mouse position in SVG coordinates, **so that** I can precisely place and size objects.

**Priority:** P1 | **Size:** S | **Dependencies:** US-001

**Acceptance Criteria:**

- [ ] A coordinate display (e.g., `X: 120, Y: 345`) is visible in the status bar or a corner of the workspace.
- [ ] Coordinates update in real time as the mouse moves over the canvas.
- [ ] Coordinates reflect SVG coordinate space (top-left origin), not screen pixels.
- [ ] When the mouse leaves the canvas area, coordinates display `--` or are hidden.

---

### US-003: Zoom to fit canvas

**As a** user, **I want to** zoom the canvas to fit within my browser window, **so that** I can see the entire drawing regardless of my screen size.

**Priority:** P2 | **Size:** S | **Dependencies:** US-001

**Acceptance Criteria:**

- [ ] A "Fit to Screen" button is available in the toolbar or menu.
- [ ] Clicking it scales the canvas so the entire SVG area is visible with padding.
- [ ] Objects on canvas scale proportionally and remain visually correct.
- [ ] The fit-to-screen calculation accounts for toolbar and panel widths.

---

## Epic 2: Shape Creation

### US-010: Select a shape tool from the toolbar

**As a** user, **I want to** select a drawing tool (Rectangle, Ellipse, Line, Text) from a toolbar, **so that** I can choose which shape to create.

**Priority:** P0 | **Size:** M | **Dependencies:** US-001

**Acceptance Criteria:**

- [ ] A vertical or horizontal toolbar is displayed alongside the canvas.
- [ ] Toolbar contains distinct, labeled/icon buttons for: Select, Line, Rectangle, Ellipse, Text.
- [ ] Clicking a tool button visually highlights it as the active tool.
- [ ] Only one tool can be active at a time.
- [ ] The Select tool is active by default on application load.
- [ ] The cursor icon changes to reflect the active tool (crosshair for drawing tools, pointer for select).

---

### US-011: Draw a rectangle

**As a** user, **I want to** draw a rectangle by clicking and dragging on the canvas, **so that** I can add rectangular shapes to my drawing.

**Priority:** P0 | **Size:** M | **Dependencies:** US-010

**Acceptance Criteria:**

- [ ] With the Rectangle tool active, clicking and dragging on the canvas draws a rectangle.
- [ ] The rectangle's top-left corner is at the mousedown point; bottom-right follows the mouse.
- [ ] A preview outline of the rectangle is visible during the drag operation.
- [ ] Releasing the mouse finalizes the rectangle on the canvas.
- [ ] The rectangle is rendered as an SVG `<rect>` element.
- [ ] The rectangle inherits the current default stroke color (black), fill color (none/transparent), and stroke width (1px).
- [ ] Dragging in any direction works (up-left, down-right, etc.) — the rectangle normalizes its position.
- [ ] A rectangle with zero width or zero height (click without drag) is discarded and not added to canvas.
- [ ] After creation, the tool remains active so the user can draw another rectangle immediately.

---

### US-012: Draw a circle/ellipse

**As a** user, **I want to** draw an ellipse by clicking and dragging on the canvas, **so that** I can add circular or elliptical shapes to my drawing.

**Priority:** P0 | **Size:** M | **Dependencies:** US-010

**Acceptance Criteria:**

- [ ] With the Ellipse tool active, clicking and dragging on the canvas draws an ellipse.
- [ ] The ellipse is inscribed within the bounding box defined by the drag (mousedown to mouseup).
- [ ] A preview outline is visible during the drag.
- [ ] Releasing the mouse finalizes the ellipse on the canvas.
- [ ] The ellipse is rendered as an SVG `<ellipse>` element with `cx`, `cy`, `rx`, `ry` attributes.
- [ ] The ellipse inherits the current default stroke/fill/width properties.
- [ ] Dragging in any direction normalizes correctly.
- [ ] A zero-radius ellipse (click without drag) is discarded.

---

### US-013: Draw a line

**As a** user, **I want to** draw a straight line by clicking a start point and dragging to an end point, **so that** I can add lines to my drawing.

**Priority:** P0 | **Size:** M | **Dependencies:** US-010

**Acceptance Criteria:**

- [ ] With the Line tool active, clicking and dragging draws a line from the mousedown point to the current mouse position.
- [ ] A preview of the line is visible during the drag.
- [ ] Releasing the mouse finalizes the line on the canvas.
- [ ] The line is rendered as an SVG `<line>` element with `x1`, `y1`, `x2`, `y2` attributes.
- [ ] The line inherits the current stroke color and stroke width (fill does not apply to lines).
- [ ] A zero-length line (click without drag) is discarded.

---

## Epic 3: Shape Editing

### US-020: Select an object on the canvas

**As a** user, **I want to** click on a shape to select it, **so that** I can edit or delete it.

**Priority:** P0 | **Size:** M | **Dependencies:** US-011

**Acceptance Criteria:**

- [ ] With the Select tool active, clicking on a shape selects it.
- [ ] The selected shape displays a visible selection indicator (e.g., a dashed bounding box with handles at corners/edges).
- [ ] Clicking on empty canvas area deselects the currently selected shape.
- [ ] Clicking on a different shape deselects the previous one and selects the new one.
- [ ] Only one shape can be selected at a time (MVP — no multi-select).
- [ ] Selection works for all shape types: rect, ellipse, line, text.
- [ ] When a shape is selected, the property panel updates to show that shape's current properties.
- [ ] Shapes with no fill (transparent) can be selected by clicking on their stroke/border.

---

### US-021: Move an object by dragging

**As a** user, **I want to** drag a selected shape to reposition it on the canvas, **so that** I can arrange my drawing layout.

**Priority:** P0 | **Size:** M | **Dependencies:** US-020

**Acceptance Criteria:**

- [ ] With a shape selected and the Select tool active, clicking and dragging the shape moves it.
- [ ] The shape follows the mouse position in real time during the drag (no lag or jump).
- [ ] The shape's position in the SVG DOM updates to the new coordinates on mouse release.
- [ ] Moving a rectangle updates its `x` and `y` attributes.
- [ ] Moving an ellipse updates its `cx` and `cy` attributes.
- [ ] Moving a line updates both `x1,y1` and `x2,y2` by the drag delta.
- [ ] Moving a text element updates its `x` and `y` attributes.
- [ ] The shape cannot be dragged outside the canvas boundaries (clamped to canvas edges).
- [ ] The property panel coordinate values update live during the drag.

---

### US-022: Delete an object

**As a** user, **I want to** delete a selected shape, **so that** I can remove unwanted objects from my drawing.

**Priority:** P0 | **Size:** S | **Dependencies:** US-020

**Acceptance Criteria:**

- [ ] With a shape selected, pressing the `Delete` or `Backspace` key removes the shape from the canvas.
- [ ] A delete button is also available in the toolbar or property panel.
- [ ] The SVG element is removed from the DOM.
- [ ] After deletion, no shape is selected and the property panel clears or shows default state.
- [ ] If no shape is selected, pressing Delete does nothing (no error).

---

### US-023: Deselect all objects

**As a** user, **I want to** deselect everything by clicking on empty space or pressing Escape, **so that** I can clear my selection.

**Priority:** P1 | **Size:** S | **Dependencies:** US-020

**Acceptance Criteria:**

- [ ] Clicking on an empty area of the canvas deselects the current selection.
- [ ] Pressing the `Escape` key deselects the current selection.
- [ ] The selection indicator is removed from the previously selected shape.
- [ ] The property panel returns to its default state (showing default/global properties or empty).

---

## Epic 4: Property Editing

### US-030: Edit stroke color of a selected shape

**As a** user, **I want to** change the stroke (outline) color of a selected shape, **so that** I can customize my drawing's appearance.

**Priority:** P0 | **Size:** M | **Dependencies:** US-020

**Acceptance Criteria:**

- [ ] The property panel displays a "Stroke Color" control when a shape is selected.
- [ ] The control shows the current stroke color of the selected shape.
- [ ] Clicking the control opens a color picker (browser native `<input type="color">` is acceptable for MVP).
- [ ] Selecting a new color immediately updates the shape's `stroke` attribute on the canvas.
- [ ] The color picker supports hex color values (e.g., `#FF0000`).
- [ ] If no shape is selected, changing the stroke color sets the default for newly created shapes.
- [ ] A "No Stroke" / "None" option is available to remove the stroke entirely.

---

### US-031: Edit fill color of a selected shape

**As a** user, **I want to** change the fill color of a selected shape, **so that** I can color the interior of shapes.

**Priority:** P0 | **Size:** M | **Dependencies:** US-020

**Acceptance Criteria:**

- [ ] The property panel displays a "Fill Color" control when a shape is selected.
- [ ] The control shows the current fill color of the selected shape.
- [ ] Selecting a new color immediately updates the shape's `fill` attribute.
- [ ] A "No Fill" / "Transparent" option is available (sets `fill="none"`).
- [ ] Fill color applies to rectangles, ellipses, and text. It does not apply to lines (control is disabled/hidden for lines).
- [ ] If no shape is selected, changing fill sets the default for new shapes.

---

### US-032: Edit stroke width of a selected shape

**As a** user, **I want to** change the stroke width of a selected shape, **so that** I can make outlines thicker or thinner.

**Priority:** P0 | **Size:** S | **Dependencies:** US-020

**Acceptance Criteria:**

- [ ] The property panel displays a "Stroke Width" numeric input when a shape is selected.
- [ ] The input shows the current stroke width value.
- [ ] Changing the value immediately updates the shape's `stroke-width` attribute.
- [ ] Valid values are between 0 and 50 (inclusive). Values outside this range are clamped.
- [ ] The input accepts decimal values (e.g., `0.5`, `1.5`).
- [ ] Default stroke width for new shapes is `1`.

---

### US-033: Edit opacity of a selected shape

**As a** user, **I want to** change the opacity of a selected shape, **so that** I can make shapes semi-transparent.

**Priority:** P1 | **Size:** S | **Dependencies:** US-020

**Acceptance Criteria:**

- [ ] The property panel displays an "Opacity" slider or numeric input when a shape is selected.
- [ ] The control shows the current opacity value (0 to 1, or 0% to 100%).
- [ ] Changing the value immediately updates the shape's `opacity` attribute.
- [ ] Valid values are between 0 (fully transparent) and 1 (fully opaque).
- [ ] Default opacity for new shapes is `1` (fully opaque).
- [ ] The shape on canvas visually reflects the opacity change in real time.

---

### US-034: Set default properties for new shapes

**As a** user, **I want to** set stroke color, fill color, stroke width, and opacity defaults before creating shapes, **so that** new shapes inherit my preferred styles.

**Priority:** P1 | **Size:** M | **Dependencies:** US-030, US-031, US-032, US-033

**Acceptance Criteria:**

- [ ] When no shape is selected, the property panel shows "Default Properties" header.
- [ ] Changing any property value (stroke color, fill color, stroke width, opacity) while nothing is selected updates the default for new shapes.
- [ ] Newly created shapes use these default values.
- [ ] Default values persist within the current session (page reload resets them).
- [ ] Initial defaults are: stroke=black (#000000), fill=none, stroke-width=1, opacity=1.

---

## Epic 5: File Management

### US-040: Save drawing as SVG file

**As a** user, **I want to** save my drawing as an `.svg` file, **so that** I can store and share my work.

**Priority:** P0 | **Size:** M | **Dependencies:** US-001, US-011

**Acceptance Criteria:**

- [ ] A "Save" or "Download SVG" button is visible in the toolbar or menu area.
- [ ] Clicking it triggers a browser file download of an `.svg` file.
- [ ] The downloaded file contains valid SVG markup with proper XML namespace (`xmlns="http://www.w3.org/2000/svg"`).
- [ ] All shapes on the canvas are included in the SVG file with their current properties (position, stroke, fill, opacity, etc.).
- [ ] The SVG `viewBox` and `width`/`height` match the canvas dimensions.
- [ ] The downloaded file opens correctly in a web browser and in other SVG editors (Inkscape, Illustrator).
- [ ] An empty canvas produces a valid but empty SVG file (just the root `<svg>` element).
- [ ] The default file name is `drawing.svg`.

---

### US-041: Open an existing SVG file

**As a** user, **I want to** open an existing `.svg` file and see its contents on the canvas, **so that** I can view and edit previously saved drawings.

**Priority:** P0 | **Size:** L | **Dependencies:** US-001

**Acceptance Criteria:**

- [ ] An "Open" or "Load SVG" button is visible in the toolbar or menu area.
- [ ] Clicking it opens a file picker dialog filtered to `.svg` files.
- [ ] After selecting a file, the canvas clears and renders the shapes from the SVG file.
- [ ] Supported SVG elements are rendered: `<rect>`, `<ellipse>`, `<circle>`, `<line>`, `<text>`.
- [ ] Element properties (stroke, fill, stroke-width, opacity, position, dimensions) are preserved.
- [ ] Unsupported SVG elements (e.g., `<path>`, `<polygon>`, `<g>` groups) are silently ignored or rendered as-is but not editable.
- [ ] If the file is not valid SVG, an error message is shown and the current canvas is not modified.
- [ ] The canvas dimensions update to match the loaded SVG's `viewBox` or `width`/`height` if specified.
- [ ] Loading a new file replaces the current canvas content (with no confirmation prompt in MVP).

---

## Epic 6: Text Editing

### US-050: Add text to the canvas

**As a** user, **I want to** place text on the canvas, **so that** I can add labels and annotations to my drawing.

**Priority:** P0 | **Size:** M | **Dependencies:** US-010

**Acceptance Criteria:**

- [ ] With the Text tool active, clicking on the canvas places a text cursor/input at the clicked position.
- [ ] A text input field appears (inline on canvas or as a modal/popup) where the user can type content.
- [ ] Pressing Enter or clicking away finalizes the text and renders it as an SVG `<text>` element.
- [ ] The text element is positioned at the click coordinates (`x`, `y` attributes).
- [ ] Empty text (no characters entered) is discarded and not added to canvas.
- [ ] The text inherits the current default fill color (text color), stroke, and opacity.
- [ ] Default font size is 16px.

---

### US-051: Edit text content

**As a** user, **I want to** double-click on existing text to edit its content, **so that** I can fix typos or update labels.

**Priority:** P1 | **Size:** M | **Dependencies:** US-050, US-020

**Acceptance Criteria:**

- [ ] Double-clicking on a text element with the Select tool activates text editing mode.
- [ ] An editable input appears over/near the text with the current text content pre-filled.
- [ ] The user can modify the text and press Enter or click away to confirm.
- [ ] Pressing Escape cancels the edit and reverts to the original text.
- [ ] The SVG `<text>` element's content updates to the new value.
- [ ] If the user clears all text (empty string), the text element is deleted from the canvas.

---

### US-052: Change font size of text

**As a** user, **I want to** change the font size of a selected text element, **so that** I can control text sizing.

**Priority:** P1 | **Size:** S | **Dependencies:** US-050, US-020

**Acceptance Criteria:**

- [ ] When a text element is selected, the property panel shows a "Font Size" numeric input.
- [ ] The input displays the current font size value (in pixels).
- [ ] Changing the value immediately updates the `font-size` attribute of the text element.
- [ ] Valid values are between 8 and 200. Values outside this range are clamped.
- [ ] The font size input is only visible when a text element is selected (hidden for other shape types).

---

## Priority & Dependency Map

### Priority Legend

| Priority | Meaning                                        | Target       |
| -------- | ---------------------------------------------- | ------------ |
| P0       | Must have — application is unusable without it | MVP Week 1-2 |
| P1       | Should have — important for usability          | MVP Week 2   |
| P2       | Nice to have — enhances experience             | Post-MVP     |
| P3       | Future — planned but not yet scheduled         | Future       |

### Story Priority Summary

| ID     | Story               | Priority | Dependencies                   |
| ------ | ------------------- | -------- | ------------------------------ |
| US-001 | View drawing canvas | P0       | None                           |
| US-002 | Mouse coordinates   | P1       | US-001                         |
| US-003 | Zoom to fit         | P2       | US-001                         |
| US-010 | Select shape tool   | P0       | US-001                         |
| US-011 | Draw rectangle      | P0       | US-010                         |
| US-012 | Draw ellipse        | P0       | US-010                         |
| US-013 | Draw line           | P0       | US-010                         |
| US-020 | Select object       | P0       | US-011                         |
| US-021 | Move object         | P0       | US-020                         |
| US-022 | Delete object       | P0       | US-020                         |
| US-023 | Deselect all        | P1       | US-020                         |
| US-030 | Edit stroke color   | P0       | US-020                         |
| US-031 | Edit fill color     | P0       | US-020                         |
| US-032 | Edit stroke width   | P0       | US-020                         |
| US-033 | Edit opacity        | P1       | US-020                         |
| US-034 | Default properties  | P1       | US-030, US-031, US-032, US-033 |
| US-040 | Save as SVG         | P0       | US-001, US-011                 |
| US-041 | Open SVG file       | P0       | US-001                         |
| US-050 | Add text            | P0       | US-010                         |
| US-051 | Edit text content   | P1       | US-050, US-020                 |
| US-052 | Change font size    | P1       | US-050, US-020                 |

### Dependency Graph

```
US-001 (Canvas)
├── US-002 (Coordinates)
├── US-003 (Zoom to fit)
├── US-010 (Toolbar)
│   ├── US-011 (Rectangle)
│   │   └── US-020 (Select)
│   │       ├── US-021 (Move)
│   │       ├── US-022 (Delete)
│   │       ├── US-023 (Deselect)
│   │       ├── US-030 (Stroke color)
│   │       ├── US-031 (Fill color)
│   │       ├── US-032 (Stroke width)
│   │       ├── US-033 (Opacity)
│   │       ├── US-034 (Default props) ← depends on US-030..033
│   │       ├── US-051 (Edit text) ← also depends on US-050
│   │       └── US-052 (Font size) ← also depends on US-050
│   ├── US-012 (Ellipse)
│   ├── US-013 (Line)
│   └── US-050 (Text)
├── US-040 (Save SVG) ← also depends on US-011
└── US-041 (Open SVG)
```

### Critical Path (P0 implementation order)

```
US-001 → US-010 → US-011 → US-020 → US-021, US-022
                         ↘                ↘
                   US-012, US-013    US-030, US-031, US-032
                         ↘
                       US-050
                         ↘
                   US-040, US-041
```

---

## Task Breakdown

Each user story is broken into development tasks. Sizes: **S** (<2h), **M** (2-4h), **L** (4-8h).

### Epic 1: Canvas & Workspace

#### US-001: View a drawing canvas

| Task   | Size | Description                                                                                                                |
| ------ | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| T-001a | M    | Create Next.js page layout with header, toolbar sidebar, canvas area, and property panel regions using CSS Grid or Flexbox |
| T-001b | M    | Implement SVG canvas component with configurable dimensions (default 800x600), centered in workspace with gray surround    |
| T-001c | S    | Add canvas border styling and responsive centering logic                                                                   |

#### US-002: Mouse coordinates

| Task   | Size | Description                                                                      |
| ------ | ---- | -------------------------------------------------------------------------------- |
| T-002a | S    | Add mousemove event listener on SVG canvas to track coordinates                  |
| T-002b | S    | Create status bar component displaying X/Y coordinates, handle mouse-leave state |

#### US-003: Zoom to fit

| Task   | Size | Description                                                               |
| ------ | ---- | ------------------------------------------------------------------------- |
| T-003a | S    | Implement viewBox calculation to fit canvas within available viewport     |
| T-003b | S    | Add "Fit to Screen" button with click handler to apply calculated viewBox |

### Epic 2: Shape Creation

#### US-010: Toolbar

| Task   | Size | Description                                                                                    |
| ------ | ---- | ---------------------------------------------------------------------------------------------- |
| T-010a | M    | Create toolbar component with tool buttons (Select, Line, Rectangle, Ellipse, Text) with icons |
| T-010b | S    | Implement active tool state management (React context or Zustand store)                        |
| T-010c | S    | Add cursor style changes based on active tool                                                  |

#### US-011: Draw rectangle

| Task   | Size | Description                                                                                       |
| ------ | ---- | ------------------------------------------------------------------------------------------------- |
| T-011a | M    | Implement mousedown/mousemove/mouseup handler for rectangle drawing with coordinate normalization |
| T-011b | S    | Render live preview rectangle during drag (dashed outline)                                        |
| T-011c | S    | Create SVG shape data model/store to hold all shapes with their properties                        |
| T-011d | S    | Add zero-dimension validation to discard click-without-drag                                       |

#### US-012: Draw ellipse

| Task   | Size | Description                                                                                              |
| ------ | ---- | -------------------------------------------------------------------------------------------------------- |
| T-012a | M    | Implement mousedown/mousemove/mouseup handler for ellipse drawing with bounding-box-to-center conversion |
| T-012b | S    | Render live preview ellipse during drag                                                                  |

#### US-013: Draw line

| Task   | Size | Description                                                    |
| ------ | ---- | -------------------------------------------------------------- |
| T-013a | M    | Implement mousedown/mousemove/mouseup handler for line drawing |
| T-013b | S    | Render live preview line during drag                           |

### Epic 3: Shape Editing

#### US-020: Select object

| Task   | Size | Description                                                                                     |
| ------ | ---- | ----------------------------------------------------------------------------------------------- |
| T-020a | M    | Implement click-to-select logic: detect which SVG element was clicked using event target        |
| T-020b | M    | Render selection indicator (dashed bounding box) around the selected shape                      |
| T-020c | S    | Wire selection state to property panel — on select, populate panel with shape's properties      |
| T-020d | S    | Handle click-on-empty to deselect; handle transparent-fill shapes (stroke-only click detection) |

#### US-021: Move object

| Task   | Size | Description                                                                                          |
| ------ | ---- | ---------------------------------------------------------------------------------------------------- |
| T-021a | M    | Implement drag-to-move: track mousedown on selected shape, compute delta, update position attributes |
| T-021b | S    | Handle per-shape-type attribute updates (rect x/y, ellipse cx/cy, line x1/y1/x2/y2, text x/y)        |
| T-021c | S    | Clamp movement to canvas boundaries                                                                  |
| T-021d | S    | Update property panel position values during drag                                                    |

#### US-022: Delete object

| Task   | Size | Description                                                                   |
| ------ | ---- | ----------------------------------------------------------------------------- |
| T-022a | S    | Add keydown listener for Delete/Backspace to remove selected shape from store |
| T-022b | S    | Add delete button in toolbar/property panel                                   |
| T-022c | S    | Clear selection state after deletion                                          |

#### US-023: Deselect all

| Task   | Size | Description                                                                        |
| ------ | ---- | ---------------------------------------------------------------------------------- |
| T-023a | S    | Add Escape key handler to clear selection                                          |
| T-023b | S    | Ensure click-on-empty-canvas also clears selection (may already exist from T-020d) |

### Epic 4: Property Editing

#### US-030: Stroke color

| Task   | Size | Description                                                                          |
| ------ | ---- | ------------------------------------------------------------------------------------ |
| T-030a | M    | Create property panel component with labeled sections                                |
| T-030b | S    | Add stroke color picker using `<input type="color">` with current value display      |
| T-030c | S    | Wire color change to update selected shape's stroke attribute in store and re-render |
| T-030d | S    | Add "No Stroke" toggle button                                                        |

#### US-031: Fill color

| Task   | Size | Description                                                |
| ------ | ---- | ---------------------------------------------------------- |
| T-031a | S    | Add fill color picker with current value display           |
| T-031b | S    | Wire fill change to update selected shape's fill attribute |
| T-031c | S    | Add "No Fill" toggle; disable fill control for line shapes |

#### US-032: Stroke width

| Task   | Size | Description                                                         |
| ------ | ---- | ------------------------------------------------------------------- |
| T-032a | S    | Add stroke width numeric input with min/max validation (0-50)       |
| T-032b | S    | Wire value change to update selected shape's stroke-width attribute |

#### US-033: Opacity

| Task   | Size | Description                                                    |
| ------ | ---- | -------------------------------------------------------------- |
| T-033a | S    | Add opacity slider (range input 0-1) or numeric input          |
| T-033b | S    | Wire value change to update selected shape's opacity attribute |

#### US-034: Default properties

| Task   | Size | Description                                                                                         |
| ------ | ---- | --------------------------------------------------------------------------------------------------- |
| T-034a | M    | Implement default properties state in global store (stroke, fill, width, opacity)                   |
| T-034b | S    | When no shape selected, show "Defaults" header in property panel and bind controls to default state |
| T-034c | S    | Pass default properties to shape creation handlers so new shapes inherit them                       |

### Epic 5: File Management

#### US-040: Save as SVG

| Task   | Size | Description                                                                                     |
| ------ | ---- | ----------------------------------------------------------------------------------------------- |
| T-040a | M    | Implement SVG serialization: iterate shape store, generate SVG markup string with XML namespace |
| T-040b | S    | Create Blob from SVG string and trigger browser download with `drawing.svg` filename            |
| T-040c | S    | Add "Download SVG" button in toolbar/menu                                                       |

#### US-041: Open SVG file

| Task   | Size | Description                                                                                                                                       |
| ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-041a | M    | Add file input (hidden) with "Open SVG" button, filtered to `.svg` files                                                                          |
| T-041b | L    | Implement SVG parser: read file, parse XML, extract supported elements (rect, ellipse, circle, line, text) with their attributes into shape store |
| T-041c | S    | Handle `<circle>` to internal ellipse conversion (`r` to `rx`/`ry`)                                                                               |
| T-041d | S    | Add error handling for invalid SVG files with user-visible error message                                                                          |
| T-041e | S    | Clear current canvas before loading; update canvas dimensions from loaded SVG viewBox/width/height                                                |

### Epic 6: Text Editing

#### US-050: Add text

| Task   | Size | Description                                                                                         |
| ------ | ---- | --------------------------------------------------------------------------------------------------- |
| T-050a | M    | Implement text placement: on canvas click with Text tool, show inline input or modal for text entry |
| T-050b | S    | On confirm (Enter/blur), create `<text>` SVG element at click position with entered content         |
| T-050c | S    | Discard empty text input; apply default fill/stroke/opacity to text                                 |

#### US-051: Edit text content

| Task   | Size | Description                                                                                   |
| ------ | ---- | --------------------------------------------------------------------------------------------- |
| T-051a | M    | Detect double-click on text element; show editable input overlay pre-filled with current text |
| T-051b | S    | On confirm, update text element content; on Escape, cancel edit                               |
| T-051c | S    | If text is cleared to empty, delete the text element                                          |

#### US-052: Font size

| Task   | Size | Description                                                                                     |
| ------ | ---- | ----------------------------------------------------------------------------------------------- |
| T-052a | S    | Add font-size input to property panel, visible only when text element is selected               |
| T-052b | S    | Wire value change to update selected text element's font-size attribute with validation (8-200) |

---

## Implementation Order (Suggested Sprint Plan)

### Week 1: Foundation + Core Drawing

| Day | Tasks                          | Stories Completed    |
| --- | ------------------------------ | -------------------- |
| 1   | T-001a, T-001b, T-001c         | US-001               |
| 2   | T-010a, T-010b, T-010c, T-011c | US-010 (shape store) |
| 3   | T-011a, T-011b, T-011d         | US-011               |
| 4   | T-012a, T-012b, T-013a, T-013b | US-012, US-013       |
| 5   | T-020a, T-020b, T-020c, T-020d | US-020               |

### Week 2: Editing + Properties + Files

| Day | Tasks                                            | Stories Completed                      |
| --- | ------------------------------------------------ | -------------------------------------- |
| 1   | T-021a, T-021b, T-021c, T-021d                   | US-021                                 |
| 2   | T-022a-c, T-030a-d, T-031a-c                     | US-022, US-030, US-031                 |
| 3   | T-032a-b, T-033a-b, T-050a-c                     | US-032, US-033, US-050                 |
| 4   | T-040a-c, T-041a-e                               | US-040, US-041                         |
| 5   | T-002a-b, T-023a-b, T-034a-c, T-051a-c, T-052a-b | US-002, US-023, US-034, US-051, US-052 |

---

## Glossary

| Term                | Definition                                                                       |
| ------------------- | -------------------------------------------------------------------------------- |
| Canvas              | The SVG drawing area where shapes are rendered                                   |
| Shape Store         | In-memory data structure holding all shapes and their properties                 |
| Selection Indicator | Visual bounding box (dashed rectangle) shown around the currently selected shape |
| Property Panel      | Side panel displaying and allowing editing of the selected shape's attributes    |
| Default Properties  | Global property values applied to newly created shapes when no shape is selected |
| viewBox             | SVG attribute defining the coordinate system visible in the canvas               |
