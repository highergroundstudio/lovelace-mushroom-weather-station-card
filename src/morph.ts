/**
 * Minimal DOM morphing: patch an existing subtree so it matches new HTML
 * without throwing away nodes that did not change.
 *
 * Replacing `innerHTML` on every sensor tick destroyed and rebuilt every
 * element — that flickered, dropped keyboard focus, restarted hover and CSS
 * transitions, and cost noticeable CPU on wall tablets. Morphing keeps the
 * same element instances, so focus, `:hover`, and running transitions survive.
 *
 * Children are matched by a key (`data-morph-key`, `data-section`, or
 * `data-key` + `data-entity`) when present, otherwise by position and tag.
 */

function keyOf(node: Node): string | null {
  if (node.nodeType !== 1) return null;
  const el = node as Element;
  const explicit = el.getAttribute("data-morph-key");
  if (explicit) return `m:${explicit}`;
  const section = el.getAttribute("data-section");
  if (section) return `s:${section}`;
  const key = el.getAttribute("data-key");
  if (key) return `k:${el.tagName}:${key}:${el.getAttribute("data-entity") || ""}`;
  return null;
}

function sameKind(a: Node, b: Node): boolean {
  if (a.nodeType !== b.nodeType) return false;
  if (a.nodeType === 1) {
    const ea = a as Element;
    const eb = b as Element;
    return ea.tagName === eb.tagName && ea.namespaceURI === eb.namespaceURI;
  }
  return true;
}

function syncAttributes(from: Element, to: Element): void {
  const next = to.attributes;
  for (let i = 0; i < next.length; i++) {
    const attr = next[i];
    if (from.getAttributeNS(attr.namespaceURI, attr.localName) !== attr.value) {
      if (attr.namespaceURI) from.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
      else from.setAttribute(attr.name, attr.value);
    }
  }
  const prev = from.attributes;
  for (let i = prev.length - 1; i >= 0; i--) {
    const attr = prev[i];
    if (!to.hasAttributeNS(attr.namespaceURI, attr.localName)) {
      from.removeAttributeNS(attr.namespaceURI, attr.localName);
    }
  }
  // Keep live properties in step for form controls.
  if (from instanceof HTMLInputElement && to instanceof HTMLInputElement) {
    if (from.value !== to.value) from.value = to.value;
    if (from.checked !== to.checked) from.checked = to.checked;
  }
}

function morphNode(from: Node, to: Node): void {
  if (from.nodeType === 3 || from.nodeType === 8) {
    if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue;
    return;
  }
  if (from.nodeType !== 1) return;
  syncAttributes(from as Element, to as Element);
  // Custom elements (ha-icon, ha-switch, …) manage their own children; the
  // template only ever sets their attributes.
  if ((from as Element).tagName.includes("-")) return;
  morphChildren(from, to);
}

type MoveCapable = Node & { moveBefore?: (node: Node, child: Node | null) => void };

/**
 * Move a node without resetting its state where the browser supports
 * `moveBefore` (Chrome 133+). `insertBefore` detaches the node first, which
 * blurs it; `morph()` restores focus afterwards for that fallback.
 */
function moveBefore(parent: Node, node: Node, ref: Node | null): void {
  const p = parent as MoveCapable;
  if (typeof p.moveBefore === "function") {
    try {
      p.moveBefore(node, ref);
      return;
    } catch {
      /* e.g. moving across documents — fall back */
    }
  }
  parent.insertBefore(node, ref);
}

/** Patch `parent`'s children to match `next`'s children (both are containers). */
export function morphChildren(parent: Node, next: Node): void {
  const oldKeyed = new Map<string, Node>();
  for (let c = parent.firstChild; c; c = c.nextSibling) {
    const k = keyOf(c);
    if (k && !oldKeyed.has(k)) oldKeyed.set(k, c);
  }

  let cursor: Node | null = parent.firstChild;
  let incoming: Node | null = next.firstChild;
  while (incoming) {
    const following: Node | null = incoming.nextSibling;
    const key = keyOf(incoming);
    let match: Node | null = null;

    if (key) {
      const candidate = oldKeyed.get(key);
      if (candidate && sameKind(candidate, incoming)) {
        match = candidate;
        oldKeyed.delete(key);
      }
    } else if (cursor && !keyOf(cursor) && sameKind(cursor, incoming)) {
      match = cursor;
    }

    if (match) {
      if (match !== cursor) moveBefore(parent, match, cursor);
      else cursor = cursor.nextSibling;
      morphNode(match, incoming);
    } else {
      // Adopt the freshly parsed node as-is.
      parent.insertBefore(incoming, cursor);
    }
    incoming = following;
  }

  // Anything left after the cursor (or unmatched keyed nodes) is stale.
  while (cursor) {
    const after: Node | null = cursor.nextSibling;
    parent.removeChild(cursor);
    cursor = after;
  }
  for (const stale of oldKeyed.values()) {
    if (stale.parentNode === parent) parent.removeChild(stale);
  }
}

/** Replace the contents of `target` with `html`, reusing unchanged nodes. */
export function morph(target: Element | ShadowRoot | DocumentFragment, html: string): void {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const root = target.getRootNode() as Document | ShadowRoot;
  const focused = (root as { activeElement?: Element | null }).activeElement as HTMLElement | null;
  morphChildren(target, tpl.content);
  // If a reorder detached the focused element, give focus back.
  if (focused && focused.isConnected && target.contains(focused) && root.activeElement !== focused) {
    focused.focus({ preventScroll: true });
  }
}
