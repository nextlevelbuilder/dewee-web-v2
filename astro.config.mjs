// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import seoPostbuild from "./scripts/astro-seo-postbuild.mjs";

// Public origin used for canonical URLs, sitemap and social cards.
// Staging overrides it through the SITE_URL build env so canonical tags stay truthful.
const site = process.env.SITE_URL || "https://dewee.sh";

export default defineConfig({
  site,
  output: "server",
  trailingSlash: "never",
  build: { format: "file" },
  adapter: cloudflare({
    imageService: "passthrough",
    sessionKVBindingName: "SESSION",
  }),
  // After the build: Markdown twins, social cards, the page manifest and llms-full (see the script).
  integrations: [seoPostbuild()],
  i18n: {
    locales: ["en", "vi"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  // Docs code blocks: Shiki emits CSS variables so colours follow the site tokens in both themes.
  markdown: { shikiConfig: { theme: "css-variables" } },
  // Fonts are downloaded at build time and self-hosted: no visitor IP ever reaches Google.
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Newsreader",
      cssVariable: "--font-display",
      weights: [400, 500, 600],
      styles: ["normal", "italic"],
      subsets: ["latin", "latin-ext", "vietnamese"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Be Vietnam Pro",
      cssVariable: "--font-body",
      weights: [400, 500, 600, 700],
      styles: ["normal", "italic"],
      subsets: ["latin", "latin-ext", "vietnamese"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Playwrite VN",
      cssVariable: "--font-hand",
      weights: [300, 400],
      styles: ["normal"],
      subsets: ["fallback"],
      fallbacks: ["cursive"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      weights: [400, 500],
      styles: ["normal"],
      subsets: ["latin", "latin-ext", "vietnamese"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],
  vite: {
    build: { assetsInlineLimit: 2048 },
  },
});
