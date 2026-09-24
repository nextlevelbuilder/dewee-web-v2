/** Types for front-matter.js (the CLI is plain ESM JavaScript with JSDoc; tests import it from TS). */
export type Scalar = string | number | boolean | null | Scalar[];
export type FrontMatter = Record<string, Scalar | Record<string, Scalar>>;
export function parseScalar(raw: string): Scalar;
export function parseFrontMatter(source: string): { data: FrontMatter; body: string };
