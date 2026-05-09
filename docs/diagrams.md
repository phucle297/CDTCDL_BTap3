# SVG Graphic Editor -- Diagrams

All diagrams use Mermaid syntax for GitHub rendering.

---

## 1. Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        U((User))
    end

    subgraph "Shape Management"
        UC1[Create Line]
        UC2[Create Rectangle]
        UC3[Create Circle/Ellipse]
        UC4[Create Polygon]
        UC5[Create Text]
    end

    subgraph "Shape Operations"
        UC6[Select Shape]
        UC7[Move Shape]
        UC8[Edit Shape Properties]
        UC9[Edit Shape Dimensions]
        UC10[Delete Shape]
    end

    subgraph "Property Editing"
        UC11[Set Stroke Color]
        UC12[Set Fill Color]
        UC13[Set Stroke Width]
        UC14[Set Opacity]
    end

    subgraph "File Operations"
        UC15[Save as .svg]
        UC16[Open .svg File]
    end

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8
    U --> UC9
    U --> UC10
    U --> UC11
    U --> UC12
    U --> UC13
    U --> UC14
    U --> UC15
    U --> UC16

    UC8 -.->|includes| UC11
    UC8 -.->|includes| UC12
    UC8 -.->|includes| UC13
    UC8 -.->|includes| UC14
    UC6 -.->|extends| UC7
    UC6 -.->|extends| UC9
    UC6 -.->|extends| UC10
```

---

## 2. Component Architecture Diagram

```mermaid
graph TD
    App[App - Next.js Root]
    App --> Layout[EditorLayout]

    Layout --> Toolbar[Toolbar]
    Layout --> Canvas[Canvas]
    Layout --> PropPanel[PropertyPanel]

    Toolbar --> ToolButton[ToolButton x N]
    Toolbar --> FileActions[FileActions]
    FileActions --> SaveBtn[SaveButton]
    FileActions --> OpenBtn[OpenButton]

    Canvas --> SVGLayer[SVG Render Layer]
    SVGLayer --> LineEl[Line Element]
    SVGLayer --> RectEl[Rect Element]
    SVGLayer --> EllipseEl[Ellipse Element]
    SVGLayer --> PolygonEl[Polygon Element]
    SVGLayer --> TextEl[Text Element]
    Canvas --> SelectionOverlay[Selection Overlay]
    Canvas --> DrawingOverlay[Drawing Overlay]

    PropPanel --> ColorPicker[ColorPicker]
    PropPanel --> StrokeWidthInput[StrokeWidthInput]
    PropPanel --> OpacitySlider[OpacitySlider]
    PropPanel --> DimensionInputs[DimensionInputs]

    subgraph "State Management"
        Store[EditorStore - React Context]
    end

    Store -.->|provides state| Canvas
    Store -.->|provides state| Toolbar
    Store -.->|provides state| PropPanel
    Canvas -.->|dispatches actions| Store
    Toolbar -.->|dispatches actions| Store
    PropPanel -.->|dispatches actions| Store

    style Store fill:#f9f,stroke:#333,stroke-width:2px
    style App fill:#bbf,stroke:#333
    style Layout fill:#ddf,stroke:#333
```

---

## 3. State Flow Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle

    state "Tool States" as ToolStates {
        Idle --> ToolSelected : selectTool(type)
        ToolSelected --> Drawing : mouseDown on canvas
        Drawing --> ShapeCreated : mouseUp
        ShapeCreated --> Idle : shape added to state
    }

    state "Selection States" as SelectStates {
        Idle --> ShapeSelected : click on shape
        ShapeSelected --> Moving : drag start
        Moving --> ShapeSelected : drag end (position updated)
        ShapeSelected --> EditingProps : modify property
        EditingProps --> ShapeSelected : property saved
        ShapeSelected --> Idle : click empty area / Escape
        ShapeSelected --> ShapeDeleted : press Delete
        ShapeDeleted --> Idle : shape removed
    }

    state "File States" as FileStates {
        Idle --> Saving : trigger save
        Saving --> Idle : file downloaded
        Idle --> Loading : trigger open
        Loading --> Idle : shapes populated
    }
```

```mermaid
flowchart LR
    A[User Action] --> B[Event Handler]
    B --> C[Dispatch Action]
    C --> D[Reducer / State Update]
    D --> E[New State]
    E --> F[React Re-render]
    F --> G[Updated UI]
    G --> A

    style D fill:#f9f,stroke:#333,stroke-width:2px
```

---

## 4. Sequence Diagrams

### 4a. Create Shape Flow

```mermaid
sequenceDiagram
    actor User
    participant Toolbar
    participant Store as EditorStore
    participant Canvas
    participant SVGLayer as SVG Layer

    User->>Toolbar: Click shape tool (e.g. Rectangle)
    Toolbar->>Store: dispatch(setActiveTool('rectangle'))
    Store-->>Canvas: activeTool = 'rectangle'
    Canvas-->>Canvas: cursor changes to crosshair

    User->>Canvas: mouseDown at (x1, y1)
    Canvas->>Canvas: Record start point, begin preview

    User->>Canvas: mouseMove to (x2, y2)
    Canvas->>Canvas: Update preview shape dimensions

    User->>Canvas: mouseUp at (x2, y2)
    Canvas->>Store: dispatch(addShape({ type: 'rectangle', x1, y1, x2, y2, defaults }))
    Store->>Store: Generate ID, merge default properties
    Store-->>SVGLayer: shapes[] updated
    SVGLayer->>SVGLayer: Render new <rect> element
    Store-->>Canvas: Clear preview
```

### 4b. Edit Shape Flow

```mermaid
sequenceDiagram
    actor User
    participant Canvas
    participant Store as EditorStore
    participant PropPanel as PropertyPanel

    User->>Canvas: Click on existing shape
    Canvas->>Store: dispatch(selectShape(shapeId))
    Store-->>Canvas: selectedShapeId updated, show handles
    Store-->>PropPanel: Populate with shape properties

    User->>PropPanel: Change fill color to #FF0000
    PropPanel->>Store: dispatch(updateShape(shapeId, { fill: '#FF0000' }))
    Store->>Store: Update shape in shapes[]
    Store-->>Canvas: Re-render shape with new fill
    Store-->>PropPanel: Confirm updated value

    User->>PropPanel: Change stroke width to 3
    PropPanel->>Store: dispatch(updateShape(shapeId, { strokeWidth: 3 }))
    Store-->>Canvas: Re-render shape with new stroke
```

### 4c. Save File Flow

```mermaid
sequenceDiagram
    actor User
    participant FileActions
    participant Store as EditorStore
    participant Serializer as SVG Serializer
    participant Browser

    User->>FileActions: Click "Save"
    FileActions->>Store: getState().shapes
    Store-->>FileActions: shapes[]
    FileActions->>Serializer: serializeToSVG(shapes)
    Serializer->>Serializer: Build SVG XML string
    Note over Serializer: <svg xmlns="..."><br/> <rect .../><br/> <circle .../><br/></svg>
    Serializer-->>FileActions: svgString
    FileActions->>Browser: Create Blob, trigger download
    Browser->>Browser: Save dialog / auto-download
    Browser-->>User: .svg file saved to disk
```

### 4d. Open File Flow

```mermaid
sequenceDiagram
    actor User
    participant FileActions
    participant Browser
    participant Parser as SVG Parser
    participant Store as EditorStore
    participant Canvas

    User->>FileActions: Click "Open"
    FileActions->>Browser: Open file picker (accept=.svg)
    User->>Browser: Select .svg file
    Browser-->>FileActions: File object

    FileActions->>FileActions: Read file as text (FileReader)
    FileActions->>Parser: parseSVG(svgText)
    Parser->>Parser: Parse XML, extract elements
    Parser->>Parser: Map SVG elements to Shape objects
    Note over Parser: <rect> -> { type:'rectangle', ... }<br/><circle> -> { type:'circle', ... }
    Parser-->>FileActions: Shape[]

    FileActions->>Store: dispatch(loadShapes(shapes))
    Store->>Store: Replace shapes[], clear selection
    Store-->>Canvas: Full re-render with loaded shapes
```

---

## 5. Class/Type Diagram

```mermaid
classDiagram
    class BaseShape {
        +string id
        +ShapeType type
        +string stroke
        +string fill
        +number strokeWidth
        +number opacity
        +number x
        +number y
        +number rotation
    }

    class LineShape {
        +number x1
        +number y1
        +number x2
        +number y2
    }

    class RectangleShape {
        +number width
        +number height
        +number rx
        +number ry
    }

    class CircleShape {
        +number rx
        +number ry
    }

    class PolygonShape {
        +Point[] points
    }

    class TextShape {
        +string text
        +string fontFamily
        +number fontSize
        +string fontWeight
        +string textAnchor
    }

    class Point {
        +number x
        +number y
    }

    BaseShape <|-- LineShape
    BaseShape <|-- RectangleShape
    BaseShape <|-- CircleShape
    BaseShape <|-- PolygonShape
    BaseShape <|-- TextShape
    PolygonShape --> Point : points[]

    class EditorState {
        +Shape[] shapes
        +string|null selectedShapeId
        +ToolType activeTool
        +ShapeDefaults defaults
    }

    class ShapeDefaults {
        +string stroke
        +string fill
        +number strokeWidth
        +number opacity
    }

    class EditorAction {
        <<union>>
        addShape
        updateShape
        deleteShape
        selectShape
        setActiveTool
        loadShapes
        clearAll
    }

    EditorState --> BaseShape : shapes[]
    EditorState --> ShapeDefaults

    class ToolType {
        <<enumeration>>
        select
        line
        rectangle
        circle
        polygon
        text
    }

    class ShapeType {
        <<enumeration>>
        line
        rectangle
        circle
        polygon
        text
    }

    EditorState --> ToolType
    BaseShape --> ShapeType
```

---

## 6. UI Wireframe

```
+---------------------------------------------------------------+
|  SVG Graphic Editor                              [Save] [Open] |
+---------------------------------------------------------------+
|       |                                           |            |
|  T    |                                           |  Property  |
|  O    |                                           |  Panel     |
|  O    |                                           |            |
|  L    |            Canvas (SVG)                   | ---------- |
|  B    |                                           | Stroke: __ |
|  A    |        +--------+                         | Fill:   __ |
|  R    |        |  Rect  |    /\                   | Width:  __ |
|       |        |        |   /  \                  | Opacity:__ |
| ----- |        +--------+  /____\                 |            |
| [Sel] |                                    Hello  | ---------- |
| [Lin] |           .---.                           | Position   |
| [Rec] |          /     \                          | X: ___     |
| [Cir] |         (       )                         | Y: ___     |
| [Pol] |          \     /                          | W: ___     |
| [Txt] |           '---'                           | H: ___     |
|       |                                           |            |
+-------+-------------------------------------------+------------+
|  Status: Rectangle Tool selected                               |
+---------------------------------------------------------------+
```

```mermaid
graph TD
    subgraph "Application Window"
        subgraph "Header"
            Title[App Title]
            SaveBtn[Save Button]
            OpenBtn[Open Button]
        end

        subgraph "Main Area"
            direction LR
            subgraph "Left Sidebar - 60px"
                SelectTool[Select]
                LineTool[Line]
                RectTool[Rectangle]
                CircleTool[Circle]
                PolygonTool[Polygon]
                TextTool[Text]
            end

            subgraph "Center - Flex Grow"
                CanvasArea[SVG Canvas<br/>Full remaining width/height]
            end

            subgraph "Right Sidebar - 250px"
                StrokeColor[Stroke Color Picker]
                FillColor[Fill Color Picker]
                StrokeW[Stroke Width Input]
                OpacityS[Opacity Slider]
                Separator[---]
                PosX[X Position]
                PosY[Y Position]
                DimW[Width]
                DimH[Height]
            end
        end

        subgraph "Footer"
            StatusBar[Status / Active Tool Info]
        end
    end
```

---

## 7. CI/CD Pipeline Diagram

```mermaid
flowchart TD
    subgraph "Developer"
        Dev[Push to branch]
    end

    subgraph "GitHub Actions CI"
        Trigger[on: push / pull_request]
        Trigger --> Checkout[Checkout code]
        Checkout --> Setup[Setup Node.js + pnpm]
        Setup --> Install[pnpm install --frozen-lockfile]
        Install --> Parallel

        subgraph Parallel["Parallel Jobs"]
            Lint[pnpm lint]
            TypeCheck[pnpm typecheck]
            Test[pnpm test --coverage]
        end

        Parallel --> Build[pnpm build]
        Build --> Artifacts[Upload coverage report]
    end

    subgraph "Vercel"
        VercelTrigger[Vercel GitHub Integration]
        VercelBuild[Build Next.js]
        VercelDeploy[Deploy]
        Preview[Preview URL for PRs]
        Production[Production for main]
    end

    Dev --> Trigger
    Dev --> VercelTrigger
    VercelTrigger --> VercelBuild
    VercelBuild --> VercelDeploy
    VercelDeploy --> Preview
    VercelDeploy --> Production

    Build --> PRCheck{PR Checks Pass?}
    PRCheck -->|Yes| MergeReady[Ready to merge]
    PRCheck -->|No| FixNeeded[Fix required]

    style Parallel fill:#ffe0b2,stroke:#e65100
    style Production fill:#c8e6c9,stroke:#2e7d32
    style Preview fill:#bbdefb,stroke:#1565c0
```

---

## 8. Development Phase Diagram

```mermaid
gantt
    title Development Phases
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Phase 0 - Docs
    Project overview & diagrams       :done, p0a, 2026-05-09, 1d
    Architecture decisions            :done, p0b, after p0a, 1d

    section Phase 1 - Foundation
    Next.js project scaffold          :p1a, after p0b, 1d
    TypeScript types & interfaces     :p1b, after p0b, 1d
    EditorStore (context + reducer)   :p1c, after p1b, 2d
    CI pipeline (GitHub Actions)      :p1d, after p1a, 1d

    section Phase 2 - Core UI
    Canvas component (SVG render)     :p2a, after p1c, 2d
    Toolbar component                 :p2b, after p1c, 1d
    PropertyPanel component           :p2c, after p1c, 2d
    EditorLayout (compose all)        :p2d, after p2a, 1d

    section Phase 3 - Shape Drawing
    Line tool                         :p3a, after p2d, 1d
    Rectangle tool                    :p3b, after p3a, 1d
    Circle/Ellipse tool               :p3c, after p3b, 1d
    Polygon tool                      :p3d, after p3c, 1d
    Text tool                         :p3e, after p3d, 1d

    section Phase 4 - Interactions
    Shape selection + handles         :p4a, after p3e, 2d
    Shape move (drag)                 :p4b, after p4a, 1d
    Shape resize                      :p4c, after p4b, 1d
    Shape delete                      :p4d, after p4c, 1d
    Property editing (live)           :p4e, after p4a, 2d

    section Phase 5 - File I/O
    SVG serializer (save)             :p5a, after p4e, 1d
    SVG parser (open)                 :p5b, after p5a, 2d
    File download/upload UI           :p5c, after p5b, 1d

    section Phase 6 - Polish
    Keyboard shortcuts                :p6a, after p5c, 1d
    Undo/Redo                         :p6b, after p6a, 2d
    Vercel deployment                 :p6c, after p5c, 1d
    Final testing & fixes             :p6d, after p6b, 2d
```

```mermaid
flowchart TD
    P0[Phase 0: Documentation & Diagrams]
    P1[Phase 1: Foundation & Types]
    P2[Phase 2: Core UI Components]
    P3[Phase 3: Shape Drawing Tools]
    P4[Phase 4: Shape Interactions]
    P5[Phase 5: File I/O]
    P6[Phase 6: Polish & Deploy]

    P0 --> P1
    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> P5
    P5 --> P6

    P1 -.->|types used by| P3
    P1 -.->|store used by| P4
    P2 -.->|canvas used by| P3
    P2 -.->|panel used by| P4

    style P0 fill:#e8f5e9,stroke:#2e7d32
    style P1 fill:#e3f2fd,stroke:#1565c0
    style P2 fill:#fff3e0,stroke:#e65100
    style P3 fill:#fce4ec,stroke:#c62828
    style P4 fill:#f3e5f5,stroke:#6a1b9a
    style P5 fill:#e0f7fa,stroke:#00695c
    style P6 fill:#fff9c4,stroke:#f57f17
```
