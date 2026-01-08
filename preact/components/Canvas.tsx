/** @jsxImportSource preact */
import type { JSX } from "preact";
import { useRef, useEffect } from "preact/hooks";

interface CanvasProps {
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

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
