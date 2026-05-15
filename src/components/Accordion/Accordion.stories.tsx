import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';
import type { AccordionItem } from './types';

const sampleItems: AccordionItem[] = [
  { id: 'one', title: 'Panel one', content: 'Content for panel one' },
  { id: 'two', title: 'Panel two', content: 'Content for panel two' },
  { id: 'three', title: 'Panel three', content: 'Content for panel three' },
];

const richItems: AccordionItem[] = [
  {
    id: 'shipping',
    title: 'How long does shipping take?',
    content: 'Standard shipping is 3–5 working days. Express is next-day if ordered before 2pm.',
  },
  {
    id: 'returns',
    title: 'What is your returns policy?',
    content:
      'Items can be returned within 30 days of delivery, unused and in their original packaging.',
  },
  {
    id: 'support',
    title: 'How do I contact support?',
    content:
      'Email hello@example.com or use the live chat between 9am and 6pm UK time, Monday to Friday.',
  },
];

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A WAI-ARIA conformant Accordion. Panels mount on open and unmount on close, ' +
          'so collapsed content is genuinely absent from the DOM. The trigger lives inside ' +
          'a real heading so screen readers can navigate by headings.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: false,
      description: 'Array of items. Each item provides an `id`, `title`, and `content`.',
    },
    shouldAllowMultipleExpanded: {
      control: 'boolean',
      description: 'When `false`, opening a panel closes any other.',
      table: { defaultValue: { summary: 'true' } },
    },
    defaultExpanded: {
      control: 'object',
      description: 'Indices that start expanded on first render.',
    },
    headingLevel: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 5, 6],
      description: 'Heading element wrapping the trigger button.',
      table: { defaultValue: { summary: '3' } },
    },
    onChange: {
      action: 'changed',
      description: 'Fires whenever the expanded set changes.',
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

export const SingleExpand: Story = {
  name: 'Single-expand mode',
  args: {
    items: sampleItems,
    shouldAllowMultipleExpanded: false,
  },
};

export const InitiallyExpanded: Story = {
  name: 'Initially expanded',
  args: {
    items: sampleItems,
    defaultExpanded: [0, 2],
  },
};

export const RichContent: Story = {
  name: 'FAQ usage',
  args: {
    items: richItems,
    shouldAllowMultipleExpanded: false,
  },
};

export const WithDisabledPanel: Story = {
  name: 'With a disabled panel',
  args: {
    items: [
      ...sampleItems.slice(0, 1),
      { ...sampleItems[1]!, disabled: true, title: 'Panel two (disabled)' },
      ...sampleItems.slice(2),
    ],
  },
};
