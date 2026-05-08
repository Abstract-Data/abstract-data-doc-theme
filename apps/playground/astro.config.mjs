import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import abstractData from '@abstractdata/starlight-theme';
import { abstractDataThemes } from '@abstractdata/starlight-theme/shiki';

// https://astro.build/config
export default defineConfig({
  site: 'https://abstract-data.github.io',
  base: process.env.BASE_URL ?? '/',
  integrations: [
    starlight({
      title: 'Abstract Data',
      description:
        'Branded Starlight theme by Abstract Data — HUD and Calm surfaces.',
      logo: {
        src: './src/assets/abstract-data-logo.png',
        replacesTitle: false,
      },
      // We ship a custom `src/pages/404.astro` (Glitch centerpiece +
      // ghost button); opting out of Starlight's built-in route prevents
      // duplicate rendering.
      disable404Route: true,
      // Pull "Last updated" timestamps from git (only meaningful in CI
      // where the full history is fetched).
      lastUpdated: true,
      editLink: {
        baseUrl:
          'https://github.com/Abstract-Data/abstract-data-doc-theme/edit/main/apps/playground/',
      },
      // Branded code-block syntax. Set explicitly here to win over the
      // plugin's default — this is the recommended pattern for theme consumers.
      expressiveCode: {
        themes: [...abstractDataThemes],
        styleOverrides: {
          borderRadius: '8px',
          codeFontFamily: "'JetBrains Mono', ui-monospace, monospace",
          uiFontFamily: "'Inter', system-ui, sans-serif",
        },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/Abstract-Data/abstract-data-doc-theme',
        },
      ],
      sidebar: [
        {
          label: 'Get Started',
          items: [
            { label: 'Quickstart', slug: 'quickstart' },
            { label: 'Installation', slug: 'installation' },
            { label: 'Migrating from vanilla Starlight', slug: 'migrating' },
          ],
        },
        {
          label: 'Theming',
          items: [
            { label: 'Surfaces', slug: 'theming/surfaces' },
          ],
        },
        {
          label: 'Recipes',
          items: [
            { label: 'Python autodoc', slug: 'recipes/python-autodoc' },
            { label: 'Versioned API reference', slug: 'recipes/versioned-docs' },
          ],
        },
        {
          label: 'API Reference',
          autogenerate: { directory: 'api' },
        },
        {
          label: 'Reference',
          items: [
            { label: 'Kitchen Sink', slug: 'kitchen-sink' },
          ],
        },
      ],
      plugins: [
        abstractData({
          motion: 'full', // 'full' | 'calm'
          credit: 'auto', // 'auto' | 'hide'
          version: 'v0.3.0', // shown as a chip in the header
          shiki: false, // we set themes explicitly above; opt out of plugin defaults
        }),
      ],
    }),
  ],
});
