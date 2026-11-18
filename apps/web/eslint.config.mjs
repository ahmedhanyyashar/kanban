import { react } from "@repo/eslint-config/react";

export default [
  ...react({ root: import.meta.dirname }),
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // further up than the file next to it, import through the `@/` alias
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["../../*"], message: "Import with the @/ alias." },
          ],
        },
      ],
    },
  },
];
