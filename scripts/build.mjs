#!/usr/bin/env node
import { build } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { rmSync, mkdirSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function entry(name, file) {
  return {
    configFile: false,
    root,
    build: {
      outDir: "dist",
      emptyOutDir: false,
      sourcemap: true,
      target: "es2020",
      minify: false,
      lib: {
        entry: resolve(root, file),
        formats: ["es"],
        fileName: () => `${name}.js`,
      },
      rollupOptions: {
        external: (id) => id.includes("mushroom-weather-station-card-editor"),
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  };
}

rmSync(resolve(root, "dist"), { recursive: true, force: true });
mkdirSync(resolve(root, "dist"), { recursive: true });

await build(entry("mushroom-weather-station-card", "src/card.ts"));
await build(entry("mushroom-weather-station-card-editor", "src/editor.ts"));
console.log("Built dist/mushroom-weather-station-card.js and editor.");
