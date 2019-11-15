import React, { FunctionComponent, useCallback } from 'react';
import { useDimensions } from '../common';
import { CanvasProvider } from './CanvasContext';
import { CanvasTransforms } from './CanvasTransforms';

export interface ICanvasProps {
  width: number;
  height: number;
  zoom: number;
  panX: number;
  panY: number;
  allowPanning: boolean;
  isPanning: boolean;
}

export const Canvas: FunctionComponent<ICanvasProps> = ({
  children,
  width,
  height,
  zoom,
  panX,
  panY,
  allowPanning,
  isPanning,
}) => {
  const [ref, dimensions] = useDimensions<SVGSVGElement>();
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <CanvasProvider
      width={width}
      height={height}
      zoom={zoom}
      offsetLeft={dimensions.left}
      offsetTop={dimensions.top}
      panX={panX}
      panY={panY}
    >
      <svg
        onDragOver={handleDragOver}
        ref={ref}
        style={{
          width: '100%',
          height: '100%',
          cursor: allowPanning ? (isPanning ? 'grabbing' : 'grab') : undefined,
          userSelect: allowPanning && isPanning ? 'none' : 'auto',
        }}
      >
        <CanvasTransforms>{children}</CanvasTransforms>
      </svg>
    </CanvasProvider>
  );
};
