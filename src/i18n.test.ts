import { describe, expect, it } from "vitest";
import de from "./i18n/de";
import en from "./i18n/en";
import es from "./i18n/es";
import fr from "./i18n/fr";
import nl from "./i18n/nl";
import { makeTranslator, resolveLanguage, translate } from "./i18n";
import { fmtNum } from "./helpers";

describe("i18n", () => {
  it("resolves regional and unknown languages", () => {
    expect(resolveLanguage("de-AT")).toBe("de");
    expect(resolveLanguage("pt-BR")).toBe("en");
    expect(resolveLanguage(undefined)).toBe("en");
  });

  it("fills placeholders and keeps unknown ones", () => {
    expect(translate("en", "graph.title", { name: "Outdoor" })).toBe("Outdoor history");
    expect(translate("en", "hint.setup", { example: "ws" })).toContain("{prefix}");
  });

  it("falls back to English per key", () => {
    const t = makeTranslator("de");
    expect(t("section.rain")).toBe("Regen");
    // Editor help text is not translated in de yet.
    expect(t("editor.sw_tablet_help")).toBe(en["editor.sw_tablet_help"]);
  });

  it("only uses keys that exist in English", () => {
    for (const table of [de, fr, es, nl]) {
      for (const key of Object.keys(table)) expect(en).toHaveProperty(key);
    }
  });

  it("translates every card (non-editor) string", () => {
    const cardKeys = Object.keys(en).filter((k) => !k.startsWith("editor."));
    for (const [name, table] of Object.entries({ de, fr, es, nl })) {
      const missing = cardKeys.filter((k) => !(k in table) && !["tile.uv", "tile.pm25", "tile.aqi", "tile.voc", "tile.co2", "graph.min", "graph.max", "health.battery_ok", "header.feels"].includes(k));
      expect({ name, missing }).toEqual({ name, missing: [] });
    }
  });

  it("formats decimals for the locale", () => {
    expect(fmtNum(21.5, 1, "de")).toBe("21,5");
    expect(fmtNum(21.5, 1, "en")).toBe("21.5");
    expect(fmtNum(1234.5, 1, "de")).toBe("1234,5");
    expect(fmtNum(2, 1, "fr")).toBe("2");
  });
});
