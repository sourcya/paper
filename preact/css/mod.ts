export const paperCSS = await Deno.readTextFile(
  new URL("./styles.css", import.meta.url)
);
