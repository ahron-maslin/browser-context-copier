import { build } from "vite";
import { cp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import url from "node:url";

const root = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const target = process.env.TARGET;

if (target !== "chrome" && target !== "firefox") {
  throw new Error("Set TARGET=chrome or TARGET=firefox before running this script.");
}

const outDir = path.join(root, "dist", target);
const define = { __TARGET__: JSON.stringify(target) };
const resolve = {
  alias: {
    "@shared": path.join(root, "src/shared"),
    "@content": path.join(root, "src/content"),
  },
};

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

await build({
  root: path.join(root, "src"),
  configFile: false,
  publicDir: false,
  define,
  resolve,
  build: {
    outDir,
    emptyOutDir: false,
    rollupOptions: {
      input: {
        popup: path.join(root, "src/popup/index.html"),
        options: path.join(root, "src/options/index.html"),
      },
    },
  },
});

await build({
  root,
  configFile: false,
  define,
  resolve,
  build: {
    outDir: path.join(outDir, "background"),
    emptyOutDir: false,
    codeSplitting: false,
    lib: {
      entry: path.join(root, "src/background/background.ts"),
      formats: ["es"],
      fileName: () => "background.js",
    },
  },
});

await build({
  root,
  configFile: false,
  define,
  resolve,
  build: {
    outDir: path.join(outDir, "content"),
    emptyOutDir: false,
    codeSplitting: false,
    lib: {
      entry: path.join(root, "src/content/index.ts"),
      formats: ["iife"],
      name: "BrowserContextCopierContent",
      fileName: () => "inject.js",
    },
  },
});

const manifest = JSON.parse(await readFile(path.join(root, `manifest.${target}.json`), "utf-8"));
await writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

if (existsSync(path.join(root, "icons"))) {
  await cp(path.join(root, "icons"), path.join(outDir, "icons"), { recursive: true });
}

console.log(`Built ${target} extension -> ${path.relative(root, outDir)}`);
