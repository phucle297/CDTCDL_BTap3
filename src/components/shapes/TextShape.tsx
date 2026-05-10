import type { TextShape as TextShapeType } from '@/types';

interface Props {
  shape: TextShapeType;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onMoveStart?: (id: string, e: React.MouseEvent) => void;
  onDoubleClick?: (id: string) => void;
}

export function TextShape({ shape, isSelected, onSelect, onMoveStart, onDoubleClick }: Props) {
  const handleMouseDown = (e: React.MouseEvent) => {
    onSelect?.(shape.id);
    onMoveStart?.(shape.id, e);
  };

  const handleDoubleClick = () => {
    onDoubleClick?.(shape.id);
  };

  const fontSize = shape.fontSize ?? 16;
  const estimatedWidth = shape.content.length * fontSize * 0.6;

  return (
    <g
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={onSelect ? { cursor: 'pointer' } : undefined}
    >
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
      {isSelected && (
        <rect
          data-selection-indicator={shape.id}
          x={shape.x - 2}
          y={shape.y - fontSize - 2}
          width={estimatedWidth + 4}
          height={fontSize + 4}
          stroke="blue"
          strokeDasharray="4"
          fill="none"
          pointerEvents="none"
        />
      )}
    </g>
  );
}
