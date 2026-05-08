import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

/**
 * Mirrors the create-docs template scaffold so the playground exercises
 * the same shape consumers ship. Theme-managed fields (`version`,
 * `versionLabel`, `versionDefault`) are written by the autodoc
 * orchestrators on per-version API pages and consumed by `<VersionPicker>`
 * for auto-discovery — keep them optional here.
 */
export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        category: z.string().optional(),
        audience: z.enum(['user', 'contributor', 'maintainer']).optional(),
        lastReviewed: z.coerce.date().optional(),
        version: z.string().optional(),
        versionLabel: z.string().optional(),
        versionDefault: z.boolean().optional(),
      }),
    }),
  }),
};
