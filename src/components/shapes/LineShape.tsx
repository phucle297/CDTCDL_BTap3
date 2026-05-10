import type { LineShape as LineShapeType } from '@/types';

interface Props {
  shape: LineShapeType;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onMoveStart?: (id: string, e: React.MouseEvent) => void;
}

export function LineShape({ shape, isSelected, onSelect, onMoveStart }: Props) {
  const handleMouseDown = (e: React.MouseEvent) => {
    onSelect?.(shape.id);
    onMoveStart?.(shape.id, e);
  };

  const minX = Math.min(shape.x1, shape.x2);
  const minY = Math.min(shape.y1, shape.y2);
  const maxX = Math.max(shape.x1, shape.x2);
  const maxY = Math.max(shape.y1, shape.y2);

  return (
    <g
      onMouseDown={handleMouseDown}
      style={onSelect ? { cursor: 'pointer' } : undefined}
    >
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
      {isSelected && (
        <rect
          data-selection-indicator={shape.id}
          x={minX - 2}
          y={minY - 2}
          width={maxX - minX + 4}
          height={maxY - minY + 4}
          stroke="blue"
          strokeDasharray="4"
          fill="none"
          pointerEvents="none"
        />
      )}
    </g>
  );
}
