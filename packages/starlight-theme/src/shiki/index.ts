/**
 * Branded Shiki / expressive-code themes.
 *
 * The theme plugin applies these by default. Consumers can opt out by
 * passing their own `expressiveCode.themes` in `astro.config.mjs` —
 * Starlight's config wins over plugin defaults.
 *
 * @example
 * ```js
 * import { abstractDataThemes } from '@abstractdata/starlight-theme/shiki';
 *
 * starlight({
 *   expressiveCode: { themes: abstractDataThemes },
 * });
 * ```
 */
export { abstractDataDark } from './abstract-data-dark.ts';
export { abstractDataLight } from './abstract-data-light.ts';

import { abstractDataDark } from './abstract-data-dark.ts';
import { abstractDataLight } from './abstract-data-light.ts';

/** Tuple [dark, light] suitable for Starlight's `expressiveCode.themes`. */
export const abstractDataThemes = [abstractDataDark, abstractDataLight] as const;
