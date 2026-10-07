// Rastrea el sitio local: enlaces internos, recursos, anclas, SEO básico y JSON-LD
const BASE = "http://127.0.0.1:8765";
const seen = new Map();
const queue = ["/"];
const problems = [];
const seo = [];

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"');

async function get(url) {
  const r = await fetch(BASE + url);
  return { status: r.status, type: r.headers.get("content-type") || "", text: r.headers.get("content-type")?.includes("html") ? await r.text() : "" };
}

(async () => {
  const sitemap = await (await fetch(BASE + "/sitemap.xml")).text();
  for (const m of sitemap.matchAll(/<loc>https:\/\/cauce-ingenieria\.com([^<]*)<\/loc>/g)) queue.push(m[1]);
  queue.push("/404.html");

  while (queue.length) {
    const raw = queue.shift();
    const [url, hash] = raw.split("#");
    const key = url || "/";
    if (!seen.has(key)) {
      const res = await get(key);
      seen.set(key, res);
      if (res.status !== 200) { problems.push(`${res.status} ${key}`); continue; }
      if (res.type.includes("html")) {
        const html = res.text;
        const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
        const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
        const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || "";
        const h1s = (html.match(/<h1[\s>]/g) || []).length;
        seo.push({ url: key, titleLen: decode(title).length, descLen: decode(desc).length, h1s, canon });
        for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
          try { JSON.parse(m[1]); } catch (e) { problems.push(`JSON-LD inválido en ${key}: ${e.message}`); }
        }
        const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
        for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
          const v = decode(m[1]);
          if (/^(https?:|mailto:|tel:|data:)/.test(v)) continue;
          if (v.startsWith("#")) { if (v.length > 1 && !ids.has(v.slice(1))) problems.push(`ancla rota ${v} en ${key}`); continue; }
          queue.push(v.startsWith("/") ? v : key.replace(/[^/]*$/, "") + v);
        }
      }
    }
    if (hash && seen.get(key)?.text && !new RegExp(`\\sid="${hash}"`).test(seen.get(key).text)) problems.push(`ancla rota #${hash} en ${key}`);
  }
  console.log("Recursos revisados:", seen.size);
  console.table(seo);
  console.log(problems.length ? "PROBLEMAS:\n" + [...new Set(problems)].join("\n") : "Sin enlaces rotos.");
})();
