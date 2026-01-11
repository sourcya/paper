/**
 * Canvas component for Paper drawing surface.
 *
 * @module Canvas
 */

/** @jsxImportSource preact */
import type { JSX } from "preact";
import { useRef, useEffect } from "preact/hooks";

/**
 * Props for the Canvas component.
 */
interface CanvasProps {
  /** Callback invoked when the canvas element is ready for use. */
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

/**
 * A canvas component that provides the drawing surface for Paper.
 *
 * @param props - The component props.
 * @returns A canvas element wrapped in a container div.
 *
 * @example
 * ```tsx
 * <Canvas onCanvasReady={(canvas) => initializeApp(canvas)} />
 * ```
 */
export function Canvas({ onCanvasReady }: CanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  return (
    <div class="canvas-container">
      <canvas id="paper-canvas" ref={canvasRef}></canvas>
    </div>
  );
}
