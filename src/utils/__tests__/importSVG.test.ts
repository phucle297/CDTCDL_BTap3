import { importSVG } from '../importSVG';
import type { RectShape, EllipseShape, LineShape, TextShape } from '@/types';

const mockUUID = jest.fn();
let uuidCounter = 0;
beforeEach(() => {
  uuidCounter = 0;
  mockUUID.mockImplementation(() => `uuid-${++uuidCounter}`);
  jest.spyOn(crypto, 'randomUUID').mockImplementation(mockUUID);
});
afterEach(() => {
  jest.restoreAllMocks();
});

function svgWrap(content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">${content}</svg>`;
}

describe('importSVG', () => {
  it('parses rect element into RectShape', () => {
    const svg = svgWrap(
      '<rect x="10" y="20" width="100" height="50" fill="#ff0000" stroke="#000000" stroke-width="2" opacity="0.8" />'
    );
    const shapes = importSVG(svg);

    expect(shapes).toHaveLength(1);
    const rect = shapes[0] as RectShape;
    expect(rect.type).toBe('rect');
    expect(rect.x).toBe(10);
    expect(rect.y).toBe(20);
    expect(rect.width).toBe(100);
    expect(rect.height).toBe(50);
    expect(rect.style.fill).toBe('#ff0000');
    expect(rect.style.stroke).toBe('#000000');
    expect(rect.style.strokeWidth).toBe(2);
    expect(rect.style.opacity).toBe(0.8);
  });

  it('parses ellipse element into EllipseShape', () => {
    const svg = svgWrap(
      '<ellipse cx="150" cy="100" rx="80" ry="40" fill="#00ff00" stroke="#333333" stroke-width="1" opacity="1" />'
    );
    const shapes = importSVG(svg);

    expect(shapes).toHaveLength(1);
    const ellipse = shapes[0] as EllipseShape;
    expect(ellipse.type).toBe('ellipse');
    expect(ellipse.cx).toBe(150);
    expect(ellipse.cy).toBe(100);
    expect(ellipse.rx).toBe(80);
    expect(ellipse.ry).toBe(40);
    expect(ellipse.style.fill).toBe('#00ff00');
    expect(ellipse.style.stroke).toBe('#333333');
  });

  it('parses line element into LineShape', () => {
    const svg = svgWrap(
      '<line x1="0" y1="0" x2="200" y2="150" stroke="#0000ff" stroke-width="3" />'
    );
    const shapes = importSVG(svg);

    expect(shapes).toHaveLength(1);
    const line = shapes[0] as LineShape;
    expect(line.type).toBe('line');
    expect(line.x1).toBe(0);
    expect(line.y1).toBe(0);
    expect(line.x2).toBe(200);
    expect(line.y2).toBe(150);
    expect(line.style.stroke).toBe('#0000ff');
    expect(line.style.strokeWidth).toBe(3);
  });

  it('parses text element with fontSize and content', () => {
    const svg = svgWrap(
      '<text x="50" y="80" font-size="24" font-family="Arial" fill="#000000">Hello World</text>'
    );
    const shapes = importSVG(svg);

    expect(shapes).toHaveLength(1);
    const text = shapes[0] as TextShape;
    expect(text.type).toBe('text');
    expect(text.x).toBe(50);
    expect(text.y).toBe(80);
    expect(text.content).toBe('Hello World');
    expect(text.fontSize).toBe(24);
    expect(text.fontFamily).toBe('Arial');
    expect(text.style.fill).toBe('#000000');
  });

  it('converts stroke-width to strokeWidth (camelCase mapping)', () => {
    const svg = svgWrap('<rect x="0" y="0" width="50" height="50" stroke-width="5" />');
    const shapes = importSVG(svg);
    expect(shapes[0].style.strokeWidth).toBe(5);
  });

  it('assigns unique crypto.randomUUID to each parsed shape', () => {
    const svg = svgWrap(
      '<rect x="0" y="0" width="10" height="10" /><ellipse cx="50" cy="50" rx="20" ry="10" />'
    );
    const shapes = importSVG(svg);

    expect(shapes).toHaveLength(2);
    expect(shapes[0].id).toBe('uuid-1');
    expect(shapes[1].id).toBe('uuid-2');
    expect(crypto.randomUUID).toHaveBeenCalledTimes(2);
  });

  it('silently skips unrecognized elements', () => {
    const svg = svgWrap(
      '<rect x="0" y="0" width="10" height="10" /><polygon points="0,0 50,50 100,0" /><circle cx="50" cy="50" r="20" />'
    );
    const shapes = importSVG(svg);

    // rect is kept, polygon and circle are skipped (circle not in supported import set per spec)
    // Actually, looking at the types, circle IS a valid shape type.
    // Let me adjust: polygon is skipped, rect and circle may or may not be imported.
    // Per the acceptance criteria, we support: rect, ellipse, line, text
    // So circle and polygon are both skipped.
    expect(shapes).toHaveLength(1);
    expect(shapes[0].type).toBe('rect');
  });

  it('throws descriptive error for malformed XML', () => {
    const badSvg = '<svg><rect x="10" unclosed';
    expect(() => importSVG(badSvg)).toThrow();
  });

  it('returns empty array for SVG with no supported elements', () => {
    const svg = svgWrap('<defs><style>body{}</style></defs>');
    const shapes = importSVG(svg);
    expect(shapes).toHaveLength(0);
  });

  it('handles missing attributes with defaults', () => {
    const svg = svgWrap('<rect />');
    const shapes = importSVG(svg);

    expect(shapes).toHaveLength(1);
    const rect = shapes[0] as RectShape;
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
    expect(rect.width).toBe(0);
    expect(rect.height).toBe(0);
  });

  it('parses multiple shapes of different types', () => {
    const svg = svgWrap(
      '<rect x="0" y="0" width="100" height="100" fill="red" />' +
        '<ellipse cx="200" cy="200" rx="50" ry="30" />' +
        '<line x1="0" y1="0" x2="300" y2="300" stroke="blue" />' +
        '<text x="10" y="10" font-size="16">Test</text>'
    );
    const shapes = importSVG(svg);

    expect(shapes).toHaveLength(4);
    expect(shapes[0].type).toBe('rect');
    expect(shapes[1].type).toBe('ellipse');
    expect(shapes[2].type).toBe('line');
    expect(shapes[3].type).toBe('text');
  });
});
