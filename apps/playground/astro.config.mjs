import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import abstractData from '@abstractdata/starlight-theme';
import { abstractDataThemes } from '@abstractdata/starlight-theme/shiki';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.abstractdata.io',
  integrations: [
    starlight({
      title: 'Abstract Data',
      description:
        'Branded Starlight theme by Abstract Data — HUD and Calm surfaces.',
      logo: {
        src: './src/assets/abstract-data-logo.png',
        replacesTitle: false,
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
          ],
        },
        {
          label: 'Theming',
          items: [
            { label: 'Surfaces', slug: 'theming/surfaces' },
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
