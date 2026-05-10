import type { TextShape as TextShapeType } from '@/types';

interface Props {
  shape: TextShapeType;
}

export function TextShape({ shape }: Props) {
  return (
    <text
      data-shape-id={shape.id}
      x={shape.x}
      y={shape.y}
      fontSize={shape.fontSize}
      fill={shape.style.fill}
      stroke={shape.style.stroke}
      strokeWidth={shape.style.strokeWidth}
      opacity={shape.style.opacity}
    >
      {shape.content}
    </text>
  );
}
