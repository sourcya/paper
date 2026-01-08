import type { GridSettings, GridType } from "./types.ts";

export interface GridSystem {
  setType: (type: GridType) => void;
  setSpacing: (spacing: number) => void;
  setColor: (color: string) => void;
  setOpacity: (opacity: number) => void;
  getSettings: () => GridSettings;
  loadSettings: (settings: Partial<GridSettings>) => void;
  cycleType: () => GridType;
}

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
