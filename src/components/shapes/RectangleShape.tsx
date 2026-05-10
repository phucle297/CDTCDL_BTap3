import type { RectShape as RectShapeType } from '@/types';

interface Props {
  shape: RectShapeType;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onMoveStart?: (id: string, e: React.MouseEvent) => void;
}

export function RectangleShape({ shape, isSelected, onSelect, onMoveStart }: Props) {
  const { id, x, y, width, height, style } = shape;

  const handleMouseDown = (e: React.MouseEvent) => {
    onSelect?.(id);
    onMoveStart?.(id, e);
  };

  return (
    <g
      onMouseDown={handleMouseDown}
      style={onSelect ? { cursor: 'pointer' } : undefined}
    >
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
      {isSelected && (
        <rect
          data-selection-indicator={id}
          x={x - 2}
          y={y - 2}
          width={width + 4}
          height={height + 4}
          stroke="blue"
          strokeDasharray="4"
          fill="none"
          pointerEvents="none"
        />
      )}
    </g>
  );
}
