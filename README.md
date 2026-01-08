# @sourcya/paper

A TypeScript library for building canvas-based drawing applications.

## Installation

```bash
deno add jsr:@sourcya/paper
```

## Usage

```typescript
import {
  createStateManager,
  createRenderer,
  createToolManager,
  createInputHandler,
  createGridSystem,
} from "@sourcya/paper";

// Initialize with a canvas element
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const renderer = createRenderer(canvas);
const input = createInputHandler(canvas);
const grid = createGridSystem();
const state = createStateManager(() => renderer.render(state.getPaper()));

const tools = createToolManager(
  (element) => state.addElement(element),
  (preview) => { /* handle preview */ }
);

// Wire up input events
input.on("strokeStart", (point) => tools.handleStrokeStart(point));
input.on("strokeMove", (point) => tools.handleStrokeMove(point));
input.on("strokeEnd", (point) => tools.handleStrokeEnd(point));

input.attach();
renderer.resize();
```

## Features

- **State Management** - Undo/redo, save/load, import/export
- **Rendering** - Strokes, rectangles, text, grid overlay
- **Tools** - Pen, eraser, rectangle, text
- **Input Handling** - Mouse, touch, pen with palm rejection
- **Grid System** - None, lines, dots with configurable spacing

## License

MIT
