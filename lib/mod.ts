// Paper Core Library
// A framework-agnostic canvas drawing library

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
