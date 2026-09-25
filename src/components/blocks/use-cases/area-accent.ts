/**
 * One accent per kind of work, used by use-case cards, the notebook label and the timetable.
 * Values are existing design tokens only, set as an inline `--area` custom property so every
 * block reads the same colour without duplicating a lookup table in CSS.
 */
import type { UseCaseArea } from "~/content/use-cases";

export const AREA_ACCENT: Record<UseCaseArea, string> = {
  operations: "var(--accent)",
  customers: "var(--bronze)",
  marketing: "var(--warning)",
  research: "var(--success)",
  make: "var(--ink-2)",
};

export const areaStyle = (area: UseCaseArea) => `--area: ${AREA_ACCENT[area]}`;

/** Two-digit exercise number, like "07" in a school notebook. */
export const exerciseNo = (n: number) => String(n).padStart(2, "0");
