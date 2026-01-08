import type {
  Tool,
  ToolSettings,
  Point,
  Stroke,
  Rectangle,
  TextElement,
  PaperElement,
  EraseAction,
  PreviewType,
  OnElementCompleteCallback,
  OnPreviewUpdateCallback,
  KeyboardEventData,
} from "./types.ts";

export interface ToolManager {
  setTool: (tool: Tool) => void;
  getTool: () => Tool;
  setSettings: (settings: Partial<ToolSettings>) => void;
  getSettings: () => ToolSettings & { currentTool: Tool };
  handleStrokeStart: (point: Point) => void;
  handleStrokeMove: (point: Point) => void;
  handleStrokeEnd: (point: Point) => void;
  handleClick: (position: { x: number; y: number }) => void;
  handleKeyDown: (event: KeyboardEventData) => boolean;
  finishCurrentAction: () => void;
  getActivePreview: () => PreviewType;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function createToolManager(
  onElementComplete: OnElementCompleteCallback,
  onPreviewUpdate: OnPreviewUpdateCallback
): ToolManager {
  let currentTool: Tool = "pen";
  let settings: ToolSettings = {
    penColor: "#000000",
    penWidth: 2,
    eraserWidth: 20,
    fontSize: 16,
    textColor: "#000000",
    fontFamily: "sans-serif",
  };

  let activeStroke: Stroke | null = null;
  let activeRectStart: { x: number; y: number } | null = null;
  let activeTextPosition: { x: number; y: number } | null = null;
  let activeTextContent = "";
  let activeEraserStart: { x: number; y: number } | null = null;

  function setTool(tool: Tool): void {
    if (["pen", "eraser", "rectangle", "text"].includes(tool)) {
      finishCurrentAction();
      currentTool = tool;
    }
  }

  function getTool(): Tool {
    return currentTool;
  }

  function setSettings(newSettings: Partial<ToolSettings>): void {
    settings = { ...settings, ...newSettings };
  }

  function getSettings(): ToolSettings & { currentTool: Tool } {
    return { ...settings, currentTool };
  }

  function finishCurrentAction(): void {
    if (activeTextPosition && activeTextContent) {
      const textElement: TextElement = {
        id: generateId(),
        x: activeTextPosition.x,
        y: activeTextPosition.y,
        content: activeTextContent,
        fontSize: settings.fontSize,
        color: settings.textColor,
        fontFamily: settings.fontFamily,
      };
      onElementComplete(textElement);
    }
    activeStroke = null;
    activeRectStart = null;
    activeTextPosition = null;
    activeTextContent = "";
  }

  function handleStrokeStart(point: Point): void {
    if (currentTool === "pen") {
      activeStroke = {
        id: generateId(),
        points: [point],
        color: settings.penColor,
        width: settings.penWidth,
      };
    } else if (currentTool === "eraser") {
      activeEraserStart = { x: point.x, y: point.y };
    } else if (currentTool === "rectangle") {
      activeRectStart = { x: point.x, y: point.y };
    }
  }

  function handleStrokeMove(point: Point): void {
    if (currentTool === "pen" && activeStroke) {
      activeStroke.points.push(point);
      onPreviewUpdate({ type: "stroke", data: activeStroke });
    } else if (currentTool === "eraser" && activeEraserStart) {
      const preview = {
        x: Math.min(activeEraserStart.x, point.x),
        y: Math.min(activeEraserStart.y, point.y),
        width: Math.abs(point.x - activeEraserStart.x),
        height: Math.abs(point.y - activeEraserStart.y),
      };
      onPreviewUpdate({ type: "eraserSelection", data: preview });
    } else if (currentTool === "rectangle" && activeRectStart) {
      const preview = {
        x: Math.min(activeRectStart.x, point.x),
        y: Math.min(activeRectStart.y, point.y),
        width: Math.abs(point.x - activeRectStart.x),
        height: Math.abs(point.y - activeRectStart.y),
        color: settings.penColor,
        strokeWidth: settings.penWidth,
      };
      onPreviewUpdate({ type: "rectangle", data: preview });
    }
  }

  function handleStrokeEnd(point: Point): void {
    if (currentTool === "pen" && activeStroke) {
      activeStroke.points.push(point);
      onElementComplete(activeStroke);
      activeStroke = null;
    } else if (currentTool === "eraser" && activeEraserStart) {
      const eraserRect = {
        x: Math.min(activeEraserStart.x, point.x),
        y: Math.min(activeEraserStart.y, point.y),
        width: Math.abs(point.x - activeEraserStart.x),
        height: Math.abs(point.y - activeEraserStart.y),
      };
      if (eraserRect.width > 2 && eraserRect.height > 2) {
        const eraseAction: EraseAction = { type: "erase", rect: eraserRect };
        onElementComplete(eraseAction as unknown as PaperElement);
      }
      activeEraserStart = null;
      onPreviewUpdate(null);
    } else if (currentTool === "rectangle" && activeRectStart) {
      const rect: Rectangle = {
        id: generateId(),
        x: Math.min(activeRectStart.x, point.x),
        y: Math.min(activeRectStart.y, point.y),
        width: Math.abs(point.x - activeRectStart.x),
        height: Math.abs(point.y - activeRectStart.y),
        color: settings.penColor,
        strokeWidth: settings.penWidth,
        filled: false,
      };
      if (rect.width > 2 && rect.height > 2) {
        onElementComplete(rect);
      }
      activeRectStart = null;
      onPreviewUpdate(null);
    }
  }

  function handleClick(position: { x: number; y: number }): void {
    if (currentTool === "text") {
      if (activeTextPosition && activeTextContent) {
        const textElement: TextElement = {
          id: generateId(),
          x: activeTextPosition.x,
          y: activeTextPosition.y,
          content: activeTextContent,
          fontSize: settings.fontSize,
          color: settings.textColor,
          fontFamily: settings.fontFamily,
        };
        onElementComplete(textElement);
      }
      activeTextPosition = position;
      activeTextContent = "";
      onPreviewUpdate({ type: "textCursor", data: { ...position, fontSize: settings.fontSize } });
    }
  }

  function handleKeyDown(event: KeyboardEventData): boolean {
    if (currentTool === "text" && activeTextPosition) {
      if (event.key === "Escape") {
        if (activeTextContent) {
          const textElement: TextElement = {
            id: generateId(),
            x: activeTextPosition.x,
            y: activeTextPosition.y,
            content: activeTextContent,
            fontSize: settings.fontSize,
            color: settings.textColor,
            fontFamily: settings.fontFamily,
          };
          onElementComplete(textElement);
        }
        activeTextPosition = null;
        activeTextContent = "";
        onPreviewUpdate(null);
        return true;
      } else if (event.key === "Enter") {
        if (activeTextContent) {
          const textElement: TextElement = {
            id: generateId(),
            x: activeTextPosition.x,
            y: activeTextPosition.y,
            content: activeTextContent,
            fontSize: settings.fontSize,
            color: settings.textColor,
            fontFamily: settings.fontFamily,
          };
          onElementComplete(textElement);
          activeTextPosition = { x: activeTextPosition.x, y: activeTextPosition.y + settings.fontSize + 4 };
          activeTextContent = "";
          onPreviewUpdate({ type: "textCursor", data: { ...activeTextPosition, fontSize: settings.fontSize } });
        }
        return true;
      } else if (event.key === "Backspace") {
        activeTextContent = activeTextContent.slice(0, -1);
        onPreviewUpdate({
          type: "textPreview",
          data: {
            id: "",
            x: activeTextPosition.x,
            y: activeTextPosition.y,
            content: activeTextContent,
            fontSize: settings.fontSize,
            color: settings.textColor,
            fontFamily: settings.fontFamily,
          },
        });
        return true;
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        activeTextContent += event.key;
        onPreviewUpdate({
          type: "textPreview",
          data: {
            id: "",
            x: activeTextPosition.x,
            y: activeTextPosition.y,
            content: activeTextContent,
            fontSize: settings.fontSize,
            color: settings.textColor,
            fontFamily: settings.fontFamily,
          },
        });
        return true;
      }
    }
    return false;
  }

  function getActivePreview(): PreviewType {
    if (activeStroke) {
      return { type: "stroke", data: activeStroke };
    }
    if (activeTextPosition) {
      return {
        type: "textPreview",
        data: {
          id: "",
          x: activeTextPosition.x,
          y: activeTextPosition.y,
          content: activeTextContent,
          fontSize: settings.fontSize,
          color: settings.textColor,
          fontFamily: settings.fontFamily,
        },
      };
    }
    return null;
  }

  return {
    setTool,
    getTool,
    setSettings,
    getSettings,
    handleStrokeStart,
    handleStrokeMove,
    handleStrokeEnd,
    handleClick,
    handleKeyDown,
    finishCurrentAction,
    getActivePreview,
  };
}
