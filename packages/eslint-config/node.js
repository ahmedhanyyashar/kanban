import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

import { base } from "./base.js";

/**
 * Plain Node code: libraries, services, workers.
 *
 * @param {{ root: string }} options see base.
 */
export function node({ root }) {
  return defineConfig(
    base({ root }),
    { languageOptions: { globals: globals.node } },
    eslintConfigPrettier,
  );
}
