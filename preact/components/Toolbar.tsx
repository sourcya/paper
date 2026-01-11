/**
 * Toolbar component for Paper drawing tools.
 *
 * @module Toolbar
 */

/** @jsxImportSource preact */
import type { JSX } from "preact";
import type { Tool, SavedPaperInfo } from "../../lib/mod.ts";
import { useState, useRef, useEffect } from "preact/hooks";
import {
  PenIcon,
  EraserIcon,
  RectangleIcon,
  TextIcon,
  GridIcon,
  UndoIcon,
  RedoIcon,
  TrashIcon,
  NewIcon,
  FolderIcon,
  DownloadIcon,
  RenameIcon,
  SmallTrashIcon,
  LogoIcon,
} from "../icons/index.tsx";

/**
 * Props for the Toolbar component.
 */
interface ToolbarProps {
  /** The currently active drawing tool. */
  activeTool: Tool;
  /** Callback when tool selection changes. */
  onToolChange: (tool: Tool) => void;
  /** Callback when color changes. */
  onColorChange: (color: string) => void;
  /** Callback when size changes. */
  onSizeChange: (size: string) => void;
  /** Callback to toggle grid type. */
  onGridToggle: () => void;
  /** Callback when grid spacing changes. */
  onGridSpacingChange: (spacing: number) => void;
  /** Callback to undo last action. */
  onUndo: () => void;
  /** Callback to redo last undone action. */
  onRedo: () => void;
  /** Callback to clear all elements. */
  onClear: () => void;
  /** Callback to create a new paper. */
  onNew: () => void;
  /** Callback to load a saved paper. */
  onLoad: (id: string) => void;
  /** Callback to get list of saved papers. */
  onGetSavedPapers: () => SavedPaperInfo[];
  /** Callback to delete a saved paper. */
  onDelete: (id: string) => void;
  /** Callback to rename a saved paper. */
  onRename: (id: string, newName: string) => void;
  /** Callback to export canvas as PNG. */
  onExport: () => void;
  /** Whether undo is available. */
  canUndo: boolean;
  /** Whether redo is available. */
  canRedo: boolean;
  /** Whether a pen input device is active. */
  penActive: boolean;
}

/**
 * A toolbar component providing drawing tools and controls for Paper.
 *
 * Includes tool selection, color picker, size selector, grid controls,
 * undo/redo, and file management options.
 *
 * @param props - The component props.
 * @returns The toolbar UI element.
 */
export function Toolbar(props: ToolbarProps): JSX.Element {
  const {
    activeTool,
    onToolChange,
    onColorChange,
    onSizeChange,
    onGridToggle,
    onGridSpacingChange,
    onUndo,
    onRedo,
    onClear,
    onNew,
    onLoad,
    onGetSavedPapers,
    onDelete,
    onRename,
    onExport,
    canUndo,
    canRedo,
    penActive,
  } = props;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [papers, setPapers] = useState<SavedPaperInfo[]>([]);
  const [gridSpacing, setGridSpacing] = useState(50);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLoadClick = () => {
    setPapers(onGetSavedPapers());
    setDropdownOpen(!dropdownOpen);
  };

  const handleRename = (e: MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    const newName = prompt("Enter new name:", currentName);
    if (newName && newName.trim()) {
      onRename(id, newName.trim());
      setPapers(onGetSavedPapers());
    }
  };

  const handleDelete = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this paper?")) {
      onDelete(id);
      setPapers(onGetSavedPapers());
    }
  };

  const handleClear = () => {
    if (confirm("Clear all content?")) {
      onClear();
    }
  };

  const tools: { tool: Tool; icon: () => preact.JSX.Element; title: string }[] = [
    { tool: "pen", icon: PenIcon, title: "Pen (P)" },
    { tool: "eraser", icon: EraserIcon, title: "Eraser (E)" },
    { tool: "rectangle", icon: RectangleIcon, title: "Rectangle (R)" },
    { tool: "text", icon: TextIcon, title: "Text (T)" },
  ];

  return (
    <div class="paper-toolbar">
      <div class="toolbar-group">
        {tools.map(({ tool, icon: Icon, title }) => (
          <button
            type="button"
            key={tool}
            data-tool={tool}
            class={`tool-btn ${activeTool === tool ? "active" : ""}`}
            title={title}
            onClick={() => onToolChange(tool)}
          >
            <Icon />
          </button>
        ))}
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-group">
        <input
          type="color"
          id="pen-color"
          defaultValue="#000000"
          title="Color"
          onInput={(e) => onColorChange((e.target as HTMLInputElement).value)}
        />
        <select
          id="size-select"
          title="Size"
          defaultValue="thin"
          onChange={(e) => onSizeChange((e.target as HTMLSelectElement).value)}
        >
          <option value="fine">Fine</option>
          <option value="thin">Thin</option>
          <option value="medium">Medium</option>
          <option value="thick">Thick</option>
          <option value="bold">Bold</option>
        </select>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-group">
        <button type="button" id="grid-toggle" class="tool-btn" title="Toggle Grid (G)" onClick={onGridToggle}>
          <GridIcon />
        </button>
        <input
          type="range"
          id="grid-spacing"
          min="10"
          max="100"
          value={gridSpacing}
          title="Grid Spacing"
          onInput={(e) => {
            const value = parseInt((e.target as HTMLInputElement).value);
            setGridSpacing(value);
            onGridSpacingChange(value);
          }}
        />
        <span id="grid-spacing-value">{gridSpacing}</span>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-group">
        <button type="button" id="undo-btn" class="tool-btn" title="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}>
          <UndoIcon />
        </button>
        <button type="button" id="redo-btn" class="tool-btn" title="Redo (Ctrl+Y)" onClick={onRedo} disabled={!canRedo}>
          <RedoIcon />
        </button>
        <button type="button" id="clear-btn" class="tool-btn" title="Clear All" onClick={handleClear}>
          <TrashIcon />
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-group">
        <button type="button" id="new-btn" class="tool-btn" title="New Paper" onClick={onNew}>
          <NewIcon />
        </button>
        <div class="load-dropdown" ref={dropdownRef}>
          <button type="button" id="load-btn" class="tool-btn" title="Load Paper" onClick={handleLoadClick}>
            <FolderIcon />
          </button>
          <div id="load-dropdown-menu" class={`dropdown-menu ${dropdownOpen ? "" : "hidden"}`}>
            {papers.length === 0 ? (
              <div class="dropdown-item disabled">No saved papers</div>
            ) : (
              papers.map((p) => (
                <div
                  key={p.id}
                  class="dropdown-item"
                  onClick={() => {
                    onLoad(p.id);
                    setDropdownOpen(false);
                  }}
                >
                  <span class="paper-name">{p.name}</span>
                  <span class="paper-date">{new Date(p.updatedAt).toLocaleDateString()}</span>
                  <div class="paper-actions">
                    <button type="button"
                      class="paper-action-btn"
                      title="Rename"
                      onClick={(e) => handleRename(e, p.id, p.name)}
                    >
                      <RenameIcon />
                    </button>
                    <button type="button"
                      class="paper-action-btn delete"
                      title="Delete"
                      onClick={(e) => handleDelete(e, p.id)}
                    >
                      <SmallTrashIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <button type="button" id="export-btn" class="tool-btn" title="Export to PNG" onClick={onExport}>
          <DownloadIcon />
        </button>
      </div>

      <div class="toolbar-spacer"></div>

      <div id="pen-indicator" class={`pen-indicator ${penActive ? "" : "hidden"}`}>
        <PenIcon />
      </div>

      <div class="toolbar-logo">
        <LogoIcon />
        <span class="toolbar-logo-text">Paper</span>
      </div>
    </div>
  );
}
