/**
 * Virtual module exposed by @abstractdata/starlight-theme.
 * Available inside Astro components after the plugin is registered.
 *
 * Reference this in your project's `env.d.ts`:
 * ```ts
 * /// <reference types="@abstractdata/starlight-theme/types" />
 * ```
 */
declare module 'virtual:abstractdata/config' {
  export const config: {
    motion: 'full' | 'calm';
    credit: 'auto' | 'hide';
    version: string | null;
  };
}
