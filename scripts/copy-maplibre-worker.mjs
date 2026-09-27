import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("node_modules/maplibre-gl/dist");
const destination = resolve("public/maplibre");

mkdirSync(destination, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(resolve(source, file), resolve(destination, file));
}
