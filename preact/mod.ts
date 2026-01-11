/**
 * Preact integration for the Paper drawing library.
 *
 * This module provides Preact components and hooks for building
 * canvas-based drawing applications with the Paper library.
 *
 * @example
 * ```tsx
 * import { PaperApp } from "@sourcya/paper/preact";
 *
 * function App() {
 *   return <PaperApp />;
 * }
 * ```
 *
 * @module
 */

export { usePaperApp } from "./hooks/usePaperApp.ts";
export { Canvas } from "./components/Canvas.tsx";
export { Toolbar } from "./components/Toolbar.tsx";
export { PaperApp } from "./components/PaperApp.tsx";
export * from "./icons/index.tsx";
