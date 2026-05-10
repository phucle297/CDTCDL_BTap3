import type { LineShape as LineShapeType } from '@/types';

interface Props {
  shape: LineShapeType;
}

export function LineShape({ shape }: Props) {
  return (
    <line
      data-shape-id={shape.id}
      x1={shape.x1}
      y1={shape.y1}
      x2={shape.x2}
      y2={shape.y2}
      stroke={shape.style.stroke}
      strokeWidth={shape.style.strokeWidth}
      opacity={shape.style.opacity}
      fill={shape.style.fill}
    />
  );
}
