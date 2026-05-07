/**
 * Ambient type stubs.
 *
 * Starlight's published `.ts` source files (referenced transitively when we
 * `import type { StarlightPlugin } from '@astrojs/starlight/types'`) depend
 * on Astro's runtime virtual modules and a `StarlightApp` global namespace
 * that only exist inside a real Astro build context.
 *
 * `skipLibCheck` only suppresses `.d.ts` checking — Starlight ships actual
 * `.ts` sources, so TypeScript dives into them during our package's
 * typecheck and complains that those modules don't resolve. These stubs
 * tell TypeScript "trust me, those modules exist at runtime" so the
 * typecheck of our own thin plugin code passes cleanly.
 *
 * No runtime impact — this file declares types only.
 */

declare module 'astro:content';
declare module 'virtual:starlight/user-config';
declare module 'virtual:starlight/project-context';
declare module 'virtual:starlight/plugin-translations';

declare module '*.jsonc?raw' {
  const raw: string;
  export default raw;
}

declare module '*.json?raw' {
  const raw: string;
  export default raw;
}

declare namespace StarlightApp {
  // Starlight references this namespace in createTranslationSystem.ts
  // for the i18n strings system. We don't use it ourselves; an empty
  // declaration satisfies the typechecker.
  interface I18n {
    // intentionally empty — Starlight's user augments this in their own d.ts
  }
}
