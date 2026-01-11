/**
 * Grid system module for Paper.
 *
 * Provides functionality for managing canvas background grid settings,
 * including grid type, spacing, color, and opacity.
 *
 * @module grid
 */

import type { GridSettings, GridType } from "./types.ts";

/**
 * Interface for managing the canvas background grid.
 * Provides methods for configuring grid appearance and behavior.
 */
export interface GridSystem {
  /** Sets the grid type (none, horizontal, vertical, or square). */
  setType: (type: GridType) => void;
  /** Sets the spacing between grid lines in pixels (1-200). */
  setSpacing: (spacing: number) => void;
  /** Sets the grid line color in CSS color format. */
  setColor: (color: string) => void;
  /** Sets the grid opacity (0-1). */
  setOpacity: (opacity: number) => void;
  /** Returns a copy of the current grid settings. */
  getSettings: () => GridSettings;
  /** Loads grid settings from a partial settings object. */
  loadSettings: (settings: Partial<GridSettings>) => void;
  /** Cycles through grid types and returns the new type. */
  cycleType: () => GridType;
}

/**
 * Creates a new grid system for managing canvas background grid.
 *
 * @returns A GridSystem instance for managing grid settings.
 *
 * @example
 * ```ts
 * const grid = createGridSystem();
 * grid.setType("square");
 * grid.setSpacing(25);
 * const settings = grid.getSettings();
 * ```
 */
export function createGridSystem(): GridSystem {
  let settings: GridSettings = {
    type: "square",
    spacing: 50,
    color: "#cccccc",
    opacity: 0.5,
  };

  function setType(type: GridType): void {
    if (["none", "horizontal", "vertical", "square"].includes(type)) {
      settings.type = type;
    }
  }

  function setSpacing(spacing: number): void {
    if (spacing > 0 && spacing <= 200) {
      settings.spacing = spacing;
    }
  }

  function setColor(color: string): void {
    settings.color = color;
  }

  function setOpacity(opacity: number): void {
    if (opacity >= 0 && opacity <= 1) {
      settings.opacity = opacity;
    }
  }

  function getSettings(): GridSettings {
    return { ...settings };
  }

  function loadSettings(newSettings: Partial<GridSettings>): void {
    settings = { ...settings, ...newSettings };
  }

  function cycleType(): GridType {
    const types: GridType[] = ["none", "horizontal", "vertical", "square"];
    const currentIndex = types.indexOf(settings.type);
    const nextIndex = (currentIndex + 1) % types.length;
    settings.type = types[nextIndex];
    return settings.type;
  }

  return {
    setType,
    setSpacing,
    setColor,
    setOpacity,
    getSettings,
    loadSettings,
    cycleType,
  };
}
