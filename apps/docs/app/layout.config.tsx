import { pageTree } from '@/app/source';
import type { HomeLayoutProps } from 'fumadocs-ui/home-layout';
import type { DocsLayoutProps } from 'fumadocs-ui/layout';

// shared configuration
export const baseOptions: HomeLayoutProps = {
  nav: {
    title: 'Selfmail Docs',
    url: 'https://docs.selfmail.app',
  },
  links: [
    {
      text: 'Homepage',
      url: 'https://selfmail.app',
      external: true,
      active: 'nested-url',
    },
    {
      text: 'GitHub',
      url: 'https://github.com/selfmail/selfmail',
      external: true,
    },
    {
      text: 'Discord',
      url: 'https://discord.gg/selfmail',
      external: true,
    },
  ],
};

// docs layout configuration
export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: pageTree,
};
