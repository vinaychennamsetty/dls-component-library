import { describe, test, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithUser } from '../../test/test-utils';
import { Accordion } from './Accordion';
import type { AccordionItem } from './types';

// Keyboard-interaction tests live in a separate file so the "recovered"
// suite stays untouched and easy to compare against the original brief.
// These tests cover the behaviour the brief didn't explicitly ask for
// but that any accessible accordion needs to honour: Enter/Space
// activation, Tab order between triggers, and aria-expanded reflecting
// state after keyboard activation.

const panels: AccordionItem[] = [
  { id: 'one', title: 'Panel one', content: 'Content for panel one' },
  { id: 'two', title: 'Panel two', content: 'Content for panel two' },
  { id: 'three', title: 'Panel three', content: 'Content for panel three' },
];

describe('Accordion — keyboard interaction', () => {
  test('Tab moves focus through the triggers in order', async () => {
    const { user } = renderWithUser(<Accordion items={panels} />);
    const buttons = screen.getAllByRole('button');

    await user.tab();
    expect(buttons[0]).toHaveFocus();

    await user.tab();
    expect(buttons[1]).toHaveFocus();

    await user.tab();
    expect(buttons[2]).toHaveFocus();
  });

  test('Enter on a focused trigger opens its panel', async () => {
    const { user } = renderWithUser(<Accordion items={panels} />);
    const buttons = screen.getAllByRole('button');

    buttons[1]!.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByText('Content for panel two')).toBeVisible();
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
  });

  test('Space on a focused trigger toggles its panel', async () => {
    const { user } = renderWithUser(<Accordion items={panels} />);
    const buttons = screen.getAllByRole('button');

    buttons[0]!.focus();
    await user.keyboard(' ');
    expect(screen.getByText('Content for panel one')).toBeVisible();
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard(' ');
    expect(screen.queryByText('Content for panel one')).toBeNull();
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
  });

  test('aria-expanded mirrors the open/closed state', async () => {
    const { user } = renderWithUser(<Accordion items={panels} />);
    const buttons = screen.getAllByRole('button');

    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    await user.click(buttons[2]!);
    expect(buttons[2]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
  });

  test('focus stays on the trigger after activation', async () => {
    // Important for keyboard users — opening a panel shouldn't yank
    // focus into the content. The user should be able to keep tabbing.
    const { user } = renderWithUser(<Accordion items={panels} />);
    const buttons = screen.getAllByRole('button');

    buttons[1]!.focus();
    await user.keyboard('{Enter}');

    expect(buttons[1]).toHaveFocus();
  });
});
