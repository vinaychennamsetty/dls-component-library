# DLS Component Library

This repository is the foundation for the DLS team's reusable component library, rebuilt
after the original repo was lost. The first component restored from the recovered tests is
the **Accordion**.

The brief was time-boxed to roughly 2.5 hours, so the goals were modest: pick a stack that
gives a fast feedback loop, write down the reasoning behind the choices, recreate the
Accordion such that the recovered tests pass, and leave a clear list of "next steps" the
team would tackle if this lived on a real backlog.

---

## Quick start

```bash
# install dependencies
npm install

# run the demo app and Storybook together
npm start

# run the demo app (Vite dev server)
npm run dev

# run the component workshop (Storybook)
npm run storybook

# run the test suite once
npm test

# run tests in watch mode while developing
npm run test:watch

# build the publishable library (tsup → dist/)
npm run build:lib

# lint, format, type-check
npm run lint
npm run format
npm run typecheck
```

`npm start` runs both local review surfaces together: the demo app at
`http://localhost:5173` and Storybook at `http://localhost:6006`. The demo renders the
Accordion in both of its main modes so the component can be seen working in a real browser,
not only in jsdom. Storybook gives a per-component workshop with controls, docs, and
variants.

---

## Tech choices

A short explanation of why each tool is here. Where there was a real trade-off I've called
it out.

### React + TypeScript

The brief recommended React + TS and that matches the rest of our front-end stack, so this
was the obvious starting point. Strict TS settings are on (`noUncheckedIndexedAccess`,
`noUnusedLocals`, etc.) — when a component library has to play well with many consumers,
catching this stuff at the type layer pays for itself.

### Vite

Vite handles dev server, bundling and (via Vitest) the test runner. One config to think
about instead of three. The dev server starts in well under a second on a cold cache, which
matters when the workflow is "edit a component, watch the test go green, swap to the
browser to eyeball it."

### Vitest

Vitest reads the same Vite config, the same TS/path aliases, the same plugins. That means
the test environment behaves like the runtime environment, which removes a whole class of
"works in dev, fails in test" problems. It's also genuinely fast — important if the suite
grows.

Jest is the obvious alternative and is fine, but it needs Babel/SWC and its own resolver
config, which is more moving parts.

### React Testing Library + jest-dom + user-event

The recovered tests are written against RTL, so this is what fits naturally. `user-event`
v14 is async and is set up in `src/test/test-utils.tsx` via a `renderWithUser` helper —
that helper is the only deviation from the test snippet in the brief and exists so each
test can destructure `user` directly.

`@testing-library/jest-dom/vitest` adds matchers like `toBeVisible()` to Vitest's `expect`
without having to maintain a custom matcher list.

### ESLint + Prettier

ESLint with the TypeScript + React + react-hooks plugins handles correctness issues.
`eslint-config-prettier` turns off any stylistic rules that would fight Prettier, so
formatting is fully delegated to Prettier and lint stays focused on real problems.

Prettier config is intentionally short — only the values that differ from the defaults are
listed.

### EditorConfig

`.editorconfig` keeps line endings, indentation and final-newline behaviour consistent for
contributors using different editors. Cheap to add, easy to forget, prevents the
"everything reformatted on save" PR.

### Storybook

Storybook 8 with the Vite builder is wired up under `.storybook/`. It reads the same Vite
config the rest of the project does, so stories see the same TS aliases and plugins as the
app. The Accordion story file lives next to the component (`Accordion.stories.tsx`) and
covers default, single-expand, initially-expanded, FAQ-style, and disabled-panel variants
with autodocs enabled. Run `npm run storybook` for the dev server or `npm run
build-storybook` for a static export suitable for hosting on Pages, S3, or Chromatic.

### tsup for the library build

The component library is built with tsup (an esbuild wrapper). Why tsup over Rollup or
Vite-library-mode: it produces both ESM and CJS outputs with `.d.ts` types in a single
config, esbuild keeps the build fast (sub-second for this size), and `react` /
`react-dom` are externalised so consumers don't get a second React instance bundled into
their app. CSS is extracted to `dist/index.css` and exposed via the package's `exports`
field so consumers can `import 'dls-component-library/style.css'` exactly once at app
startup.

---

## Project layout

```
src/
├── components/
│   ├── Accordion/
│   │   ├── Accordion.tsx        — implementation
│   │   ├── Accordion.css        — styles, scoped via class prefix
│   │   ├── Accordion.test.tsx   — the recovered test suite, restored
│   │   ├── types.ts             — public types (props, items)
│   │   └── index.ts             — barrel for the component
│   └── index.ts                 — root barrel for the library surface
├── test/
│   ├── setup.ts                 — wires jest-dom into Vitest, cleans up DOM per test
│   └── test-utils.tsx           — `renderWithUser` helper
├── App.tsx                      — demo page (not part of the published library)
├── main.tsx
├── index.css
└── ...
```

Tests live next to the components they cover. That has held up well for design-system work:
when a component moves, its test moves with it.

---

## The Accordion component

### Usage

```tsx
import { Accordion, type AccordionItem } from '@/components/Accordion';

const items: AccordionItem[] = [
  { id: 'one',   title: 'Panel one',   content: 'Content for panel one'   },
  { id: 'two',   title: 'Panel two',   content: 'Content for panel two'   },
  { id: 'three', title: 'Panel three', content: 'Content for panel three' },
];

// Multiple panels open at once (default)
<Accordion items={items} />

// One panel at a time
<Accordion items={items} shouldAllowMultipleExpanded={false} />

// Custom heading level + observer
<Accordion
  items={items}
  headingLevel={2}
  defaultExpanded={[0]}
  onChange={(open) => console.log('open indices', open)}
/>
```

### Props

| Prop                          | Type                       | Default | Description                                              |
| ----------------------------- | -------------------------- | ------- | -------------------------------------------------------- |
| `items`                       | `AccordionItem[]`          | —       | Panels to render, in display order.                      |
| `shouldAllowMultipleExpanded` | `boolean`                  | `true`  | When `false`, opening a panel collapses any other open.  |
| `defaultExpanded`             | `number[]`                 | `[]`    | Indices that start expanded on first render.             |
| `headingLevel`                | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`     | Heading element wrapping the trigger button.             |
| `onChange`                    | `(open: number[]) => void` | —       | Fires whenever expansion state changes.                  |
| `className`                   | `string`                   | —       | Extra class on the outer container.                      |
| `idPrefix`                    | `string`                   | auto    | Used to build deterministic ids when needed.             |

### Implementation notes

A few decisions worth surfacing:

**Panel bodies are unmounted when closed.** The recovered tests assert that hidden content
returns `null` from `queryByText`. Hiding via CSS (`display: none`, the `hidden` attribute)
won't satisfy that — RTL still sees the text node. Unmounting is also better behaviour by
default: heavy children, focus traps, and effects don't run for content nobody is reading.

**The region wrapper stays in the DOM regardless.** It carries `role="region"` and
`aria-labelledby`, so the assistive-tech outline lists every panel from first render.
That's what the accessibility test relies on when it calls
`getAllByRole('region', { hidden: true })`.

**Each trigger lives inside a real heading.** ARIA's accordion pattern requires this — it
gives users the option to jump between panels with their heading navigation. The level is
configurable because the right level depends on where the accordion sits in the page.

**State is internal but observable.** `onChange` exposes the open indices for parents that
want to log or persist, without forcing the consumer to manage state for the common case.

### Flexibility / how I'd grow this

For a single Accordion the `items` prop is the lowest-friction API. The next natural step
would be a compound-components version:

```tsx
<Accordion.Root shouldAllowMultipleExpanded={false}>
  <Accordion.Item value="one">
    <Accordion.Header>Panel one</Accordion.Header>
    <Accordion.Panel>Content for panel one</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
```

That gives consumers full control over inner markup — icons inside the trigger, custom
heading wrappers, animated panels, etc. — without ballooning the prop surface.

---

## Accessibility

The accordion follows the [WAI-ARIA Accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/):

- Each trigger is a real `<button>` inside a heading element.
- `aria-controls` on the trigger points at the panel id.
- `aria-labelledby` on the panel points at the trigger id.
- `aria-expanded` reflects the open/closed state.
- Disabled panels expose `aria-disabled` and ignore activation.

Tested explicitly in `Accordion.keyboard.test.tsx`:
- Tab moves focus through the triggers in order.
- Enter and Space on a focused trigger toggle the panel.
- `aria-expanded` mirrors the open/closed state on every panel.
- Focus stays on the trigger after activation (opening a panel doesn't yank focus into
  the content).

What I would add given more time:
- Arrow-key navigation between triggers (`Up`/`Down`, `Home`/`End`) per the WAI-ARIA
  Authoring Practices.
- Run the demo through `axe` (e.g. `@axe-core/react` or `jest-axe`) and surface a CI report.

---

## Future improvements

Things I'd pick up next, in roughly the order I'd do them:

- **CI**: GitHub Actions workflow running `typecheck`, `lint`, `test`, `build:lib`, and
  `build-storybook` on every PR plus a required status check on main. Cache `node_modules`
  between runs.
- **Compound-components API** for the Accordion (see above) layered on top of the current
  items API — the items API stays as the easy path, compound components unlock custom
  layouts.
- **Documentation site**: extend Storybook's autodocs into an MDX-based docs site (or
  publish the Storybook static build itself to Pages).
- **Visual regression**: Chromatic against the Storybook build, or Playwright snapshots.
  Worth wiring in the moment we have a designer reviewing PRs.
- **Accessibility automation**: `jest-axe` in unit tests + an axe pass in Storybook via
  `@storybook/addon-a11y`.
- **Conventional Commits + Changesets**: drives the changelog and version bumps from PR
  metadata rather than someone having to remember.
- **Pre-commit hooks**: lefthook (or husky + lint-staged) running `prettier --write` and
  `eslint --fix` on staged files so formatting drift never reaches a PR.
- **Arrow-key navigation** between Accordion triggers (Up/Down/Home/End) per the WAI-ARIA
  Authoring Practices.
- **Theming**: design tokens consumed via CSS custom properties so components inherit
  light/dark/brand themes from a single source of truth.
- **Publish to a private registry**: GitHub Packages or a private npm. The `dist`
  artefact, `exports` field, and dual ESM/CJS output are already in place — what's missing
  is the registry + the release workflow.
- **i18n surface**: nothing string-bound is in the component today, but worth a note —
  any future text additions should accept ReactNode rather than `string` only.

---

## Scripts cheatsheet

| Script              | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`         | Vite dev server with HMR (demo app).                |
| `npm run storybook`   | Storybook dev server on port 6006.                  |
| `npm run build`       | Library build then demo-app build.                  |
| `npm run build:lib`   | Library build via tsup → ESM + CJS + d.ts + css.    |
| `npm run build:demo`  | Production build of the demo app.                   |
| `npm run build-storybook` | Static Storybook for deployment.                |
| `npm run preview`     | Serve the built demo for a smoke test.              |
| `npm test`            | Single-pass Vitest run (used in CI).                |
| `npm run test:watch`  | Watch mode while developing.                        |
| `npm run test:coverage` | Coverage report via the V8 provider.              |
| `npm run lint`        | ESLint over `src/**/*.{ts,tsx}`.                    |
| `npm run lint:fix`    | Lint with autofix.                                  |
| `npm run format`      | Prettier write.                                     |
| `npm run format:check` | Prettier check (useful in CI).                     |
| `npm run typecheck`   | Standalone `tsc --noEmit` pass.                     |


