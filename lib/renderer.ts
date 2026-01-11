/**
 * Canvas rendering module for Paper.
 *
 * Provides functionality for rendering paper elements to an HTML canvas,
 * including strokes, rectangles, text, grids, and preview elements.
 *
 * @module renderer
 */

import type { Paper, Stroke, Rectangle, TextElement, GridSettings, PaperElement } from "./types.ts";

/**
 * Interface for rendering Paper elements to a canvas.
 * Handles all drawing operations including elements, grid, and previews.
 */
export interface Renderer {
  /** Clears the entire canvas. */
  clear: () => void;
  /** Resizes the canvas to match its container, accounting for device pixel ratio. */
  resize: () => void;
  /** Draws a stroke element with pressure-sensitive width. */
  drawStroke: (stroke: Stroke) => void;
  /** Draws a rectangle element. */
  drawRectangle: (rect: Rectangle) => void;
  /** Draws a text element. */
  drawTextElement: (textEl: TextElement) => void;
  /** Draws the background grid. */
  drawGrid: (gridSettings: GridSettings, width: number, height: number) => void;
  /** Draws any paper element (stroke, rectangle, or text). */
  drawElement: (element: PaperElement) => void;
  /** Renders the complete paper including grid and all elements. */
  render: (paper: Paper) => void;
  /** Draws a dashed preview rectangle during rectangle tool usage. */
  drawPreviewRectangle: (x: number, y: number, width: number, height: number, color: string, strokeWidth: number) => void;
  /** Draws a text cursor at the specified position. */
  drawTextCursor: (x: number, y: number, fontSize: number) => void;
  /** Draws the eraser selection rectangle with highlight. */
  drawEraserSelection: (x: number, y: number, width: number, height: number) => void;
  /** Returns the underlying 2D rendering context. */
  getContext: () => CanvasRenderingContext2D;
  /** Exports the canvas content as a PNG data URL. */
  exportToPNG: () => string;
  /** Downloads the canvas content as a PNG file. */
  downloadPNG: (filename?: string) => void;
}

/**
 * Creates a new renderer for drawing to an HTML canvas.
 *
 * @param canvas - The HTML canvas element to render to.
 * @returns A Renderer instance for drawing operations.
 *
 * @example
 * ```ts
 * const canvas = document.getElementById("canvas") as HTMLCanvasElement;
 * const renderer = createRenderer(canvas);
 * renderer.resize();
 * renderer.render(paper);
 * ```
 */
export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const ctx = canvas.getContext("2d")!;

  function clear(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    const dpr = globalThis.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }

  function drawStroke(stroke: Stroke): void {
    if (stroke.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const points = stroke.points;
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const pressure = (p0.pressure + p1.pressure) / 2;
      ctx.lineWidth = stroke.width * pressure;
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
    }
  }

  function drawRectangle(rect: Rectangle): void {
    ctx.strokeStyle = rect.color;
    ctx.lineWidth = rect.strokeWidth;

    if (rect.filled) {
      ctx.fillStyle = rect.color;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    } else {
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  function drawTextElement(textEl: TextElement): void {
    ctx.font = `${textEl.fontSize}px ${textEl.fontFamily}`;
    ctx.fillStyle = textEl.color;
    ctx.textBaseline = "top";
    ctx.fillText(textEl.content, textEl.x, textEl.y);
  }

  function drawGrid(gridSettings: GridSettings, width: number, height: number): void {
    if (gridSettings.type === "none") return;

    ctx.save();
    ctx.strokeStyle = gridSettings.color;
    ctx.globalAlpha = gridSettings.opacity;
    ctx.lineWidth = 1;

    const spacing = gridSettings.spacing;

    if (gridSettings.type === "horizontal" || gridSettings.type === "square") {
      for (let y = spacing; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    if (gridSettings.type === "vertical" || gridSettings.type === "square") {
      for (let x = spacing; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawElement(element: PaperElement): void {
    if ("points" in element) {
      drawStroke(element as Stroke);
    } else if ("width" in element && "height" in element && !("content" in element)) {
      drawRectangle(element as Rectangle);
    } else if ("content" in element) {
      drawTextElement(element as TextElement);
    }
  }

  function render(paper: Paper): void {
    clear();
    const rect = canvas.getBoundingClientRect();
    drawGrid(paper.gridSettings, rect.width, rect.height);
    for (const element of paper.elements) {
      drawElement(element);
    }
  }

  function drawPreviewRectangle(x: number, y: number, width: number, height: number, color: string, strokeWidth: number): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
  }

  function drawTextCursor(x: number, y: number, fontSize: number): void {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + fontSize);
    ctx.stroke();
  }

  function drawEraserSelection(x: number, y: number, width: number, height: number): void {
    ctx.save();
    ctx.strokeStyle = "#d32f2f";
    ctx.fillStyle = "rgba(211, 47, 47, 0.1)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
    ctx.restore();
  }

  function exportToPNG(): string {
    return canvas.toDataURL("image/png");
  }

  function downloadPNG(filename = "paper.png"): void {
    const dataURL = exportToPNG();
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataURL;
    link.click();
  }

  return {
    clear,
    resize,
    drawStroke,
    drawRectangle,
    drawTextElement,
    drawGrid,
    drawElement,
    render,
    drawPreviewRectangle,
    drawTextCursor,
    drawEraserSelection,
    getContext: () => ctx,
    exportToPNG,
    downloadPNG,
  };
}
