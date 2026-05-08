import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import abstractData from '@abstractdata/starlight-theme';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
  // ⬇️ Set to your production URL before going live (sitemap depends on it).
  site: 'https://example.com',

  // ⬇️ Uncomment if deploying to a project page (e.g. github.io/<repo>/).
  // base: '/your-repo-name',

  integrations: [
    starlight({
      // ⬇️ Replace with your project name.
      title: 'Your Project Docs',
      description: 'Branded documentation by Abstract Data.',

      // ⬇️ Replace with your logo. Place it in `src/assets/`.
      // logo: { src: './src/assets/your-logo.png', replacesTitle: true },

      // ⬇️ Replace or remove.
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/your-org/your-repo',
        },
      ],

      // ⬇️ Show "Last updated" timestamps on every page (read from git).
      //    Requires the repo to be a git checkout at build time.
      lastUpdated: true,

      // ⬇️ Show an "Edit page" link in the footer of every doc.
      //    Uncomment and replace once your repo URL is final.
      // editLink: {
      //   baseUrl: 'https://github.com/your-org/your-repo/edit/main/',
      // },

      // ⬇️ Customize your sidebar.
      sidebar: [
        {
          label: 'Get Started',
          items: [
            { label: 'Welcome', slug: 'index' },
            { label: 'Quickstart', slug: 'quickstart' },
          ],
        },
      ],

      plugins: [
        abstractData({
          // 'full' = HUD with animations · 'calm' = no motion (recommended for client docs)
          motion: 'calm',
          // 'auto' = "Built by Abstract Data" credit visible · 'hide' = white-label
          credit: 'auto',
          // Optional version chip in the header. Omit to hide.
          // version: 'v1.0.0',
        }),
        // Fails the build on broken internal links — run on every PR.
        // Set `errorOnFallbackPages: false` if you only build a subset
        // of locales in dev.
        starlightLinksValidator(),
      ],
    }),
  ],
});
