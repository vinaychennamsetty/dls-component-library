import type { ReactNode } from 'react';

/**
 * Heading level for the wrapper that contains the panel trigger button.
 * Wrapping the button in a real heading is part of the WAI-ARIA accordion
 * pattern. We expose the level so consumers can place the accordion at
 * the correct depth in their own document outline.
 */
export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface AccordionItem {
  /**
   * Stable identifier used internally to build the `aria-controls` /
   * `aria-labelledby` pair. If omitted, the index is used — fine for
   * static lists but supply a real id when items can reorder.
   */
  id?: string;
  /** Text or node rendered inside the trigger button. */
  title: ReactNode;
  /** Body shown when the panel is expanded. */
  content: ReactNode;
  /** When true the panel cannot be toggled. */
  disabled?: boolean;
}

export interface AccordionProps {
  /** The panels rendered, in display order. */
  items: AccordionItem[];

  /**
   * When `false` only one panel may be open at a time — opening a new
   * one collapses any other. Default is `true` to match the recovered
   * test suite (multi-expansion is the historical default).
   */
  shouldAllowMultipleExpanded?: boolean;

  /** Optional initial set of expanded indices. */
  defaultExpanded?: number[];

  /**
   * Heading element used to wrap each trigger button. ARIA's accordion
   * pattern requires a real heading; the level depends on the page
   * structure so we let the consumer decide. Defaults to `h3`.
   */
  headingLevel?: AccordionHeadingLevel;

  /**
   * Fires whenever the set of expanded indices changes. Lets the
   * component be observed even though state is kept internal.
   */
  onChange?: (expandedIndices: number[]) => void;

  /** Extra class applied to the outermost container. */
  className?: string;

  /**
   * Optional id prefix. Useful when several accordions appear on the
   * same page and you want predictable ids in the rendered DOM.
   */
  idPrefix?: string;
}
