/**
 * CSS styles for Paper components.
 *
 * This module exports the CSS styles needed for Paper UI components.
 * Import and inject these styles into your application.
 *
 * @example
 * ```ts
 * import { paperCSS } from "@sourcya/paper/preact/css";
 *
 * // Inject into document
 * const style = document.createElement("style");
 * style.textContent = paperCSS;
 * document.head.appendChild(style);
 * ```
 *
 * @module css
 */

/**
 * The complete CSS styles for Paper components as a string.
 */
export const paperCSS: string = await Deno.readTextFile(
  new URL("./styles.css", import.meta.url)
);
