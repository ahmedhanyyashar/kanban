import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

import { base } from "./base.js";

/**
 * NestJS apps. Same strictness as base; adds Node and Jest globals.
 *
 * @param {{ root: string }} options see base.
 */
export function nest({ root }) {
  return defineConfig(
    base({ root }),
    {
      languageOptions: {
        globals: { ...globals.node, ...globals.jest },
        sourceType: "commonjs",
      },
    },
    {
      // Nest reads a decorated constructor's parameter types from emitted metadata, so they
      // are imported as values even though they look like types.
      rules: { "@typescript-eslint/consistent-type-imports": "off" },
    },
    {
      // Config files and e2e specs may sit outside the app tsconfig.
      files: ["**/*.ts"],
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: root,
        },
      },
    },
    eslintConfigPrettier,
  );
}
