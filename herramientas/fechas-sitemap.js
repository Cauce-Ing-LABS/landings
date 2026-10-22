/*
 * Pone en sitemap.xml la fecha REAL en que cambió cada página, según Git.
 *
 * build.js le pone a todas las URLs la fecha del día en que se generó el sitio.
 * Google aprende a ignorar un <lastmod> que siempre cambia en todas las páginas;
 * con fechas reales, revisa primero lo que de verdad cambió.
 *
 * Se ejecuta en el deploy a producción (necesita el historial completo de Git).
 * Uso: node herramientas/fechas-sitemap.js
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const RAIZ = path.resolve(__dirname, "..");
const PUBLIC = path.join(RAIZ, "public_html");
const SITEMAP = path.join(PUBLIC, "sitemap.xml");

function archivoDe(url) {
  const ruta = decodeURIComponent(new URL(url).pathname);           // /tienda/
  return path.join(PUBLIC, ruta.endsWith("/") ? ruta + "index.html" : ruta);
}

function fechaGit(archivo) {
  const rel = path.relative(RAIZ, archivo).split(path.sep).join("/");
  // %cs = fecha del commit en formato AAAA-MM-DD
  return execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], { cwd: RAIZ, encoding: "utf8" }).trim();
}

let cambiadas = 0;
const xml = fs.readFileSync(SITEMAP, "utf8").replace(
  /<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g,
  (todo, loc, actual) => {
    const archivo = archivoDe(loc);
    const fecha = fs.existsSync(archivo) ? fechaGit(archivo) : "";
    if (!fecha) { console.warn(`  sin fecha en Git, se deja ${actual}: ${loc}`); return todo; }
    if (fecha !== actual) cambiadas++;
    console.log(`  ${fecha}  ${loc}`);
    return `<url><loc>${loc}</loc><lastmod>${fecha}</lastmod>`;
  }
);
fs.writeFileSync(SITEMAP, xml);
console.log(`sitemap.xml: ${cambiadas} fechas actualizadas`);
