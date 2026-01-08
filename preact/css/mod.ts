export const paperCSS: string = await Deno.readTextFile(
  new URL("./styles.css", import.meta.url)
);
