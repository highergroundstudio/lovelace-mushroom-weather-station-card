// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { morph } from "./morph";

describe("morph", () => {
  it("keeps unchanged nodes and patches text/attributes", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    morph(root, `<button class="tile" data-key="a" data-entity="x">1</button><p>hi</p>`);
    const btn = root.querySelector("button")!;
    morph(root, `<button class="tile on" data-key="a" data-entity="x">2</button><p>hi</p>`);
    expect(root.querySelector("button")).toBe(btn);
    expect(btn.className).toBe("tile on");
    expect(btn.textContent).toBe("2");
  });

  it("matches keyed nodes across reorders and removals", () => {
    const root = document.createElement("div");
    morph(root, `<section data-section="a"></section><section data-section="b"></section><section data-section="c"></section>`);
    const [a, , c] = Array.from(root.children);
    morph(root, `<section data-section="c"></section><section data-section="a"></section>`);
    expect(Array.from(root.children)).toEqual([c, a]);
  });

  it("does not touch custom element children", () => {
    const root = document.createElement("div");
    morph(root, `<ha-icon icon="mdi:a"></ha-icon>`);
    const icon = root.firstElementChild!;
    icon.innerHTML = "<svg></svg>";
    morph(root, `<ha-icon icon="mdi:b"></ha-icon>`);
    expect(root.firstElementChild).toBe(icon);
    expect(icon.getAttribute("icon")).toBe("mdi:b");
    expect(icon.innerHTML).toBe("<svg></svg>");
  });

  it("keeps focus on a patched element", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    morph(root, `<button data-key="t" data-entity="e">A</button>`);
    const btn = root.querySelector("button")!;
    btn.focus();
    morph(root, `<div class="hint">x</div><button data-key="t" data-entity="e">B</button>`);
    expect(document.activeElement).toBe(btn);
  });
});
