import type { EllipseShape as EllipseShapeType } from '@/types';

interface Props {
  shape: EllipseShapeType;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onMoveStart?: (id: string, e: React.MouseEvent) => void;
}

export function EllipseShape({ shape, isSelected, onSelect, onMoveStart }: Props) {
  const { id, cx, cy, rx, ry, style } = shape;

  const handleMouseDown = (e: React.MouseEvent) => {
    onSelect?.(id);
    onMoveStart?.(id, e);
  };

  return (
    <g
      onMouseDown={handleMouseDown}
      style={onSelect ? { cursor: 'pointer' } : undefined}
    >
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
      {isSelected && (
        <rect
          data-selection-indicator={id}
          x={cx - rx - 2}
          y={cy - ry - 2}
          width={2 * (rx + 2)}
          height={2 * (ry + 2)}
          stroke="blue"
          strokeDasharray="4"
          fill="none"
          pointerEvents="none"
        />
      )}
    </g>
  );
}
