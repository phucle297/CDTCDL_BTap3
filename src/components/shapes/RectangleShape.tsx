import type { RectShape as RectShapeType } from '@/types';

interface Props {
  shape: RectShapeType;
}

export function RectangleShape({ shape }: Props) {
  const { id, x, y, width, height, style } = shape;
  return (
    <rect
      data-shape-id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      fill={style.fill}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      opacity={style.opacity}
    />
  );
}
