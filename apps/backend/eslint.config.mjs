import { nest } from "@repo/eslint-config/nest";

export default [
  ...nest({ root: import.meta.dirname }),
  {
    // a script reports to the terminal
    files: ["scripts/**/*.ts"],
    rules: { "no-console": "off" },
  },
  {
    // supertest and the testing module hand back `any`
    files: ["test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    rules: {
      // across folders, import through the `@/` and `@test/` aliases; `../` is for a file's own module
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*"],
              message: "Import with the @/ or @test/ alias.",
            },
          ],
        },
      ],
    },
  },
];
