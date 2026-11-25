import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { installAgentPrompt } from "~/content/install-agent-prompt";
import { SELF_INSTALL } from "~/content/site";
import { LOCALES } from "~/i18n/config";

const installer = readFileSync(new URL("../public/install.sh", import.meta.url), "utf8");

describe("install agent prompt", () => {
  for (const locale of LOCALES) {
    const prompt = installAgentPrompt(locale);
    it(`${locale}: carries the real install commands and port`, () => {
      expect(prompt).toContain(SELF_INSTALL.commands.script);
      for (const cmd of [...SELF_INSTALL.commands.docker, ...SELF_INSTALL.commands.dockerWindows]) expect(prompt).toContain(cmd);
      expect(prompt).toContain(String(SELF_INSTALL.port));
      expect(prompt).not.toMatch(/\{(script|docker|windows|port|url)\}/);
    });
    it(`${locale}: only names installer options that install.sh accepts`, () => {
      const flags = new Set(prompt.match(/--[a-z][a-z-]+/g) ?? []);
      for (const flag of flags) {
        if (["--purpose"].includes(flag)) continue; // `dewee selfhost access-link` option, not the installer's
        expect(installer, flag).toContain(flag);
      }
    });
  }
});
