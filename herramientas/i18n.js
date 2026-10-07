// Traducción de páginas generadas: unidades de texto (bloques con texto propio y solo etiquetas en línea),
// atributos legibles y cadenas de JavaScript. Las etiquetas en línea se reemplazan por marcadores <bN>…</bN>
// para que las traducciones no dependan de clases ni enlaces.
const VOID = new Set("area base br col embed hr img input link meta source track wbr".split(" "));
const RAW = new Set(["script", "style", "textarea"]);
const INLINE = new Set("a abbr b bdi bdo br cite code data dfn em i kbd mark q s samp small span strong sub sup time u var wbr output".split(" "));
const ATTRS = ["alt", "title", "aria-label", "placeholder"];

function parse(html) {
  const root = { tag: "#root", children: [], start: 0, innerStart: 0, innerEnd: html.length, end: html.length };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/gi;
  let last = 0, m;
  const text = (a, b) => { if (b > a) stack[stack.length - 1].children.push({ text: html.slice(a, b), start: a, end: b }); };
  while ((m = re.exec(html))) {
    text(last, m.index);
    last = re.lastIndex;
    if (!m[2]) continue; // comentario o doctype
    const tag = m[2].toLowerCase();
    if (m[1]) {
      let i = stack.length - 1;
      while (i > 0 && stack[i].tag !== tag) i--;
      if (i > 0) {
        for (let j = stack.length - 1; j >= i; j--) { stack[j].innerEnd = stack[j].innerEnd ?? m.index; stack[j].end = re.lastIndex; }
        stack[i].innerEnd = m.index;
        stack.length = i;
      }
      continue;
    }
    const attrs = [];
    const are = /([^\s=>\/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let a;
    const attrStart = m.index + 1 + m[2].length;
    while ((a = are.exec(m[3]))) {
      const name = a[1].toLowerCase();
      const value = a[3] ?? a[4] ?? a[5] ?? "";
      let vStart = -1;
      if (a[2] !== undefined) vStart = attrStart + a.index + a[0].indexOf(a[2]) + (a[3] !== undefined || a[4] !== undefined ? 1 : 0);
      attrs.push({ name, value, vStart, vEnd: vStart + value.length });
    }
    const node = { tag, attrs, start: m.index, innerStart: re.lastIndex, children: [] };
    stack[stack.length - 1].children.push(node);
    if (VOID.has(tag) || m[4]) { node.innerEnd = node.innerStart; node.end = re.lastIndex; continue; }
    if (RAW.has(tag)) {
      const close = html.toLowerCase().indexOf("</" + tag, re.lastIndex);
      node.innerEnd = close;
      node.end = html.indexOf(">", close) + 1;
      node.raw = html.slice(node.innerStart, close);
      re.lastIndex = last = node.end;
      continue;
    }
    stack.push(node);
  }
  text(last, html.length);
  return root;
}

const hasText = (s) => /[A-Za-zÀ-ÿ¿¡]/.test(s.replace(/&[a-z]+;|&#\d+;/gi, ""));
function inlineOnly(n) {
  return n.children.every((c) => c.text !== undefined || ((INLINE.has(c.tag) || c.tag === "svg") && (c.tag === "svg" || inlineOnly(c))));
}

// Marcadores: <bN>…</bN> por cada etiqueta en línea, <iN/> por cada svg o etiqueta vacía
function toKey(html, node) {
  const tags = [];
  let out = "";
  const walk = (n) => {
    for (const c of n.children) {
      if (c.text !== undefined) { out += c.text; continue; }
      const k = tags.length;
      if (c.tag === "svg" || VOID.has(c.tag)) { tags.push(html.slice(c.start, c.end)); out += `<i${k}/>`; continue; }
      tags.push([html.slice(c.start, c.innerStart), html.slice(c.innerEnd, c.end)]);
      out += `<b${k}>`; walk(c); out += `</b${k}>`;
    }
  };
  walk(node);
  const lead = out.match(/^\s*/)[0], trail = out.match(/\s*$/)[0];
  return { key: norm(out), tags, lead, trail };
}
const norm = (s) => s.replace(/\s+/g, " ").trim();
function fromKey(tr, tags) {
  return tr
    .replace(/<i(\d+)\/>/g, (_, k) => tags[k])
    .replace(/<b(\d+)>/g, (_, k) => tags[k][0])
    .replace(/<\/b(\d+)>/g, (_, k) => tags[k][1]);
}

// Recorre el body y devuelve las piezas a traducir con su posición en el HTML
function units(html) {
  const root = parse(html);
  const out = [];
  const visit = (n, inHead) => {
    if (n.tag === "head") inHead = true;
    if (n.tag !== "#root" && n.attrs) {
      for (const a of n.attrs) {
        if (!inHead && ATTRS.includes(a.name) && hasText(a.value) && a.vStart >= 0) out.push({ type: "attr", key: norm(a.value), start: a.vStart, end: a.vEnd, lead: "", trail: "" });
      }
    }
    if (n.raw !== undefined) { if (n.tag === "script" && !inHead && !/type="application\/ld\+json"/.test(html.slice(n.start, n.innerStart))) out.push({ type: "script", node: n }); return; }
    if (!n.children) return;
    if (inHead) { n.children.forEach((c) => visit(c, true)); return; }
    const direct = n.children.some((c) => c.text !== undefined && hasText(c.text));
    if (direct && n.tag !== "#root" && inlineOnly(n)) {
      const k = toKey(html, n);
      out.push({ type: "unit", key: k.key, tags: k.tags, lead: k.lead, trail: k.trail, start: n.innerStart, end: n.innerEnd, attrsInside: collectAttrs(n) });
      return;
    }
    for (const c of n.children) {
      if (c.text !== undefined) { if (hasText(c.text)) out.push({ type: "text", key: norm(c.text), start: c.start, end: c.end, lead: c.text.match(/^\s*/)[0], trail: c.text.match(/\s*$/)[0] }); }
      else visit(c, inHead);
    }
  };
  const collectAttrs = (n) => {
    const res = [];
    const walk = (x) => { for (const c of x.children || []) { if (c.attrs) for (const a of c.attrs) if (ATTRS.includes(a.name) && hasText(a.value)) res.push(norm(a.value)); walk(c); } };
    walk(n);
    return res;
  };
  visit(root, false);
  return out;
}

// Cadenas de JS con texto para personas (con espacio o tilde y alguna letra), sin rutas ni selectores
const JS_STR = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'/g;
function jsStrings(code) {
  const res = [];
  let m;
  while ((m = JS_STR.exec(code))) {
    const raw = m[1] ?? m[2];
    let val;
    try { val = JSON.parse('"' + raw.replace(/\\'/g, "'").replace(/(^|[^\\])"/g, '$1\\"') + '"'); } catch { val = raw; }
    if (!/[a-záéíóúñ]/i.test(val) || !/[ áéíóúñ¿¡]/.test(val) || /^[\w.#\-\[\]="':>\s,()*]+$/.test(val) && !/ [a-záéíóúñ]+ /i.test(val)) continue;
    if (/^(\.|#|\[|<|\/|https?:)/.test(val.trim()) || /\b(querySelector|function|return)\b/.test(val)) continue;
    res.push({ value: val, start: m.index, end: m.index + m[0].length, quote: m[0][0] });
  }
  return res;
}

module.exports = { parse, units, fromKey, norm, jsStrings, hasText };
