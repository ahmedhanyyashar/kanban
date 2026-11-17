import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

import { base } from "./base.js";

/**
 * React libraries and apps without a framework preset.
 *
 * @param {{ root: string }} options see base.
 */
export function react({ root }) {
  return defineConfig(
    base({ root }),
    reactPlugin.configs.flat.recommended,
    // New JSX transform: no React in scope.
    reactPlugin.configs.flat["jsx-runtime"],
    reactHooks.configs.flat.recommended,
    jsxA11y.flatConfigs.recommended,
    {
      languageOptions: { globals: globals.browser },
      settings: { react: { version: "detect" } },
      // Props are typed by TypeScript, not PropTypes.
      rules: { "react/prop-types": "off" },
    },
    eslintConfigPrettier,
  );
}
