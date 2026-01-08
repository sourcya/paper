import * as esbuild from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";

const isDev = Deno.args.includes("--watch") || Deno.args.includes("-w");

async function build() {
  const configPath = new URL("./deno.json", import.meta.url).pathname;
  
  const ctx = await esbuild.context({
    plugins: [...denoPlugins({ configPath })],
    entryPoints: ["./App.tsx"],
    outfile: "./static/app.js",
    bundle: true,
    format: "esm",
    minify: !isDev,
    sourcemap: isDev ? "inline" : false,
    target: ["es2020"],
    jsx: "automatic",
    jsxImportSource: "preact",
  });

  if (isDev) {
    console.log("👀 Watching for changes...");
    await ctx.watch();
  } else {
    await ctx.rebuild();
    console.log("✅ Build complete: static/app.js");
    await ctx.dispose();
  }
}

build().catch((err) => {
  console.error("❌ Build failed:", err);
  Deno.exit(1);
});
