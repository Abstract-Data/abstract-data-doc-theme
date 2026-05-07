import type { StarlightPlugin } from '@astrojs/starlight/types';

export interface AbstractDataThemeConfig {
  /**
   * Visual motion intensity.
   * - `full` (default): HUD surface — animated hex grid, scanline, holographic shimmer, glitch.
   * - `calm`: Blueprint surface — same palette and fonts, no animations.
   *
   * `full` automatically degrades to `calm` behavior when the user's OS reports
   * `prefers-reduced-motion: reduce`.
   */
  motion?: 'full' | 'calm';

  /**
   * "Built by Abstract Data" credit in the footer.
   * - `auto` (default): show on Abstract Data properties, hideable per-project.
   * - `hide`: omit entirely (for white-label client work).
   *
   * Wired in Round 3b.
   */
  credit?: 'auto' | 'hide';
}

const PLUGIN_NAME = '@abstractdata/starlight-theme';

/**
 * Abstract Data Starlight theme plugin.
 *
 * @example
 * ```js
 * // astro.config.mjs
 * import abstractData from '@abstractdata/starlight-theme';
 *
 * starlight({
 *   plugins: [abstractData({ motion: 'full' })],
 * });
 * ```
 */
export default function abstractDataTheme(
  opts: AbstractDataThemeConfig = {},
): StarlightPlugin {
  const motion = opts.motion ?? 'full';
  const credit = opts.credit ?? 'auto';

  return {
    name: PLUGIN_NAME,
    hooks: {
      'config:setup'({ updateConfig, logger }) {
        const customCss: string[] = [
          '@abstractdata/starlight-theme/styles/theme.css',
        ];
        if (motion === 'full') {
          customCss.push('@abstractdata/starlight-theme/styles/hud.css');
        }

        updateConfig({
          customCss,
        });

        logger.info(
          `Abstract Data theme loaded · motion: ${motion} · credit: ${credit}`,
        );
      },
    },
  };
}
