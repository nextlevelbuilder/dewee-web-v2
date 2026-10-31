/**
 * Product facts quoted across the site. Every page that states one of these numbers reads it
 * from here, so a release refresh changes one file. Provenance and the refresh routine live in
 * docs/marketing-facts.md; update both together.
 */
import { CHANNELS, PROVIDERS } from "~/content/integrations";

export const FACTS = {
  /** Latest stable runtime release (GitHub releases, nextlevelbuilder/dewee, 2026-10-15). */
  stableRelease: { version: "3.40.0", date: "2026-10-15" },
  /** Chat channels in the catalogue; it mirrors the adapters in the runtime's internal/channels. */
  channels: CHANNELS.length,
  /** Model providers in the catalogue (internal/providers). */
  providers: PROVIDERS.length,
  /**
   * Go test functions (`func Test…`) in the runtime at the stable tag, rounded down for copy.
   * The full suite runs on one preflighted commit before every release, not on every pull request.
   */
  goTests: { measured: 13_351, rounded: "13,000+", roundedVi: "13.000+" },
  /** Lines of Go under internal/ at the stable tag, tests included, rounded down for copy. */
  goLines: { measured: 921_264, rounded: "900,000+", roundedVi: "900.000+" },
} as const;
