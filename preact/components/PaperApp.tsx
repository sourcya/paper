/** @jsxImportSource preact */
import type { JSX } from "preact";
import { useCallback } from "preact/hooks";
import { Toolbar } from "./Toolbar.tsx";
import { Canvas } from "./Canvas.tsx";
import { usePaperApp } from "../hooks/usePaperApp.ts";

export function PaperApp(): JSX.Element {
  const { state, initializeApp, callbacks } = usePaperApp();

  const handleCanvasReady = useCallback(
    (canvas: HTMLCanvasElement) => {
      initializeApp(canvas);
    },
    [initializeApp]
  );

  return (
    <div class="paper-container">
      <Toolbar
        activeTool={state.activeTool}
        canUndo={state.canUndo}
        canRedo={state.canRedo}
        penActive={state.penActive}
        {...callbacks}
      />
      <Canvas onCanvasReady={handleCanvasReady} />
    </div>
  );
}
