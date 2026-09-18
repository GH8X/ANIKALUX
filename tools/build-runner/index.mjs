#!/usr/bin/env node
/**
 * Compatibility shim — exposes a `build` executable.
 *
 * WHY THIS EXISTS
 * ---------------
 * The Freebuff deploy was failing with:
 *
 *   error: could not determine executable to run for package build
 *   sh: 1: vite: not found
 *
 * The first line is Bun's exact error for `bunx build` — the hosting build step
 * invokes a bare `build` word, which Bun interprets as an npm package named
 * "build" rather than the package.json script. `bunx` prefers a binary in
 * `node_modules/.bin`, so declaring this package as a local `file:` dependency
 * puts a real `build` executable on that path and the command resolves.
 *
 * The second line is covered by keeping the build tooling in `dependencies`
 * (see README) so a production-only install still provides Vite.
 *
 * This shim resolves Vite through node_modules rather than the PATH, so it also
 * works when the host shells the command out without `node_modules/.bin`
 * prepended.
 *
 * Once the hosting build command is set to `bun run build`, this file simply
 * becomes unused and can be removed along with the `@anika-lux/build-runner`
 * entry in package.json.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VITE_BIN_RELATIVE = [
  path.join("node_modules", "vite", "bin", "vite.js"),
  path.join("node_modules", "vite", "bin", "vite.mjs"),
];

/**
 * Walk upward from a starting directory looking for an installed Vite.
 * Counting `../` levels is not enough: this file is reachable both as
 * `tools/build-runner/index.mjs` and as the symlinked
 * `node_modules/@anika-lux/build-runner/index.mjs`, which sit at different
 * depths, and Node resolves symlinks when computing `import.meta.url`.
 */
function findViteBin(startDir) {
  let dir = path.resolve(startDir);
  for (let depth = 0; depth < 10; depth += 1) {
    for (const relative of VITE_BIN_RELATIVE) {
      const candidate = path.join(dir, relative);
      if (existsSync(candidate)) return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const viteBin = findViteBin(scriptDir) ?? findViteBin(process.cwd());

if (!viteBin) {
  console.error(
    "[build] Vite is not installed. Run the install command (for example `bun install`) before building.",
  );
  process.exit(1);
}

// <root>/node_modules/vite/bin/vite.js → <root>/node_modules/vite → <root>
const vitePackageDir = path.dirname(path.dirname(viteBin));
const projectRoot = path.dirname(path.dirname(vitePackageDir));

const result = spawnSync(process.execPath, [viteBin, "build", ...process.argv.slice(2)], {
  cwd: projectRoot,
  stdio: "inherit",
});

if (result.error) {
  console.error(`[build] Failed to start Vite: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
