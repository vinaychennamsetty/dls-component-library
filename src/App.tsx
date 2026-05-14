import { Accordion } from './components/Accordion';
import type { AccordionItem } from './components/Accordion';

const faqs: AccordionItem[] = [
  {
    id: 'what',
    title: 'What is this library for?',
    content:
      'It is the foundation of our internal design system. Components live here as small, ' +
      'composable pieces and ship to product teams through a versioned package.',
  },
  {
    id: 'why-accordion-first',
    title: 'Why start with an accordion?',
    content:
      'Accordions look simple but exercise plenty of the behaviour we care about — state, ' +
      'accessibility wiring, keyboard interaction, configurable defaults. A solid one is a ' +
      'decent stress test of the project setup.',
  },
  {
    id: 'a11y',
    title: 'How accessible is it?',
    content:
      'Each panel uses a real heading wrapping a button. The button owns aria-controls, the ' +
      'matching region carries aria-labelledby and aria-expanded reflects state. Disabled ' +
      'panels are skipped on toggle and announce as disabled.',
  },
];

const sections: AccordionItem[] = [
  {
    id: 'overview',
    title: 'Overview',
    content: 'A short summary panel — only one of these is open at a time.',
  },
  {
    id: 'details',
    title: 'Details',
    content: 'Expanding this one collapses the others.',
  },
  {
    id: 'next-steps',
    title: 'Next steps',
    content: 'Useful for FAQ-style pages where the user is reading top to bottom.',
  },
];

export default function App() {
  return (
    <main className="demo-shell">
      <h1>DLS Component Library</h1>
      <p className="lede">
        A small demo so the Accordion can be poked at in a real browser. The component itself lives
        under <code>src/components/Accordion</code>.
      </p>

      <section className="demo-section">
        <h2>Default — multiple panels can be open</h2>
        <p>
          This matches the recovered test suite&apos;s default behaviour. Open as many as you like;
          clicking an open panel closes it.
        </p>
        <Accordion items={faqs} />
      </section>

      <section className="demo-section">
        <h2>Single-expand mode</h2>
        <p>
          Pass <code>shouldAllowMultipleExpanded={'{false}'}</code> when only one panel should ever
          be open at once.
        </p>
        <Accordion items={sections} shouldAllowMultipleExpanded={false} />
      </section>
    </main>
  );
}
