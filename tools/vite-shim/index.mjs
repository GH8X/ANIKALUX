#!/usr/bin/env node
/**
 * Compatibility shim — exposes a `vite` executable.
 *
 * WHY THIS EXISTS
 * ---------------
 * The Freebuff hosting platform shells `vite` (e.g. `vite preview`) after the
 * build completes, using a POSIX shell whose PATH does not include
 * `node_modules/.bin`.  A bare `vite` therefore resolves to nothing and the
 * deploy fails with `sh: 1: vite: not found` — even though the binary is
 * installed.
 *
 * When the platform runs `bunx vite` or `npx vite` the package-runner *does*
 * check `node_modules/.bin`, so the real symlink already works for those
 * invocations.  This shim exists for the case where a bare `vite` is the
 * recorded command and the resolution layer is `sh` rather than a package
 * runner: `bun install` links a local `file:` dependency's `bin` into
 * `.bin`, and `npx` / `bunx` both prefer `.bin`, so adding `vite` to
 * `node_modules/.bin` through a local dependency covers both paths.
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
    "[vite-shim] Vite is not installed. Run `bun install` (or the hosting install command) before running vite.",
  );
  process.exit(1);
}

// Forward every argument (e.g. `preview`, `--host`, `--port`, etc.) to the
// real CLI — this shim is transparent.
const result = spawnSync(process.execPath, [viteBin, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  stdio: "inherit",
});

if (result.error) {
  console.error(`[vite-shim] Failed to start Vite: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
