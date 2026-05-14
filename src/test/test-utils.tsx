import type { ReactElement } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Thin wrapper around RTL's `render` that also returns a configured
 * `userEvent` instance. The Accordion suite (and most interaction tests
 * generally) destructure `user` off the return value, so it pays off
 * not having to re-`setup()` it inside every individual test.
 */
export interface RenderWithUserResult extends RenderResult {
  user: ReturnType<typeof userEvent.setup>;
}

export function renderWithUser(ui: ReactElement, options?: RenderOptions): RenderWithUserResult {
  return {
    user: userEvent.setup(),
    ...render(ui, options),
  };
}
