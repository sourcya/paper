import { useState, useCallback, useRef } from "preact/hooks";
import {
  createStateManager,
  createRenderer,
  createToolManager,
  createInputHandler,
  createGridSystem,
  type Tool,
  type PreviewType,
  type StateManager,
  type Renderer,
  type ToolManager,
  type InputHandler,
  type GridSystem,
  type SavedPaperInfo,
} from "../../lib/mod.ts";

interface PaperAppState {
  activeTool: Tool;
  canUndo: boolean;
  canRedo: boolean;
  penActive: boolean;
}

interface PaperAppCallbacks {
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;
  onGridToggle: () => void;
  onGridSpacingChange: (spacing: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onNew: () => void;
  onLoad: (id: string) => void;
  onGetSavedPapers: () => SavedPaperInfo[];
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onExport: () => void;
}

interface UsePaperAppReturn {
  state: PaperAppState;
  initializeApp: (canvas: HTMLCanvasElement) => (() => void);
  callbacks: PaperAppCallbacks;
}

export function usePaperApp(): UsePaperAppReturn {
  const [state, setState] = useState<PaperAppState>({
    activeTool: "pen",
    canUndo: false,
    canRedo: false,
    penActive: false,
  });

  const stateManagerRef = useRef<StateManager | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const toolManagerRef = useRef<ToolManager | null>(null);
  const inputHandlerRef = useRef<InputHandler | null>(null);
  const gridRef = useRef<GridSystem | null>(null);
  const previewRef = useRef<PreviewType>(null);

  const render = useCallback(() => {
    if (!stateManagerRef.current || !rendererRef.current) return;

    const paper = stateManagerRef.current.getPaper();
    rendererRef.current.render(paper);

    const preview = previewRef.current;
    if (preview) {
      if (preview.type === "stroke") {
        rendererRef.current.drawStroke(preview.data);
      } else if (preview.type === "rectangle") {
        rendererRef.current.drawPreviewRectangle(
          preview.data.x,
          preview.data.y,
          preview.data.width,
          preview.data.height,
          preview.data.color,
          preview.data.strokeWidth
        );
      } else if (preview.type === "textCursor") {
        rendererRef.current.drawTextCursor(preview.data.x, preview.data.y, preview.data.fontSize);
      } else if (preview.type === "textPreview") {
        rendererRef.current.drawTextElement(preview.data);
        const ctx = rendererRef.current.getContext();
        const textWidth = ctx.measureText(preview.data.content).width;
        rendererRef.current.drawTextCursor(
          preview.data.x + textWidth,
          preview.data.y,
          preview.data.fontSize
        );
      } else if (preview.type === "eraserSelection") {
        rendererRef.current.drawEraserSelection(
          preview.data.x,
          preview.data.y,
          preview.data.width,
          preview.data.height
        );
      }
    }

    setState((prev) => ({
      ...prev,
      canUndo: stateManagerRef.current?.canUndo() ?? false,
      canRedo: stateManagerRef.current?.canRedo() ?? false,
    }));
  }, []);

  const initializeApp = useCallback((canvas: HTMLCanvasElement) => {
    const renderer = createRenderer(canvas);
    const input = createInputHandler(canvas);
    const grid = createGridSystem();

    const stateManager = createStateManager(() => {
      render();
    });

    const tools = createToolManager(
      (element: unknown) => {
        if (element && typeof element === "object" && "type" in element && (element as { type: string }).type === "erase") {
          stateManager.eraseInRect((element as { type: "erase"; rect: { x: number; y: number; width: number; height: number } }).rect);
        } else {
          stateManager.addElement(element as Parameters<typeof stateManager.addElement>[0]);
        }
        previewRef.current = null;
      },
      (previewData) => {
        previewRef.current = previewData;
        render();
      }
    );

    // Store refs
    stateManagerRef.current = stateManager;
    rendererRef.current = renderer;
    toolManagerRef.current = tools;
    inputHandlerRef.current = input;
    gridRef.current = grid;

    // Set up input handlers
    input.on("strokeStart", (point) => tools.handleStrokeStart(point));
    input.on("strokeMove", (point) => tools.handleStrokeMove(point));
    input.on("strokeEnd", (point) => tools.handleStrokeEnd(point));
    input.on("click", (position) => tools.handleClick(position));
    input.on("penButton", (data) => {
      if (data.type === "eraser") {
        tools.setTool("eraser");
        setState((prev) => ({ ...prev, activeTool: "eraser" }));
      } else if (data.type === "pen") {
        tools.setTool("pen");
        setState((prev) => ({ ...prev, activeTool: "pen" }));
      }
    });
    input.on("penActive", (data) => {
      setState((prev) => ({ ...prev, penActive: data.active }));
    });
    input.on("keyDown", (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "z") {
          event.preventDefault();
          stateManager.undo();
          return;
        } else if (event.key === "y") {
          event.preventDefault();
          stateManager.redo();
          return;
        }
      }

      if (!tools.handleKeyDown(event)) {
        if (event.key === "p" || event.key === "P") {
          tools.setTool("pen");
          setState((prev) => ({ ...prev, activeTool: "pen" }));
        } else if (event.key === "e" || event.key === "E") {
          tools.setTool("eraser");
          setState((prev) => ({ ...prev, activeTool: "eraser" }));
        } else if (event.key === "r" || event.key === "R") {
          tools.setTool("rectangle");
          setState((prev) => ({ ...prev, activeTool: "rectangle" }));
        } else if (event.key === "t" || event.key === "T") {
          tools.setTool("text");
          setState((prev) => ({ ...prev, activeTool: "text" }));
        } else if (event.key === "g" || event.key === "G") {
          const newType = grid.cycleType();
          stateManager.setGridSettings({ type: newType });
        }
      }
    });

    // Handle resize
    const handleResize = () => {
      renderer.resize();
      render();
    };

    globalThis.addEventListener("resize", handleResize);

    // Initialize
    input.attach();
    renderer.resize();
    render();

    // Cleanup function
    return () => {
      input.detach();
      globalThis.removeEventListener("resize", handleResize);
    };
  }, [render]);

  // Toolbar callbacks
  const onToolChange = useCallback((tool: Tool) => {
    toolManagerRef.current?.setTool(tool);
    setState((prev) => ({ ...prev, activeTool: tool }));
  }, []);

  const onColorChange = useCallback((color: string) => {
    toolManagerRef.current?.setSettings({ penColor: color, textColor: color });
  }, []);

  const onSizeChange = useCallback((size: string) => {
    const sizeMap: Record<string, { penWidth: number; fontSize: number }> = {
      fine: { penWidth: 1, fontSize: 12 },
      thin: { penWidth: 2, fontSize: 16 },
      medium: { penWidth: 4, fontSize: 20 },
      thick: { penWidth: 8, fontSize: 28 },
      bold: { penWidth: 12, fontSize: 36 },
    };
    const settings = sizeMap[size] || sizeMap.thin;
    toolManagerRef.current?.setSettings(settings);
  }, []);

  const onGridToggle = useCallback(() => {
    if (gridRef.current && stateManagerRef.current) {
      const newType = gridRef.current.cycleType();
      stateManagerRef.current.setGridSettings({ type: newType });
    }
  }, []);

  const onGridSpacingChange = useCallback((spacing: number) => {
    gridRef.current?.setSpacing(spacing);
    stateManagerRef.current?.setGridSettings({ spacing });
  }, []);

  const onUndo = useCallback(() => {
    stateManagerRef.current?.undo();
  }, []);

  const onRedo = useCallback(() => {
    stateManagerRef.current?.redo();
  }, []);

  const onClear = useCallback(() => {
    stateManagerRef.current?.clearElements();
  }, []);

  const onNew = useCallback(() => {
    stateManagerRef.current?.save();
    stateManagerRef.current?.newPaper();
  }, []);

  const onLoad = useCallback((id: string) => {
    stateManagerRef.current?.load(id);
  }, []);

  const onGetSavedPapers = useCallback(() => {
    return stateManagerRef.current?.listSavedPapers() ?? [];
  }, []);

  const onDelete = useCallback((id: string) => {
    stateManagerRef.current?.deletePaper(id);
  }, []);

  const onRename = useCallback((id: string, newName: string) => {
    stateManagerRef.current?.renamePaper(id, newName);
  }, []);

  const onExport = useCallback(() => {
    if (stateManagerRef.current && rendererRef.current) {
      const paper = stateManagerRef.current.getPaper();
      rendererRef.current.downloadPNG(paper.name + ".png");
    }
  }, []);

  return {
    state,
    initializeApp,
    callbacks: {
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
    },
  };
}
