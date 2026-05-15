import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Stories are colocated with the components — easier to find and to
  // keep in sync when a component changes.
  stories: ['../src/components/**/*.stories.@(ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
