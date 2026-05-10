import type { Shape } from '@/types';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const COLOR_PATTERN =
  /^(#[0-9a-fA-F]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[\d.]+\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)|hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*[\d.]+\s*\)|[a-zA-Z]+)$/;

function sanitizeColor(value: string): string {
  return COLOR_PATTERN.test(value.trim()) ? value.trim() : 'none';
}

function styleAttrs(style: {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}): string {
  const parts: string[] = [];
  if (style.fill !== undefined) parts.push(`fill="${sanitizeColor(style.fill)}"`);
  if (style.stroke !== undefined) parts.push(`stroke="${sanitizeColor(style.stroke)}"`);
  if (style.strokeWidth !== undefined) parts.push(`stroke-width="${style.strokeWidth}"`);
  if (style.opacity !== undefined) parts.push(`opacity="${style.opacity}"`);
  return parts.join(' ');
}

function shapeToSVG(shape: Shape): string {
  const sa = styleAttrs(shape.style);
  const s = sa ? ' ' + sa : '';

  switch (shape.type) {
    case 'rect':
      return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}"${shape.rx !== undefined ? ` rx="${shape.rx}"` : ''}${shape.ry !== undefined ? ` ry="${shape.ry}"` : ''}${s} />`;
    case 'ellipse':
      return `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}"${s} />`;
    case 'line':
      return `<line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}"${s} />`;
    case 'text': {
      const extras: string[] = [];
      if (shape.fontSize !== undefined) extras.push(`font-size="${shape.fontSize}"`);
      if (shape.fontFamily !== undefined) extras.push(`font-family="${shape.fontFamily}"`);
      const e = extras.length ? ' ' + extras.join(' ') : '';
      return `<text x="${shape.x}" y="${shape.y}"${e}${s}>${escapeXml(shape.content)}</text>`;
    }
    default:
      return '';
  }
}

export function exportSVG(shapes: Shape[], width: number, height: number): string {
  const children = shapes.map(shapeToSVG).filter(Boolean);
  if (children.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${children.join('')}</svg>`;
}
