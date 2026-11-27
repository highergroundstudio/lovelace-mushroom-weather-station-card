import de from "./de";
import en, { type TranslationKey, type Translations } from "./en";
import es from "./es";
import fr from "./fr";
import nl from "./nl";

export type { TranslationKey, Translations };

const LANGS: Record<string, Translations> = { en, de, fr, es, nl };

/** Languages with a translation file, for the editor picker. */
export const LANGUAGES: Array<{ code: string; name: string }> = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "nl", name: "Nederlands" },
];

export type Vars = Record<string, string | number>;
export type Translate = (key: TranslationKey, vars?: Vars) => string;

/** `de-AT` → `de`; unknown languages fall back to English. */
export function resolveLanguage(lang: string | undefined | null): string {
  const base = String(lang || "").toLowerCase().split(/[-_]/)[0];
  return base && LANGS[base] ? base : "en";
}

function fill(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

/**
 * Look up a key for a language, falling back to English and then to the key
 * itself. Returned text is plain (not HTML-escaped).
 */
export function translate(lang: string | undefined, key: TranslationKey, vars?: Vars): string {
  const table = LANGS[resolveLanguage(lang)];
  const template = table[key] ?? en[key] ?? key;
  return fill(template, vars);
}

export function makeTranslator(lang: string | undefined): Translate {
  const code = resolveLanguage(lang);
  return (key, vars) => translate(code, key, vars);
}

export function hasKey(key: string): key is TranslationKey {
  return Object.prototype.hasOwnProperty.call(en, key);
}
