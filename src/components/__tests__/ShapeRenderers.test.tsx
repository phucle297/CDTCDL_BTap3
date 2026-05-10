import { render } from '@testing-library/react';
import { RectangleShape } from '../shapes/RectangleShape';
import { EllipseShape } from '../shapes/EllipseShape';
import { LineShape } from '../shapes/LineShape';
import { TextShape } from '../shapes/TextShape';
import type {
  RectShape as RectShapeType,
  EllipseShape as EllipseShapeType,
  LineShape as LineShapeType,
  TextShape as TextShapeType,
} from '@/types';

function renderInSvg(ui: React.ReactElement) {
  return render(<svg>{ui}</svg>);
}

const defaultStyle = { fill: 'none', stroke: '#000000', strokeWidth: 1, opacity: 1 };

describe('RectangleShape', () => {
  const rectData: RectShapeType = {
    id: 'r1',
    type: 'rect',
    x: 10,
    y: 20,
    width: 100,
    height: 50,
    style: defaultStyle,
  };

  it('renders a <rect> with correct attributes', () => {
    const { container } = renderInSvg(<RectangleShape shape={rectData} />);
    const rect = container.querySelector('rect');
    expect(rect).not.toBeNull();
    expect(rect!.getAttribute('x')).toBe('10');
    expect(rect!.getAttribute('y')).toBe('20');
    expect(rect!.getAttribute('width')).toBe('100');
    expect(rect!.getAttribute('height')).toBe('50');
  });

  it('applies style properties', () => {
    const data: RectShapeType = {
      ...rectData,
      style: { fill: '#ff0000', stroke: '#00ff00', strokeWidth: 3, opacity: 0.5 },
    };
    const { container } = renderInSvg(<RectangleShape shape={data} />);
    const rect = container.querySelector('rect');
    expect(rect!.getAttribute('fill')).toBe('#ff0000');
    expect(rect!.getAttribute('stroke')).toBe('#00ff00');
    expect(rect!.getAttribute('stroke-width')).toBe('3');
    expect(rect!.getAttribute('opacity')).toBe('0.5');
  });

  it('sets data-shape-id', () => {
    const { container } = renderInSvg(<RectangleShape shape={rectData} />);
    const rect = container.querySelector('[data-shape-id="r1"]');
    expect(rect).not.toBeNull();
  });
});

describe('EllipseShape', () => {
  const ellipseData: EllipseShapeType = {
    id: 'e1',
    type: 'ellipse',
    cx: 200,
    cy: 150,
    rx: 100,
    ry: 50,
    style: defaultStyle,
  };

  it('renders an <ellipse> with correct attributes', () => {
    const { container } = renderInSvg(<EllipseShape shape={ellipseData} />);
    const el = container.querySelector('ellipse');
    expect(el).not.toBeNull();
    expect(el!.getAttribute('cx')).toBe('200');
    expect(el!.getAttribute('cy')).toBe('150');
    expect(el!.getAttribute('rx')).toBe('100');
    expect(el!.getAttribute('ry')).toBe('50');
  });

  it('applies style properties', () => {
    const data: EllipseShapeType = {
      ...ellipseData,
      style: { fill: '#0000ff', stroke: '#ff0000', strokeWidth: 2, opacity: 0.8 },
    };
    const { container } = renderInSvg(<EllipseShape shape={data} />);
    const el = container.querySelector('ellipse');
    expect(el!.getAttribute('fill')).toBe('#0000ff');
    expect(el!.getAttribute('opacity')).toBe('0.8');
  });

  it('sets data-shape-id', () => {
    const { container } = renderInSvg(<EllipseShape shape={ellipseData} />);
    expect(container.querySelector('[data-shape-id="e1"]')).not.toBeNull();
  });
});

describe('LineShape', () => {
  const lineData: LineShapeType = {
    id: 'l1',
    type: 'line',
    x1: 0,
    y1: 0,
    x2: 200,
    y2: 150,
    style: { stroke: '#000000', strokeWidth: 2, opacity: 1 },
  };

  it('renders a <line> with correct attributes', () => {
    const { container } = renderInSvg(<LineShape shape={lineData} />);
    const el = container.querySelector('line');
    expect(el).not.toBeNull();
    expect(el!.getAttribute('x1')).toBe('0');
    expect(el!.getAttribute('y1')).toBe('0');
    expect(el!.getAttribute('x2')).toBe('200');
    expect(el!.getAttribute('y2')).toBe('150');
  });

  it('applies stroke properties', () => {
    const { container } = renderInSvg(<LineShape shape={lineData} />);
    const el = container.querySelector('line');
    expect(el!.getAttribute('stroke')).toBe('#000000');
    expect(el!.getAttribute('stroke-width')).toBe('2');
  });

  it('sets data-shape-id', () => {
    const { container } = renderInSvg(<LineShape shape={lineData} />);
    expect(container.querySelector('[data-shape-id="l1"]')).not.toBeNull();
  });
});

describe('TextShape', () => {
  const textData: TextShapeType = {
    id: 't1',
    type: 'text',
    x: 50,
    y: 80,
    content: 'Hello World',
    fontSize: 16,
    style: { fill: '#000000', stroke: 'none', strokeWidth: 0, opacity: 1 },
  };

  it('renders a <text> with correct position', () => {
    const { container } = renderInSvg(<TextShape shape={textData} />);
    const el = container.querySelector('text');
    expect(el).not.toBeNull();
    expect(el!.getAttribute('x')).toBe('50');
    expect(el!.getAttribute('y')).toBe('80');
  });

  it('renders text content', () => {
    const { container } = renderInSvg(<TextShape shape={textData} />);
    const el = container.querySelector('text');
    expect(el!.textContent).toBe('Hello World');
  });

  it('applies fontSize', () => {
    const { container } = renderInSvg(<TextShape shape={textData} />);
    const el = container.querySelector('text');
    expect(el!.getAttribute('font-size')).toBe('16');
  });

  it('applies style properties', () => {
    const { container } = renderInSvg(<TextShape shape={textData} />);
    const el = container.querySelector('text');
    expect(el!.getAttribute('fill')).toBe('#000000');
  });

  it('sets data-shape-id', () => {
    const { container } = renderInSvg(<TextShape shape={textData} />);
    expect(container.querySelector('[data-shape-id="t1"]')).not.toBeNull();
  });
});
