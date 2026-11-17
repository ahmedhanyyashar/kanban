// Fails when an app, a package, a web feature or an API module is missing from the architecture map,
// so the map cannot fall behind the code.
import { readFileSync, readdirSync, statSync } from "node:fs";

const map = readFileSync("docs/architecture.md", "utf8");
const roots = [
  "apps",
  "packages",
  "apps/web/src/features",
  "apps/backend/src/modules",
];

const missing = [];
for (const root of roots) {
  let names;
  try {
    names = readdirSync(root);
  } catch {
    continue; // this part of the repository does not exist yet
  }
  for (const name of names) {
    const path = `${root}/${name}`;
    if (name === "node_modules" || !statSync(path).isDirectory()) continue;
    if (!map.includes(path)) missing.push(path);
  }
}

if (missing.length > 0) {
  console.error(
    `Missing from docs/architecture.md:\n${missing.map((p) => `  - ${p}`).join("\n")}`,
  );
  process.exit(1);
}
console.log(
  "The architecture map lists every app, package, feature and module.",
);
