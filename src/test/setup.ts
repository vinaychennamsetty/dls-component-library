import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest doesn't clean up the DOM between tests on its own when using
// React Testing Library, so we hook into the per-test teardown.
afterEach(() => {
  cleanup();
});
