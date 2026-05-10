import type { Shape, RectShape, EllipseShape, LineShape, TextShape, ShapeStyle } from '@/types';

const ALLOWED_ELEMENTS = new Set(['rect', 'ellipse', 'circle', 'line', 'text', 'g', 'svg', 'path']);

function stripUnsafeNodes(root: Document): void {
  const all = root.querySelectorAll('*');
  for (const el of all) {
    if (!ALLOWED_ELEMENTS.has(el.tagName.toLowerCase())) {
      el.remove();
      continue;
    }
    const attrs = [...el.attributes];
    for (const a of attrs) {
      if (a.name.toLowerCase().startsWith('on')) {
        el.removeAttribute(a.name);
      }
    }
  }
}

function clampNum(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sanitizeFontFamily(value: string): string {
  return value.replace(/[^a-zA-Z0-9\s,-]/g, '');
}

function parseStyle(el: Element): ShapeStyle {
  const style: ShapeStyle = {};
  const fill = el.getAttribute('fill');
  if (fill !== null) style.fill = fill;
  const stroke = el.getAttribute('stroke');
  if (stroke !== null) style.stroke = stroke;
  const sw = el.getAttribute('stroke-width');
  if (sw !== null) style.strokeWidth = clampNum(parseFloat(sw), 0, 100);
  const op = el.getAttribute('opacity');
  if (op !== null) style.opacity = clampNum(parseFloat(op), 0, 1);
  return style;
}

function attr(el: Element, name: string, fallback = 0): number {
  const v = el.getAttribute(name);
  if (v === null) return fallback;
  const n = parseFloat(v);
  return clampNum(isNaN(n) ? fallback : n, -100000, 100000);
}

export function importSVG(svgString: string): Shape[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error(`Invalid SVG: ${errorNode.textContent}`);
  }

  stripUnsafeNodes(doc);

  const shapes: Shape[] = [];
  const supported = ['rect', 'ellipse', 'line', 'text'] as const;

  for (const tag of supported) {
    const elements = doc.querySelectorAll(tag);
    for (const el of elements) {
      const style = parseStyle(el);
      const id = crypto.randomUUID();

      switch (tag) {
        case 'rect': {
          const shape: RectShape = {
            id,
            type: 'rect',
            x: attr(el, 'x'),
            y: attr(el, 'y'),
            width: attr(el, 'width'),
            height: attr(el, 'height'),
            style,
          };
          const rx = el.getAttribute('rx');
          if (rx !== null) shape.rx = clampNum(parseFloat(rx), -100000, 100000);
          const ry = el.getAttribute('ry');
          if (ry !== null) shape.ry = clampNum(parseFloat(ry), -100000, 100000);
          shapes.push(shape);
          break;
        }
        case 'ellipse': {
          const shape: EllipseShape = {
            id,
            type: 'ellipse',
            cx: attr(el, 'cx'),
            cy: attr(el, 'cy'),
            rx: attr(el, 'rx'),
            ry: attr(el, 'ry'),
            style,
          };
          shapes.push(shape);
          break;
        }
        case 'line': {
          const shape: LineShape = {
            id,
            type: 'line',
            x1: attr(el, 'x1'),
            y1: attr(el, 'y1'),
            x2: attr(el, 'x2'),
            y2: attr(el, 'y2'),
            style,
          };
          shapes.push(shape);
          break;
        }
        case 'text': {
          const shape: TextShape = {
            id,
            type: 'text',
            x: attr(el, 'x'),
            y: attr(el, 'y'),
            content: el.textContent || '',
            style,
          };
          const fontSize = el.getAttribute('font-size');
          if (fontSize !== null) shape.fontSize = clampNum(parseFloat(fontSize), 0, 100000);
          const fontFamily = el.getAttribute('font-family');
          if (fontFamily !== null) shape.fontFamily = sanitizeFontFamily(fontFamily);
          shapes.push(shape);
          break;
        }
      }
    }
  }

  return shapes;
}
