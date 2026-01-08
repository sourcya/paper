/** @jsxImportSource preact */
import { render } from "preact";
import { PaperApp } from "@sourcya/paper/preact";

// Mount the app
const root = document.getElementById("paper-root");
if (root) {
  render(<PaperApp />, root);
}
