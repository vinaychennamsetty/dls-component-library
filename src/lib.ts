// Library entry point.
//
// Consumers should import from the package root, e.g.
//   import { Accordion } from 'dls-component-library';
//   import 'dls-component-library/style.css';
//
// Anything not re-exported from here is treated as internal to the
// package and not subject to the public API contract.

export { Accordion } from './components/Accordion';
export type { AccordionItem, AccordionProps, AccordionHeadingLevel } from './components/Accordion';
