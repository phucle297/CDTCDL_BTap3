import type { EllipseShape as EllipseShapeType } from '@/types';

interface Props {
  shape: EllipseShapeType;
}

export function EllipseShape({ shape }: Props) {
  const { id, cx, cy, rx, ry, style } = shape;
  return (
    <ellipse
      data-shape-id={id}
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill={style.fill}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      opacity={style.opacity}
    />
  );
}
