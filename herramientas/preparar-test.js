/*
 * Prepara una copia de public_html/ para el ambiente de pruebas (GitHub Pages).
 *
 * El sitio está pensado para vivir en la raíz del dominio (href="/tienda/").
 * En test vive dentro de una carpeta (test-paginas.cauce-ingenieria.com/landings/),
 * así que esta copia:
 *   1. Antepone la carpeta a todas las rutas absolutas:  /tienda/ -> /landings/tienda/
 *   2. Cambia las URLs de producción por rutas del ambiente de test.
 *   3. Apaga Google Analytics / Ads (no ensuciar las métricas reales).
 *   4. Le pide a Google que NO indexe test (robots.txt + meta noindex).
 *   5. Muestra una franja "Ambiente de pruebas" para que nadie lo confunda con producción.
 *
 * public_html/ NO se modifica: producción sigue igual.
 *
 * Uso:  node herramientas/preparar-test.js <carpeta-destino> <base>
 * Ej.:  node herramientas/preparar-test.js _site /landings/
 */
const fs = require("fs");
const path = require("path");

const ORIGEN = path.resolve(__dirname, "..", "public_html");
const DESTINO = path.resolve(process.argv[2] || "_site");
let BASE = process.argv[3] || "/landings/";
if (!BASE.startsWith("/")) BASE = "/" + BASE;
if (!BASE.endsWith("/")) BASE += "/";

const PROD = "https://cauce-ingenieria.com/";
const OMITIR = new Set([".htaccess", "sitemap.xml"]); // solo sirven en GoDaddy / producción

const FRANJA = `
<div style="position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#F0C070;color:#1d2b24;font:600 13px/1.4 system-ui,sans-serif;text-align:center;padding:6px 12px;box-shadow:0 -2px 8px rgba(0,0,0,.15)">
  Ambiente de pruebas · los cambios aún no están publicados en cauce-ingenieria.com
</div>`;

// Atributos que llevan rutas. data-page queda igual: es el nombre de página para Analytics.
const ATRIBUTOS = /\b(href|src|action|content|srcset|poster)="\/(?!\/)/g;

function html(texto) {
  return texto
    .replace(ATRIBUTOS, `$1="${BASE}`)          // 1. rutas absolutas
    .split(PROD).join(BASE)                      // 2. URLs de producción (canonical, hreflang, JSON-LD...)
    .replace(/<meta\s+name="robots"[^>]*>\s*/gi, "")                                // 4. quita el robots de producción…
    .replace(/<head>/i, `<head>\n<meta name="robots" content="noindex, nofollow">`) //    …y pone noindex
    .replace(/<\/body>/i, `${FRANJA}\n</body>`); // 5.
}

function js(texto, archivo) {
  let t = texto.replace(/(["'`])\/tienda\//g, `$1${BASE}tienda/`); // CSV e imágenes de la tienda
  if (archivo === "medicion.js") {
    t = t.replace(/GA4_ID:\s*"[^"]*"/, 'GA4_ID: "G-XXXXXXXXXX"')  // 3. con XXXX no se carga Google
         .replace(/ADS_ID:\s*"[^"]*"/, 'ADS_ID: "AW-XXXXXXXXXX"');
  }
  return t;
}

function copiar(dirOrigen, dirDestino) {
  fs.mkdirSync(dirDestino, { recursive: true });
  for (const nombre of fs.readdirSync(dirOrigen)) {
    if (OMITIR.has(nombre)) continue;
    const de = path.join(dirOrigen, nombre);
    const a = path.join(dirDestino, nombre);
    if (fs.statSync(de).isDirectory()) { copiar(de, a); continue; }

    const ext = path.extname(nombre).toLowerCase();
    if (ext === ".html") fs.writeFileSync(a, html(fs.readFileSync(de, "utf8")));
    else if (ext === ".js") fs.writeFileSync(a, js(fs.readFileSync(de, "utf8"), nombre));
    else if (ext === ".css") fs.writeFileSync(a, fs.readFileSync(de, "utf8").replace(/url\((["']?)\/(?!\/)/g, `url($1${BASE}`));
    else fs.copyFileSync(de, a);
  }
}

fs.rmSync(DESTINO, { recursive: true, force: true });
copiar(ORIGEN, DESTINO);
fs.writeFileSync(path.join(DESTINO, "robots.txt"), "User-agent: *\nDisallow: /\n"); // 4.
console.log(`Sitio de pruebas listo en ${DESTINO} (base ${BASE})`);
