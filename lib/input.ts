/**
 * Input handling module for Paper.
 *
 * Provides functionality for capturing and processing pointer, touch, and keyboard
 * events from an HTML canvas. Includes palm rejection for pen input and
 * support for pen button detection (eraser mode).
 *
 * @module input
 */

import type { Point, InputEventMap, KeyboardEventData } from "./types.ts";

/**
 * Callback function type for input event handlers.
 * @typeParam K - The event type key from InputEventMap.
 */
type EventCallback<K extends keyof InputEventMap> = (data: InputEventMap[K]) => void;

/**
 * Interface for handling canvas input events.
 * Provides event subscription and lifecycle management.
 */
export interface InputHandler {
  /** Registers an event listener for the specified event type. */
  on: <K extends keyof InputEventMap>(event: K, callback: EventCallback<K>) => void;
  /** Removes an event listener for the specified event type. */
  off: <K extends keyof InputEventMap>(event: K, callback: EventCallback<K>) => void;
  /** Attaches all event listeners to the canvas and document. */
  attach: () => void;
  /** Detaches all event listeners from the canvas and document. */
  detach: () => void;
  /** Returns whether a drawing operation is currently in progress. */
  isDrawing: () => boolean;
}

/**
 * Creates a new input handler for capturing canvas input events.
 *
 * Handles pointer events (mouse, touch, pen) with palm rejection for pen input,
 * keyboard events, and pen button detection for automatic eraser switching.
 *
 * @param canvas - The HTML canvas element to capture input from.
 * @returns An InputHandler instance for managing input events.
 *
 * @example
 * ```ts
 * const input = createInputHandler(canvas);
 * input.on("strokeStart", (point) => console.log("Started at", point));
 * input.on("strokeMove", (point) => console.log("Moving to", point));
 * input.on("strokeEnd", (point) => console.log("Ended at", point));
 * input.attach();
 * ```
 */
export function createInputHandler(canvas: HTMLCanvasElement): InputHandler {
  const listeners: { [K in keyof InputEventMap]?: EventCallback<K>[] } = {
    strokeStart: [],
    strokeMove: [],
    strokeEnd: [],
    keyDown: [],
    click: [],
    penButton: [],
    penActive: [],
  };

  let isDrawingState = false;
  let activePenId: number | null = null;
  let lastPenTime = 0;
  const PALM_REJECTION_TIMEOUT = 500;

  function getPointerPosition(e: PointerEvent): Point {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    };
  }

  function isPenEraser(e: PointerEvent): boolean {
    if (e.pointerType === "pen") {
      if (e.button === 5 || (e.buttons & 32) !== 0) {
        return true;
      }
    }
    if ((e as PointerEvent & { pointerType: string }).pointerType === "eraser") {
      return true;
    }
    return false;
  }

  function emit<K extends keyof InputEventMap>(event: K, data: InputEventMap[K]): void {
    const callbacks = listeners[event] as EventCallback<K>[] | undefined;
    if (callbacks) {
      for (const callback of callbacks) {
        callback(data);
      }
    }
  }

  function on<K extends keyof InputEventMap>(event: K, callback: EventCallback<K>): void {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    (listeners[event] as EventCallback<K>[]).push(callback);
  }

  function off<K extends keyof InputEventMap>(event: K, callback: EventCallback<K>): void {
    const callbacks = listeners[event] as EventCallback<K>[] | undefined;
    if (!callbacks) return;
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  function handlePointerDown(e: PointerEvent): void {
    e.preventDefault();

    if (e.pointerType === "touch") {
      if (activePenId !== null || Date.now() - lastPenTime < PALM_REJECTION_TIMEOUT) {
        return;
      }
    }

    if (e.pointerType === "pen") {
      if (activePenId === null) {
        emit("penActive", { active: true });
      }
      activePenId = e.pointerId;
      lastPenTime = Date.now();
    }

    if (e.button === 2) {
      emit("penButton", { type: "pen" });
      return;
    }

    if (isPenEraser(e)) {
      emit("penButton", { type: "eraser" });
    }

    isDrawingState = true;
    canvas.setPointerCapture(e.pointerId);
    emit("strokeStart", getPointerPosition(e));
  }

  function handlePointerMove(e: PointerEvent): void {
    if (!isDrawingState) return;

    if (e.pointerType === "touch" && activePenId !== null) {
      return;
    }

    if (e.pointerType === "pen") {
      lastPenTime = Date.now();
    }

    e.preventDefault();
    emit("strokeMove", getPointerPosition(e));
  }

  function handlePointerUp(e: PointerEvent): void {
    if (e.pointerType === "pen" && e.pointerId === activePenId) {
      activePenId = null;
      lastPenTime = Date.now();
      emit("penActive", { active: false });
    }

    if (!isDrawingState) return;

    if (e.pointerType === "touch" && Date.now() - lastPenTime < PALM_REJECTION_TIMEOUT) {
      return;
    }

    e.preventDefault();
    isDrawingState = false;
    canvas.releasePointerCapture(e.pointerId);
    emit("strokeEnd", getPointerPosition(e));
  }

  function handlePointerLeave(e: PointerEvent): void {
    if (!isDrawingState) return;
    isDrawingState = false;
    emit("strokeEnd", getPointerPosition(e));
  }

  function handleKeyDown(e: KeyboardEvent): void {
    const data: KeyboardEventData = {
      key: e.key,
      code: e.code,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
      preventDefault: () => e.preventDefault(),
    };
    emit("keyDown", data);
  }

  function handleClick(e: MouseEvent): void {
    const rect = canvas.getBoundingClientRect();
    emit("click", {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  function handleContextMenu(e: Event): void {
    e.preventDefault();
  }

  function attach(): void {
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
  }

  function detach(): void {
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerup", handlePointerUp);
    canvas.removeEventListener("pointerleave", handlePointerLeave);
    canvas.removeEventListener("click", handleClick);
    canvas.removeEventListener("contextmenu", handleContextMenu);
    document.removeEventListener("keydown", handleKeyDown);
  }

  return {
    on,
    off,
    attach,
    detach,
    isDrawing: () => isDrawingState,
  };
}
