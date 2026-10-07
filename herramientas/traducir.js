// Genera las versiones en inglés y portugués de las páginas en español
const fs = require("fs");
const path = require("path");
const I = require("./i18n");

const SITE = "https://cauce-ingenieria.com";
const LANGS = { en: { html: "en", og: "en_US", ld: "en" }, pt: { html: "pt-BR", og: "pt_BR", ld: "pt-BR" } };

// Rutas: español → inglés / portugués
const RUTAS = {
  "/": { en: "/en/", pt: "/pt/" },
  "/capacitaciones/": { en: "/en/training/", pt: "/pt/capacitacoes/" },
  "/consultoria-ti/": { en: "/en/it-consulting/", pt: "/pt/consultoria-ti/" },
  "/consultoria-ti/consultoria-tecnologica/": { en: "/en/it-consulting/technology-consulting/", pt: "/pt/consultoria-ti/consultoria-tecnologica/" },
  "/consultoria-ti/arquitectura-de-software-y-redes/": { en: "/en/it-consulting/software-and-network-architecture/", pt: "/pt/consultoria-ti/arquitetura-de-software-e-redes/" },
  "/consultoria-ti/desarrollo-de-software/": { en: "/en/it-consulting/software-development/", pt: "/pt/consultoria-ti/desenvolvimento-de-software/" },
  "/consultoria-ti/paginas-web-y-tiendas-en-linea/": { en: "/en/it-consulting/websites-and-online-stores/", pt: "/pt/consultoria-ti/sites-e-lojas-virtuais/" },
  "/consultoria-ti/automatizacion-rpa-e-ia/": { en: "/en/it-consulting/automation-rpa-and-ai/", pt: "/pt/consultoria-ti/automacao-rpa-e-ia/" },
  "/consultoria-ti/pruebas-de-software/": { en: "/en/it-consulting/software-testing/", pt: "/pt/consultoria-ti/testes-de-software/" },
  "/consultoria-ti/auditoria-de-seguridad-y-pentest/": { en: "/en/it-consulting/security-audit-and-pentest/", pt: "/pt/consultoria-ti/auditoria-de-seguranca-e-pentest/" },
  "/consultoria-ti/infraestructura-y-redes/": { en: "/en/it-consulting/infrastructure-and-networks/", pt: "/pt/consultoria-ti/infraestrutura-e-redes/" },
  "/consultoria-ti/soporte-ti/": { en: "/en/it-consulting/it-support/", pt: "/pt/consultoria-ti/suporte-ti/" },
};

// Traducciones: traducciones/<idioma>.json, con el texto en español como clave
function cargarDiccionario(dir) {
  const dic = {}, datos = {}, extra = {};
  for (const lang of Object.keys(LANGS)) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, lang + ".json"), "utf8"));
    dic[lang] = new Map(Object.entries(j.textos));
    datos[lang] = new Map(Object.entries(j.capacitaciones));
    extra[lang] = { meta: j.cabeceras, whatsapp: j.whatsapp, configurador: j.configurador, ld: j.datosEstructurados, ogImageAlt: j.textoAlternativoImagen };
  }
  return { dic, datos, extra };
}

const marcas = (s) => (s.match(/<\/?[bi]\d+\/?>/g) || []).sort().join("");
const sinMarcas = (s) => I.norm(s.replace(/<\/?[bi]\d+\/?>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&"));

function traducirPagina(html, esPath, lang, D, faltan) {
  const dic = D.dic[lang];
  const X = D.extra[lang];
  const ruta = (p) => {
    const [base, hash] = p.split("#");
    const destino = RUTAS[base] && RUTAS[base][lang];
    return destino ? destino + (hash !== undefined ? "#" + hash : "") : p;
  };
  const tr = (k, donde) => {
    if (dic.has(k)) return dic.get(k);
    faltan.add(`[${lang}] ${donde}: ${k}`);
    return k;
  };

  // 1) Atributos legibles del body
  let out = html;
  let us = I.units(out).filter((u) => u.type === "attr").sort((a, b) => b.start - a.start);
  for (const u of us) out = out.slice(0, u.start) + tr(u.key, esPath + " (atributo)").replace(/"/g, "&quot;") + out.slice(u.end);

  // 2) Unidades de texto
  us = I.units(out).filter((u) => u.type === "unit" || u.type === "text").sort((a, b) => b.start - a.start);
  for (const u of us) {
    const t = tr(u.key, esPath);
    if (u.type === "unit" && marcas(t) !== marcas(u.key)) faltan.add(`[${lang}] marcadores distintos en: ${u.key}`);
    const nuevo = u.type === "unit" ? I.fromKey(t, u.tags) : t;
    out = out.slice(0, u.start) + u.lead + nuevo + u.trail + out.slice(u.end);
  }

  // 3) Configurador de capacitaciones: datos y textos del código
  if (esPath === "/capacitaciones/") {
    out = out.replace(/const PROGRAMS = (\[[\s\S]*?\]);\n/, (m, json) => {
      const data = JSON.parse(json);
      const walk = (v) => {
        if (typeof v === "string") {
          if (D.datos[lang].has(v)) return D.datos[lang].get(v);
          if (X.ld[v] !== undefined) return X.ld[v];
          if (/^\d+h$/.test(v) || /^[a-z0-9_-]+$/.test(v) || !/[a-záéíóúñ]/i.test(v)) return v;
          faltan.add(`[${lang}] dato del configurador: ${v}`);
          return v;
        }
        if (Array.isArray(v)) return v.map(walk);
        if (v && typeof v === "object") { const o = {}; for (const k in v) o[k] = k === "id" ? v[k] : walk(v[k]); return o; }
        return v;
      };
      return `const PROGRAMS = ${JSON.stringify(walk(data))};\n`;
    });
    for (const [a, b] of X.configurador) {
      if (!out.includes(a)) faltan.add(`[${lang}] código del configurador sin encontrar: ${a}`);
      out = out.split(a).join(b);
    }
  }

  // 4) Mensajes de WhatsApp
  out = out.replace(/(https:\/\/wa\.me\/\d+\?text=)([^"'&\s]+)/g, (m, pre, q) => {
    const texto = decodeURIComponent(q);
    if (!X.whatsapp[texto]) { faltan.add(`[${lang}] mensaje de WhatsApp: ${texto}`); return m; }
    return pre + encodeURIComponent(X.whatsapp[texto]);
  });

  // 5) Enlaces internos y recursos relativos de la página principal
  out = out.replace(/(href|src)="(assets\/[^"]*)"/g, '$1="/$2"');
  out = out.replace(/href="(\/[^"]*)"/g, (m, p) => `href="${ruta(p)}"`);
  out = out.replace(/href="#cafe" class="nav-cta"/, 'href="#cafe" class="nav-cta"');

  // 6) Cabecera
  const meta = X.meta[esPath];
  if (!meta) faltan.add(`[${lang}] meta de ${esPath}`);
  const url = SITE + RUTAS[esPath][lang];
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  out = out.replace(/<html lang="[^"]*">/, `<html lang="${LANGS[lang].html}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(meta.description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(meta.ogTitle || meta.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(meta.ogDescription || meta.description)}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(meta.ogTitle || meta.title)}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(meta.ogDescription || meta.description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:locale" content=")[^"]*/, `$1${LANGS[lang].og}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:image:alt" content=")[^"]*/, `$1${esc(X.ogImageAlt)}`);

  // 7) Datos estructurados
  const derivado = new Map();
  for (const [k, v] of dic) derivado.set(sinMarcas(k), sinMarcas(v));
  for (const [k, v] of D.datos[lang]) { derivado.set(k, v); derivado.set(k.replace(/^(Sesión|Bloque) (\d+|única): /, ""), v.replace(/^(Session|Sessão|Block|Bloco|Single session|Sessão única) ?(\d+)?: /, "")); }
  const esTitulo = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const esDesc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (esTitulo) derivado.set(I.norm(esTitulo.replace(/&amp;/g, "&")), meta.title);
  if (esDesc) derivado.set(I.norm(esDesc.replace(/&amp;/g, "&")), meta.description);
  out = out.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, a, json, c) => {
    const data = JSON.parse(json);
    const walk = (v, key) => {
      if (typeof v === "string") {
        if (key === "url" || key === "item" || key === "@id") { const u = v.replace(SITE, ""); const t = RUTAS[u.split("#")[0]]; return t ? SITE + t[lang] + (u.includes("#") ? "#" + u.split("#")[1] : "") : v; }
        if (key === "inLanguage") return LANGS[lang].ld;
        if (["@type", "@context", "email", "telephone", "logo", "image", "opens", "closes", "timeRequired", "dayOfWeek", "addressCountry", "addressLocality", "addressRegion", "priceRange", "legalName"].includes(key)) return v;
        if (!/[a-záéíóúñ]/i.test(v) || /^https?:/.test(v)) return v;
        const n = I.norm(v);
        if (X.ld[n] !== undefined) return X.ld[n];
        if (derivado.has(n)) return derivado.get(n);
        faltan.add(`[${lang}] JSON-LD (${key}): ${n}`);
        return v;
      }
      if (Array.isArray(v)) return v.map((x) => walk(x, key));
      if (v && typeof v === "object") { const o = {}; for (const k in v) o[k] = walk(v[k], k); return o; }
      return v;
    };
    return a + "\n" + JSON.stringify(walk(data), null, 1) + "\n" + c;
  });
  return out;
}

// Etiquetas hreflang para las tres versiones de una página
function hreflang(esPath) {
  const r = RUTAS[esPath];
  return [
    `<link rel="alternate" hreflang="es" href="${SITE}${esPath}">`,
    `<link rel="alternate" hreflang="en" href="${SITE}${r.en}">`,
    `<link rel="alternate" hreflang="pt" href="${SITE}${r.pt}">`,
    `<link rel="alternate" hreflang="x-default" href="${SITE}${esPath}">`,
  ].join("\n");
}
const conHreflang = (html, esPath) => html.replace(/(<link rel="canonical"[^>]*>)/, `$1\n${hreflang(esPath)}`);

module.exports = { RUTAS, LANGS, cargarDiccionario, traducirPagina, conHreflang };
