import type {
  Paper,
  PaperElement,
  GridSettings,
  Stroke,
  Rect,
  OnChangeCallback,
  SavedPaperInfo,
} from "./types.ts";

export interface StateManager {
  getPaper: () => Paper;
  addElement: (element: PaperElement) => void;
  removeElement: (id: string) => void;
  eraseInRect: (rect: Rect) => void;
  clearElements: () => void;
  setGridSettings: (settings: Partial<GridSettings>) => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  save: () => string;
  load: (id: string) => boolean;
  exportToJSON: () => string;
  importFromJSON: (json: string) => boolean;
  newPaper: (name?: string) => void;
  listSavedPapers: () => SavedPaperInfo[];
  deletePaper: (id: string) => void;
  renamePaper: (id: string, newName: string) => boolean;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function createStateManager(onChange: OnChangeCallback): StateManager {
  let paper: Paper = {
    id: generateId(),
    name: "Untitled",
    elements: [],
    gridSettings: {
      type: "square",
      spacing: 50,
      color: "#cccccc",
      opacity: 0.5,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  let history: PaperElement[][] = [[]];
  let historyIndex = 0;
  const maxHistory = 50;
  let autoSaveTimeout: number | null = null;

  function autoSave(): void {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    autoSaveTimeout = setTimeout(() => {
      save();
    }, 500) as unknown as number;
  }

  function getPaper(): Paper {
    return paper;
  }

  function addElement(element: PaperElement): void {
    paper.elements.push(element);
    paper.updatedAt = Date.now();
    pushHistory();
    onChange(paper);
    autoSave();
  }

  function removeElement(id: string): void {
    paper.elements = paper.elements.filter((el) => el.id !== id);
    paper.updatedAt = Date.now();
    pushHistory();
    onChange(paper);
    autoSave();
  }

  function pointInRect(point: { x: number; y: number }, rect: Rect): boolean {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  function splitStrokeByRect(stroke: Stroke, rect: Rect): { points: Stroke["points"] }[] {
    const segments: { points: Stroke["points"] }[] = [];
    let currentSegment: Stroke["points"] = [];

    for (const point of stroke.points) {
      if (pointInRect(point, rect)) {
        if (currentSegment.length >= 2) {
          segments.push({ points: currentSegment });
        }
        currentSegment = [];
      } else {
        currentSegment.push(point);
      }
    }

    if (currentSegment.length >= 2) {
      segments.push({ points: currentSegment });
    }

    return segments;
  }

  function isFullyInsideRect(bounds: Rect, rect: Rect): boolean {
    return (
      bounds.x >= rect.x &&
      bounds.y >= rect.y &&
      bounds.x + bounds.width <= rect.x + rect.width &&
      bounds.y + bounds.height <= rect.y + rect.height
    );
  }

  function eraseInRect(rect: Rect): void {
    const newElements: PaperElement[] = [];
    let changed = false;

    for (const el of paper.elements) {
      if ("points" in el) {
        const stroke = el as Stroke;
        const segments = splitStrokeByRect(stroke, rect);
        if (segments.length === 0) {
          changed = true;
        } else if (segments.length === 1 && segments[0].points.length === stroke.points.length) {
          newElements.push(el);
        } else {
          changed = true;
          for (const seg of segments) {
            if (seg.points.length >= 2) {
              newElements.push({
                ...stroke,
                id: generateId(),
                points: seg.points,
              });
            }
          }
        }
      } else if ("width" in el && "height" in el && !("content" in el)) {
        const rectEl = el as Rect & { id: string };
        if (isFullyInsideRect(rectEl, rect)) {
          changed = true;
        } else {
          newElements.push(el);
        }
      } else if ("content" in el) {
        const textEl = el as { x: number; y: number; content: string; fontSize: number };
        const textBounds: Rect = {
          x: textEl.x,
          y: textEl.y,
          width: textEl.content.length * textEl.fontSize * 0.6,
          height: textEl.fontSize,
        };
        if (isFullyInsideRect(textBounds, rect)) {
          changed = true;
        } else {
          newElements.push(el);
        }
      } else {
        newElements.push(el);
      }
    }

    if (changed) {
      paper.elements = newElements;
      paper.updatedAt = Date.now();
      pushHistory();
      onChange(paper);
      autoSave();
    }
  }

  function clearElements(): void {
    paper.elements = [];
    paper.updatedAt = Date.now();
    pushHistory();
    onChange(paper);
    autoSave();
  }

  function setGridSettings(settings: Partial<GridSettings>): void {
    paper.gridSettings = { ...paper.gridSettings, ...settings };
    paper.updatedAt = Date.now();
    onChange(paper);
    autoSave();
  }

  function pushHistory(): void {
    history = history.slice(0, historyIndex + 1);
    history.push(paper.elements.map((el) => ({ ...el })));
    if (history.length > maxHistory) {
      history.shift();
    } else {
      historyIndex++;
    }
  }

  function undo(): boolean {
    if (historyIndex > 0) {
      historyIndex--;
      paper.elements = history[historyIndex].map((el) => ({ ...el }));
      paper.updatedAt = Date.now();
      onChange(paper);
      return true;
    }
    return false;
  }

  function redo(): boolean {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      paper.elements = history[historyIndex].map((el) => ({ ...el }));
      paper.updatedAt = Date.now();
      onChange(paper);
      return true;
    }
    return false;
  }

  function canUndo(): boolean {
    return historyIndex > 0;
  }

  function canRedo(): boolean {
    return historyIndex < history.length - 1;
  }

  function save(): string {
    const data = JSON.stringify(paper);
    localStorage.setItem(`paper_${paper.id}`, data);
    return data;
  }

  function load(id: string): boolean {
    const data = localStorage.getItem(`paper_${id}`);
    if (data) {
      paper = JSON.parse(data);
      history = [paper.elements.map((el) => ({ ...el }))];
      historyIndex = 0;
      onChange(paper);
      return true;
    }
    return false;
  }

  function exportToJSON(): string {
    return JSON.stringify(paper, null, 2);
  }

  function importFromJSON(json: string): boolean {
    try {
      const imported = JSON.parse(json);
      paper = imported;
      history = [paper.elements.map((el) => ({ ...el }))];
      historyIndex = 0;
      onChange(paper);
      return true;
    } catch {
      return false;
    }
  }

  function newPaper(name = "Untitled"): void {
    paper = {
      id: generateId(),
      name,
      elements: [],
      gridSettings: {
        type: "none",
        spacing: 20,
        color: "#cccccc",
        opacity: 0.5,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    history = [[]];
    historyIndex = 0;
    onChange(paper);
  }

  function listSavedPapers(): SavedPaperInfo[] {
    const papers: SavedPaperInfo[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("paper_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!);
          papers.push({
            id: data.id,
            name: data.name,
            updatedAt: data.updatedAt,
          });
        } catch {
          // Skip invalid entries
        }
      }
    }
    return papers.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function deletePaper(id: string): void {
    localStorage.removeItem(`paper_${id}`);
  }

  function renamePaper(id: string, newName: string): boolean {
    const data = localStorage.getItem(`paper_${id}`);
    if (data) {
      const parsed = JSON.parse(data);
      parsed.name = newName;
      parsed.updatedAt = Date.now();
      localStorage.setItem(`paper_${id}`, JSON.stringify(parsed));
      if (paper.id === id) {
        paper.name = newName;
        paper.updatedAt = parsed.updatedAt;
        onChange(paper);
      }
      return true;
    }
    return false;
  }

  return {
    getPaper,
    addElement,
    removeElement,
    eraseInRect,
    clearElements,
    setGridSettings,
    undo,
    redo,
    canUndo,
    canRedo,
    save,
    load,
    exportToJSON,
    importFromJSON,
    newPaper,
    listSavedPapers,
    deletePaper,
    renamePaper,
  };
}
