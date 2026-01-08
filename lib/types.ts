// Core type definitions for Paper

export interface Point {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
}

export interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  filled: boolean;
}

export interface TextElement {
  id: string;
  x: number;
  y: number;
  content: string;
  fontSize: number;
  color: string;
  fontFamily: string;
}

export type PaperElement = Stroke | Rectangle | TextElement;

export interface GridSettings {
  type: GridType;
  spacing: number;
  color: string;
  opacity: number;
}

export type GridType = "none" | "horizontal" | "vertical" | "square";

export interface Paper {
  id: string;
  name: string;
  elements: PaperElement[];
  gridSettings: GridSettings;
  createdAt: number;
  updatedAt: number;
}

export type Tool = "pen" | "eraser" | "rectangle" | "text";

export interface ToolSettings {
  penColor: string;
  penWidth: number;
  eraserWidth: number;
  fontSize: number;
  textColor: string;
  fontFamily: string;
  currentTool?: Tool;
}

export interface EraseAction {
  type: "erase";
  rect: Rect;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PreviewType =
  | { type: "stroke"; data: Stroke }
  | { type: "rectangle"; data: Rect & { color: string; strokeWidth: number } }
  | { type: "textCursor"; data: { x: number; y: number; fontSize: number } }
  | { type: "textPreview"; data: TextElement }
  | { type: "eraserSelection"; data: Rect }
  | null;

export interface SavedPaperInfo {
  id: string;
  name: string;
  updatedAt: number;
}

// Callback types
export type OnChangeCallback = (paper: Paper) => void;
export type OnElementCompleteCallback = (element: PaperElement | EraseAction) => void;
export type OnPreviewUpdateCallback = (preview: PreviewType) => void;

// Event types for input handler
export interface InputEventMap {
  strokeStart: Point;
  strokeMove: Point;
  strokeEnd: Point;
  keyDown: KeyboardEventData;
  click: { x: number; y: number };
  penButton: { type: "eraser" | "pen" };
  penActive: { active: boolean };
}

export interface KeyboardEventData {
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  preventDefault: () => void;
}
