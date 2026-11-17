import { react } from "@repo/eslint-config/react";

// Components the shadcn CLI installs belong to shadcn: lint what we write, not what we vendor.
export default [
  ...react({ root: import.meta.dirname }),
  { ignores: ["src/components/**", "src/hooks/**", "src/lib/**"] },
];
