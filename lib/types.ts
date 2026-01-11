/**
 * Core type definitions for the Paper drawing library.
 *
 * This module contains all the type definitions used throughout the Paper library,
 * including geometric primitives, drawing elements, tool configurations, and event types.
 *
 * @module types
 */

/**
 * Represents a point in 2D space with pressure sensitivity.
 * Used for tracking pen/touch input with pressure data.
 */
export interface Point {
  /** The x-coordinate of the point. */
  x: number;
  /** The y-coordinate of the point. */
  y: number;
  /** The pressure value (0-1) from pen/touch input. */
  pressure: number;
}

/**
 * Represents a freehand stroke drawn on the canvas.
 * A stroke consists of multiple points with color and width properties.
 */
export interface Stroke {
  /** Unique identifier for the stroke. */
  id: string;
  /** Array of points that make up the stroke path. */
  points: Point[];
  /** The stroke color in CSS color format (e.g., "#000000"). */
  color: string;
  /** The base width of the stroke in pixels. */
  width: number;
}

/**
 * Represents a rectangle element on the canvas.
 * Can be either filled or stroked.
 */
export interface Rectangle {
  /** Unique identifier for the rectangle. */
  id: string;
  /** The x-coordinate of the top-left corner. */
  x: number;
  /** The y-coordinate of the top-left corner. */
  y: number;
  /** The width of the rectangle in pixels. */
  width: number;
  /** The height of the rectangle in pixels. */
  height: number;
  /** The rectangle color in CSS color format. */
  color: string;
  /** The stroke width for unfilled rectangles. */
  strokeWidth: number;
  /** Whether the rectangle should be filled or just stroked. */
  filled: boolean;
}

/**
 * Represents a text element on the canvas.
 */
export interface TextElement {
  /** Unique identifier for the text element. */
  id: string;
  /** The x-coordinate of the text position. */
  x: number;
  /** The y-coordinate of the text position. */
  y: number;
  /** The text content to display. */
  content: string;
  /** The font size in pixels. */
  fontSize: number;
  /** The text color in CSS color format. */
  color: string;
  /** The font family name (e.g., "sans-serif"). */
  fontFamily: string;
}

/**
 * Union type representing any drawable element on the canvas.
 */
export type PaperElement = Stroke | Rectangle | TextElement;

/**
 * Configuration options for the background grid.
 */
export interface GridSettings {
  /** The type of grid to display. */
  type: GridType;
  /** The spacing between grid lines in pixels. */
  spacing: number;
  /** The grid line color in CSS color format. */
  color: string;
  /** The opacity of the grid lines (0-1). */
  opacity: number;
}

/**
 * Available grid types for the canvas background.
 * - `"none"`: No grid displayed
 * - `"horizontal"`: Only horizontal lines
 * - `"vertical"`: Only vertical lines
 * - `"square"`: Both horizontal and vertical lines
 */
export type GridType = "none" | "horizontal" | "vertical" | "square";

/**
 * Represents a complete paper document with all its elements and settings.
 */
export interface Paper {
  /** Unique identifier for the paper. */
  id: string;
  /** The display name of the paper. */
  name: string;
  /** Array of all drawable elements on the paper. */
  elements: PaperElement[];
  /** The grid configuration for this paper. */
  gridSettings: GridSettings;
  /** Unix timestamp when the paper was created. */
  createdAt: number;
  /** Unix timestamp when the paper was last modified. */
  updatedAt: number;
}

/**
 * Available drawing tools.
 * - `"pen"`: Freehand drawing tool with pressure sensitivity
 * - `"eraser"`: Selection-based eraser tool
 * - `"rectangle"`: Rectangle shape tool
 * - `"text"`: Text input tool
 */
export type Tool = "pen" | "eraser" | "rectangle" | "text";

/**
 * Configuration options for drawing tools.
 */
export interface ToolSettings {
  /** The color for the pen tool in CSS color format. */
  penColor: string;
  /** The width of the pen stroke in pixels. */
  penWidth: number;
  /** The width of the eraser selection in pixels. */
  eraserWidth: number;
  /** The font size for the text tool in pixels. */
  fontSize: number;
  /** The color for the text tool in CSS color format. */
  textColor: string;
  /** The font family for the text tool. */
  fontFamily: string;
  /** The currently active tool (optional). */
  currentTool?: Tool;
}

/**
 * Represents an erase action that removes elements within a rectangular area.
 */
export interface EraseAction {
  /** The action type identifier. */
  type: "erase";
  /** The rectangular area to erase. */
  rect: Rect;
}

/**
 * Represents a simple rectangle with position and dimensions.
 */
export interface Rect {
  /** The x-coordinate of the top-left corner. */
  x: number;
  /** The y-coordinate of the top-left corner. */
  y: number;
  /** The width of the rectangle in pixels. */
  width: number;
  /** The height of the rectangle in pixels. */
  height: number;
}

/**
 * Union type representing the current preview state during drawing operations.
 * Used to show visual feedback while the user is actively drawing.
 */
export type PreviewType =
  | { type: "stroke"; data: Stroke }
  | { type: "rectangle"; data: Rect & { color: string; strokeWidth: number } }
  | { type: "textCursor"; data: { x: number; y: number; fontSize: number } }
  | { type: "textPreview"; data: TextElement }
  | { type: "eraserSelection"; data: Rect }
  | null;

/**
 * Summary information about a saved paper document.
 * Used for listing saved papers without loading full content.
 */
export interface SavedPaperInfo {
  /** Unique identifier for the saved paper. */
  id: string;
  /** The display name of the paper. */
  name: string;
  /** Unix timestamp when the paper was last modified. */
  updatedAt: number;
}

/**
 * Callback function invoked when the paper state changes.
 * @param paper - The updated paper document.
 */
export type OnChangeCallback = (paper: Paper) => void;

/**
 * Callback function invoked when a drawing element is completed.
 * @param element - The completed element or erase action.
 */
export type OnElementCompleteCallback = (element: PaperElement | EraseAction) => void;

/**
 * Callback function invoked when the preview state updates during drawing.
 * @param preview - The current preview state or null if no preview.
 */
export type OnPreviewUpdateCallback = (preview: PreviewType) => void;

/**
 * Map of input event types to their data payloads.
 * Used by the {@link InputHandler} for type-safe event handling.
 */
export interface InputEventMap {
  /** Fired when a stroke begins (pointer down). */
  strokeStart: Point;
  /** Fired during stroke movement (pointer move while drawing). */
  strokeMove: Point;
  /** Fired when a stroke ends (pointer up). */
  strokeEnd: Point;
  /** Fired when a keyboard key is pressed. */
  keyDown: KeyboardEventData;
  /** Fired when the canvas is clicked. */
  click: { x: number; y: number };
  /** Fired when a pen button is pressed (eraser or barrel button). */
  penButton: { type: "eraser" | "pen" };
  /** Fired when pen active state changes. */
  penActive: { active: boolean };
}

/**
 * Keyboard event data passed to event handlers.
 * Provides key information and modifier states.
 */
export interface KeyboardEventData {
  /** The key value (e.g., "a", "Enter", "Escape"). */
  key: string;
  /** The physical key code (e.g., "KeyA", "Enter"). */
  code: string;
  /** Whether the Ctrl key was pressed. */
  ctrlKey: boolean;
  /** Whether the Shift key was pressed. */
  shiftKey: boolean;
  /** Whether the Alt key was pressed. */
  altKey: boolean;
  /** Whether the Meta/Command key was pressed. */
  metaKey: boolean;
  /** Function to prevent the default browser action. */
  preventDefault: () => void;
}
