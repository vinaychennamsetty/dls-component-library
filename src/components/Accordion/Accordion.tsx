import { createElement, useCallback, useId, useState, type ReactElement } from 'react';
import type { AccordionHeadingLevel, AccordionItem, AccordionProps } from './types';
import './Accordion.css';

/**
 * Accordion
 *
 * Implementation notes:
 *  - Each panel has three pieces wired together: a heading wrapper, a
 *    button trigger, and a content region. The button owns `aria-controls`
 *    and the region owns a matching `aria-labelledby`, which is the
 *    minimum ARIA wiring screen readers need to announce them as a pair.
 *  - Panel content is *unmounted* when the panel is collapsed. That way
 *    the recovered test `queryByText(...)).toBeNull()` is satisfied
 *    naturally — there is simply no text node to find. Toggling open
 *    re-mounts the content so `toBeVisible()` passes without us having
 *    to lean on CSS.
 *  - The region wrapper is rendered all the time so the accessibility
 *    test (`getAllByRole('region', { hidden: true })`) sees one per panel
 *    on first render, before any clicks.
 */

function buildHeading(level: AccordionHeadingLevel, child: ReactElement): ReactElement {
  // `createElement` keeps things tidy here — we'd otherwise need a
  // tag-to-component lookup that's no easier to read.
  return createElement(`h${level}`, { className: 'dls-accordion__heading' }, child);
}

export function Accordion(props: AccordionProps): ReactElement {
  const {
    items,
    shouldAllowMultipleExpanded = true,
    defaultExpanded = [],
    headingLevel = 3,
    onChange,
    className,
    idPrefix,
  } = props;

  // useId gives us a per-instance prefix that's stable across renders.
  // We layer the caller-supplied prefix on top so consumers can override
  // when they need predictable ids (e.g. for end-to-end selectors).
  const reactId = useId();
  const prefix = idPrefix ?? `dls-acc-${reactId.replace(/:/g, '')}`;

  const [expanded, setExpanded] = useState<Set<number>>(() => new Set(defaultExpanded));

  const togglePanel = useCallback(
    (index: number) => {
      setExpanded((current) => {
        const isOpen = current.has(index);
        let next: Set<number>;

        if (isOpen) {
          // Clicking an already-open panel always closes it.
          next = new Set(current);
          next.delete(index);
        } else if (shouldAllowMultipleExpanded) {
          next = new Set(current);
          next.add(index);
        } else {
          // Single-expand mode: drop every other panel before opening.
          next = new Set([index]);
        }

        onChange?.([...next].sort((a, b) => a - b));
        return next;
      });
    },
    [shouldAllowMultipleExpanded, onChange],
  );

  return (
    <div
      className={['dls-accordion', className].filter(Boolean).join(' ')}
      data-testid="dls-accordion"
    >
      {items.map((item, index) => {
        const slug = item.id ?? String(index);
        const buttonId = `${prefix}-trigger-${slug}`;
        const regionId = `${prefix}-panel-${slug}`;
        const isOpen = expanded.has(index);

        return (
          <AccordionPanel
            key={slug}
            item={item}
            buttonId={buttonId}
            regionId={regionId}
            headingLevel={headingLevel}
            isOpen={isOpen}
            onToggle={() => togglePanel(index)}
          />
        );
      })}
    </div>
  );
}

interface AccordionPanelInternalProps {
  item: AccordionItem;
  buttonId: string;
  regionId: string;
  headingLevel: AccordionHeadingLevel;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionPanel({
  item,
  buttonId,
  regionId,
  headingLevel,
  isOpen,
  onToggle,
}: AccordionPanelInternalProps): ReactElement {
  const heading = buildHeading(
    headingLevel,
    <button
      id={buttonId}
      type="button"
      className="dls-accordion__trigger"
      aria-expanded={isOpen}
      aria-controls={regionId}
      aria-disabled={item.disabled || undefined}
      disabled={item.disabled}
      data-state={isOpen ? 'open' : 'closed'}
      onClick={() => {
        if (!item.disabled) onToggle();
      }}
    >
      <span className="dls-accordion__title">{item.title}</span>
      <span className="dls-accordion__chevron" aria-hidden="true">
        {isOpen ? '−' : '+'}
      </span>
    </button>,
  );

  return (
    <div
      className={`dls-accordion__item ${isOpen ? 'is-open' : 'is-closed'}`}
      data-state={isOpen ? 'open' : 'closed'}
    >
      {heading}
      <div
        id={regionId}
        role="region"
        aria-labelledby={buttonId}
        className="dls-accordion__region"
        data-state={isOpen ? 'open' : 'closed'}
      >
        {/*
         * Unmounting the body when closed keeps the DOM honest for the
         * test that asserts collapsed content is null. It also keeps
         * heavy or controlled content from running while hidden.
         */}
        {isOpen && <div className="dls-accordion__content">{item.content}</div>}
      </div>
    </div>
  );
}

export default Accordion;
