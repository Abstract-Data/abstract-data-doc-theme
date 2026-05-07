import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import abstractData from '@abstractdata/starlight-theme';

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
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/abstract-data/abstract-data-doc-theme',
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
          credit: 'auto',
        }),
      ],
    }),
  ],
});
