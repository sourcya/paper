/**
 * Paper Core Library - A framework-agnostic canvas drawing library.
 *
 * This module provides the core functionality for creating canvas-based
 * drawing applications with support for pen input, pressure sensitivity,
 * multiple tools, and undo/redo history.
 *
 * @example
 * ```ts
 * import { createStateManager, createRenderer, createToolManager, createInputHandler } from "@sourcya/paper";
 *
 * const canvas = document.getElementById("canvas") as HTMLCanvasElement;
 * const renderer = createRenderer(canvas);
 * const stateManager = createStateManager((paper) => renderer.render(paper));
 * ```
 *
 * @module
 */

// Types
export type {
  Point,
  Stroke,
  Rectangle,
  TextElement,
  PaperElement,
  GridSettings,
  GridType,
  Paper,
  Tool,
  ToolSettings,
  EraseAction,
  Rect,
  PreviewType,
  SavedPaperInfo,
  OnChangeCallback,
  OnElementCompleteCallback,
  OnPreviewUpdateCallback,
  InputEventMap,
  KeyboardEventData,
} from "./types.ts";

// Core modules
export { createStateManager, type StateManager } from "./state.ts";
export { createRenderer, type Renderer } from "./renderer.ts";
export { createToolManager, type ToolManager } from "./tools.ts";
export { createInputHandler, type InputHandler } from "./input.ts";
export { createGridSystem, type GridSystem } from "./grid.ts";
