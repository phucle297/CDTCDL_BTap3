// SVG Editor core types

export type ShapeType = 'rect' | 'circle' | 'ellipse' | 'line' | 'path' | 'text' | 'group';

export type ToolType =
  | 'select'
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'path'
  | 'text'
  | 'pan'
  | 'zoom';

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ShapeStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface BaseShape {
  id: string;
  type: ShapeType;
  style: ShapeStyle;
  transform?: string;
}

export interface RectShape extends BaseShape {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
}

export interface CircleShape extends BaseShape {
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
}

export interface EllipseShape extends BaseShape {
  type: 'ellipse';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface LineShape extends BaseShape {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TextShape extends BaseShape {
  type: 'text';
  x: number;
  y: number;
  content: string;
  fontSize?: number;
  fontFamily?: string;
}

export type Shape = RectShape | CircleShape | EllipseShape | LineShape | TextShape;

export interface EditorState {
  shapes: Shape[];
  selectedIds: string[];
  activeTool: ToolType;
  zoom: number;
  pan: Point;
}
