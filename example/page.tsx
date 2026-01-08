import type { FC } from "hono/jsx";
import { paperCSS } from "@sourcya/paper/preact/css";

export const Page: FC = () => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Paper</title>
        <style dangerouslySetInnerHTML={{ __html: paperCSS }} />
      </head>
      <body>
        <div id="paper-root"></div>
        <script type="module" src="/static/app.js"></script>
      </body>
    </html>
  );
};
