import { convertValue, esc, fmtNum, isRecordSetToday, relativeTime } from "../helpers";
import type { HistoryExtreme } from "../types";
import type { SectionRenderer } from "../view";

export const renderRecords: SectionRenderer = (v, ctx) => {
  if (!v.wantRecords()) return "";
  const { t } = v;
  const book = v.recordsBook;
  const period = v.config.records_period === "year" ? t("records.year") : t("records.month");
  const target = v.config.unit_system || "native";
  const tempSrc = v.conv(ctx.temp, "°F").src || "°F";
  const gustSrc = v.conv(ctx.gust || ctx.maxGust, "mph").src || "mph";
  const rateSrc = v.conv(ctx.rate, "in/h").src || "in/h";
  const rainSrc = v.conv(ctx.today, "in").src || "in";

  const when = (ex: HistoryExtreme) => relativeTime(new Date(ex.at), v.locale);
  const fmt = (ex: HistoryExtreme | null, src: string, digits: number, fallbackUnit: string, isTemp = false) => {
    if (!ex) return { value: "—", when: "" };
    const c = convertValue(ex.value, src, target);
    if (c.value == null) return { value: "—", when: when(ex) };
    const value = isTemp
      ? `${Math.round(c.value)}°`
      : `${fmtNum(c.value, digits)} ${esc(c.unit || fallbackUnit)}`.trim();
    return { value, when: when(ex) };
  };

  if (!book || (!book.hottest && !book.coldest && !book.peakGust && !book.peakRainRate && !book.wettestDay)) {
    return v.wrapSection("records", ctx.compact, `<div class="hint">${esc(t("records.empty", { period: period.toLowerCase() }))}</div>`);
  }

  const rows: Array<{ label: string; ex: HistoryExtreme | null; out: { value: string; when: string } }> = [
    { label: t("records.hottest", { period }), ex: book.hottest, out: fmt(book.hottest, tempSrc, 0, "°", true) },
    { label: t("records.coldest", { period }), ex: book.coldest, out: fmt(book.coldest, tempSrc, 0, "°", true) },
    { label: t("records.peak_gust", { period }), ex: book.peakGust, out: fmt(book.peakGust, gustSrc, 1, "mph") },
    { label: t("records.peak_rate", { period }), ex: book.peakRainRate, out: fmt(book.peakRainRate, rateSrc, 2, "") },
    { label: t("records.wettest", { period }), ex: book.wettestDay, out: fmt(book.wettestDay, rainSrc, 2, "in") },
  ];

  const tiles = rows
    .map(({ label, ex, out }) => {
      // Badge only when the extreme itself landed on today's local calendar day.
      const set = isRecordSetToday(ex);
      return `<div class="record-tile ${set ? "set" : ""}" role="listitem">
        <div class="record-label">${esc(label)}</div>
        <div class="record-value">${out.value}</div>
        ${out.when ? `<div class="record-when">${esc(out.when)}</div>` : ""}
        ${set ? `<span class="record-badge">${esc(t("records.set_today"))}</span>` : ""}
      </div>`;
    })
    .join("");

  const source = v.recordsSource === "history"
    ? `<div class="records-source warn">${esc(t("records.source_history"))}</div>`
    : "";
  return v.wrapSection(
    "records",
    ctx.compact,
    `<div class="records-grid" role="list" aria-label="${esc(t("records.title", { period }))}">${tiles}</div>${source}`,
  );
};
