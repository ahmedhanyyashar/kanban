# @repo/ui

The design system: the theme, the components and the blocks the web app is built from.

## What is in it

| Path              | What it holds                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `src/globals.css` | The one theme file: colour tokens in `oklch` (light and dark), priority and brand colours, shadows, utilities, the reduced-motion rule |
| `src/components`  | shadcn components on Base UI (button, dialog, field, sidebar and so on). Add one with the shadcn CLI; do not hand-write a look-alike   |
| `src/blocks`      | Composed pieces used across features: page header, empty state, confirm dialog, skip link, mode toggle, error boundary                 |
| `src/hooks`       | Small shared hooks                                                                                                                     |
| `src/lib`         | `cn` and formatting helpers                                                                                                            |

## Using it

```tsx
import { Button } from "@repo/ui/components/button";
import { PageHeader } from "@repo/ui/blocks/page-header";
```

Import the theme once in the app's entry stylesheet: `@import "@repo/ui/globals.css"`.

## Rules

- Use components as they are: no size or radius overrides. If a look is missing, add a variant.
- Colours come from the theme tokens, never hex values in a component.
- Icon-only controls get a native `title` and an `aria-label`.
- The palette's contrast is checked in both themes by `apps/web/src/theme.contrast.spec.ts`.
