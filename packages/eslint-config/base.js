import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

// Import ordering, shared by every preset. Workspace packages and the @/** app alias
// sort as internal, ahead of relative imports.
export const importRules = {
  "import/order": [
    "warn",
    {
      groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
      pathGroups: [
        { pattern: "@repo/**", group: "internal", position: "before" },
        { pattern: "@/**", group: "internal", position: "before" },
      ],
      pathGroupsExcludedImportTypes: ["builtin"],
      "newlines-between": "always",
      alphabetize: { order: "asc", caseInsensitive: true },
    },
  ],
  "import/no-duplicates": "warn",
};

// Registers the import plugin and its rules. Next brings its own copy, so it skips this.
export const imports = defineConfig({
  plugins: { import: importPlugin },
  settings: { "import/resolver": { typescript: true, node: true } },
  rules: importRules,
});

/**
 * Type-aware TypeScript: no any, no type assertions, no floating promises.
 * Carries no environment (globals) and no Prettier; presets add both.
 *
 * @param {{ root: string }} options root is the linted package's directory
 *   (pass import.meta.dirname), so the type-aware parser finds its tsconfig.
 */
export function typescript({ root }) {
  return defineConfig(
    globalIgnores([
      "dist/**",
      "build/**",
      "coverage/**",
      ".turbo/**",
      "node_modules/**",
    ]),
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir: root },
      },
    },
    {
      plugins: { turbo: turboPlugin },
      rules: {
        "turbo/no-undeclared-env-vars": "error",
        // Floating or misused promises swallow rejections.
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": "error",
        // Types are never escaped: no any, no as / <T> casts, no !.
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/consistent-type-assertions": [
          "error",
          { assertionStyle: "never" },
        ],
        "@typescript-eslint/no-non-null-assertion": "error",
        // A type used only as a type is imported with "import type", so it is erased.
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { fixStyle: "separate-type-imports" },
        ],
        // Unused is almost always a bug; _ marks it intentional.
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "no-console": ["warn", { allow: ["warn", "error"] }],
      },
    },
    // Config files are not in the tsconfig; keep them out of type-aware rules.
    {
      files: ["**/*.{js,mjs,cjs}"],
      extends: [tseslint.configs.disableTypeChecked],
    },
  );
}

// typescript + imports: what every non-Next preset starts from.
export function base({ root }) {
  return defineConfig(typescript({ root }), imports);
}
