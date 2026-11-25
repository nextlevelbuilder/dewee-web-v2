/**
 * Product facts quoted across the site. Every page that states one of these numbers reads it
 * from here, so a release refresh changes one file. Provenance and the refresh routine live in
 * docs/marketing-facts.md; update both together.
 */
import { CHANNELS, PROVIDERS } from "~/content/integrations";

export const FACTS = {
  /** Latest stable runtime release (GitHub releases, nextlevelbuilder/dewee, checked 2026-10-29). */
  stableRelease: { version: "3.43.0", date: "2026-10-29" },
  /** Chat channels in the catalogue; it mirrors the adapters in the runtime's internal/channels. */
  channels: CHANNELS.length,
  /** Featured model providers: the vendors the site names (PROVIDERS), not the runtime's provider types. */
  providers: PROVIDERS.length,
  /**
   * Provider types the runtime accepts as `provider_type`: 32 keys in `store.ValidProviderTypes`
   * (internal/store/provider_store.go) at tag v3.43.0, verified 2026-10-29. PROVIDER_TYPES lists
   * them and a test keeps the two in step.
   */
  providerTypes: 32,
  /**
   * Go test functions (`func Test…`) in the runtime, counted at v3.40.0 and rounded down for copy (v3.42.0 has 15,358, so "13,000+" stays true).
   * The full suite runs on one preflighted commit before every release, not on every pull request.
   */
  goTests: { measured: 13_351, rounded: "13,000+", roundedVi: "13.000+" },
  /** Lines of Go under internal/, counted at v3.40.0, tests included, rounded down for copy (v3.42.0 has 1,081,907, so "900,000+" stays true). */
  goLines: { measured: 921_264, rounded: "900,000+", roundedVi: "900.000+" },
} as const;
