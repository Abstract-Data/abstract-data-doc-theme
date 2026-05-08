import type { StarlightPlugin } from '@astrojs/starlight/types';
import { abstractDataDark } from './shiki/abstract-data-dark.ts';
import { abstractDataLight } from './shiki/abstract-data-light.ts';

export interface AbstractDataThemeConfig {
  /**
   * Visual motion intensity.
   * - `full` (default): HUD surface — animated hex grid, holographic shimmer,
   *   glitch pulse on the version chip.
   * - `calm`: Blueprint surface — same palette and fonts, no animations.
   *
   * `full` automatically degrades to `calm` behavior when the user's OS reports
   * `prefers-reduced-motion: reduce`.
   */
  motion?: 'full' | 'calm';

  /**
   * "Built by Abstract Data" credit in the footer.
   * - `auto` (default): show the credit (recommended for Abstract Data properties).
   * - `hide`: omit entirely (white-label client work).
   */
  credit?: 'auto' | 'hide';

  /**
   * Optional version string shown as a chip next to the social icons.
   * When set under `motion: 'full'`, the chip carries a glitch pulse plus
   * a hover-triggered glitch effect. Leave undefined to hide it entirely.
   *
   * @example "v1.4.2"
   */
  version?: string;

  /**
   * Apply the branded Shiki / expressive-code themes (cyan/gold/burgundy
   * tokens). Defaults to `true`. Set `false` if you want to ship your own
   * `expressiveCode.themes` in `astro.config.mjs`.
   */
  shiki?: boolean;

  /**
   * Base URL of the API reference for the bundled `<VersionPicker>`.
   * Match `outputDir` in your autodoc JSON config (relative to
   * `src/content/docs/`). Defaults to `/api`.
   *
   * The picker auto-discovers the version list from the docs collection's
   * `version:` frontmatter (written by the autodoc orchestrator), so you
   * don't need to maintain a separate version array — point this at the
   * correct base path and the rest is automatic.
   *
   * @example "/api"          // python-autodoc.json: "outputDir": "src/content/docs/api"
   * @example "/api/ts"       // ts-autodoc.json:    "outputDir": "src/content/docs/api/ts"
   */
  apiBase?: string;
}

const PLUGIN_NAME = '@abstractdata/starlight-theme';
const VIRTUAL_ID = 'virtual:abstractdata/config';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

/**
 * Abstract Data Starlight theme plugin.
 *
 * @example
 * ```js
 * // astro.config.mjs
 * import abstractData from '@abstractdata/starlight-theme';
 *
 * starlight({
 *   plugins: [abstractData({ motion: 'full', version: 'v1.4.2' })],
 * });
 * ```
 */
export default function abstractDataTheme(
  opts: AbstractDataThemeConfig = {},
): StarlightPlugin {
  const motion = opts.motion ?? 'full';
  const credit = opts.credit ?? 'auto';
  const version = opts.version ?? null;
  const shiki = opts.shiki ?? true;
  const apiBase = opts.apiBase ?? '/api';

  const runtimeConfig = JSON.stringify({ motion, credit, version, apiBase });

  return {
    name: PLUGIN_NAME,
    hooks: {
      'config:setup'({ updateConfig, addIntegration, logger }) {
        const customCss: string[] = [
          '@abstractdata/starlight-theme/styles/theme.css',
        ];
        if (motion === 'full') {
          customCss.push('@abstractdata/starlight-theme/styles/hud.css');
        }

        const updates: Parameters<typeof updateConfig>[0] = {
          customCss,
          components: {
            SocialIcons:
              '@abstractdata/starlight-theme/components/SocialIcons.astro',
            Footer:
              '@abstractdata/starlight-theme/components/Footer.astro',
          },
        };

        if (shiki) {
          // Branded code-block syntax. First theme = dark, second = light;
          // expressive-code auto-switches based on Starlight's data-theme.
          updates.expressiveCode = {
            themes: [abstractDataDark, abstractDataLight],
            styleOverrides: {
              borderRadius: '8px',
              borderColor: 'var(--sl-color-hairline)',
              codeFontFamily: "'JetBrains Mono', ui-monospace, monospace",
              uiFontFamily: "'Inter', system-ui, sans-serif",
            },
          };
        }

        updateConfig(updates);

        // Inject the runtime config as a Vite virtual module so components
        // (SocialIcons, Footer, Glitch) can import it without a build step.
        addIntegration({
          name: '@abstractdata/starlight-theme/runtime',
          hooks: {
            'astro:config:setup': ({ updateConfig: updateAstroConfig }) => {
              updateAstroConfig({
                vite: {
                  plugins: [
                    {
                      name: 'abstractdata-virtual-config',
                      resolveId(id) {
                        if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
                        return null;
                      },
                      load(id) {
                        if (id === RESOLVED_VIRTUAL_ID) {
                          return `export const config = ${runtimeConfig};`;
                        }
                        return null;
                      },
                    },
                  ],
                },
              });
            },
          },
        });

        logger.info(
          `Abstract Data theme · motion: ${motion} · credit: ${credit}` +
            (version ? ` · version: ${version}` : '') +
            (shiki ? ' · shiki: branded' : ' · shiki: user-managed'),
        );
      },
    },
  };
}
