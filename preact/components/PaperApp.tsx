/**
 * Complete Paper drawing application component.
 *
 * @module PaperApp
 */

/** @jsxImportSource preact */
import type { JSX } from "preact";
import { useCallback } from "preact/hooks";
import { Toolbar } from "./Toolbar.tsx";
import { Canvas } from "./Canvas.tsx";
import { usePaperApp } from "../hooks/usePaperApp.ts";

/**
 * A complete Paper drawing application component.
 *
 * Combines the Canvas and Toolbar components with the usePaperApp hook
 * to provide a fully functional drawing application.
 *
 * @returns The complete Paper application UI.
 *
 * @example
 * ```tsx
 * import { PaperApp } from "@sourcya/paper/preact";
 *
 * function App() {
 *   return <PaperApp />;
 * }
 * ```
 */
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
