/*
 * Agrega una "huella" a cada CSS y JS que cargan las páginas:
 *     href="/assets/css/cauce.css"  ->  href="/assets/css/cauce.css?v=3fa9c12e"
 *
 * Por qué: el .htaccess le pide al navegador guardar CSS y JS por 1 semana (sitio rápido),
 * pero el HTML no se guarda. Sin huella, después de un deploy el visitante recibe HTML nuevo
 * con CSS viejo y el sitio se ve "dañado" hasta que su navegador lo renueve.
 * La huella sale del contenido del archivo: si no cambió, es la misma y se sigue usando la
 * copia guardada; si cambió, el navegador lo ve como un archivo nuevo y lo descarga al instante.
 *
 * Se ejecuta en el deploy a producción, sobre public_html/ (no se hace commit del resultado).
 * Uso: node herramientas/versionar-assets.js
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PUBLIC = path.resolve(__dirname, "..", "public_html");
const huellas = new Map();

function huella(archivo) {
  if (!huellas.has(archivo)) {
    huellas.set(archivo, fs.existsSync(archivo)
      ? crypto.createHash("sha256").update(fs.readFileSync(archivo)).digest("hex").slice(0, 8)
      : null);
  }
  return huellas.get(archivo);
}

let paginas = 0, referencias = 0;
const faltantes = new Set();

function procesar(dir) {
  for (const nombre of fs.readdirSync(dir)) {
    const ruta = path.join(dir, nombre);
    if (fs.statSync(ruta).isDirectory()) { procesar(ruta); continue; }
    if (!nombre.endsWith(".html")) continue;

    const original = fs.readFileSync(ruta, "utf8");
    // Solo rutas locales a .css/.js sin "?" (no toca https://, ni // externos, ni lo ya versionado)
    const nuevo = original.replace(/\b(href|src)="((?!https?:|\/\/)[^"?#]+\.(?:css|js))"/g, (todo, attr, url) => {
      const archivo = url.startsWith("/") ? path.join(PUBLIC, url) : path.resolve(path.dirname(ruta), url);
      const h = huella(archivo);
      if (!h) { faltantes.add(url); return todo; }
      referencias++;
      return `${attr}="${url}?v=${h}"`;
    });
    if (nuevo !== original) { fs.writeFileSync(ruta, nuevo); paginas++; }
  }
}

procesar(PUBLIC);
for (const [archivo, h] of huellas) if (h) console.log(`  ${h}  ${path.relative(PUBLIC, archivo)}`);
if (faltantes.size) console.warn(`::warning::Referencias a archivos que no existen: ${[...faltantes].join(", ")}`);
console.log(`${referencias} referencias versionadas en ${paginas} páginas`);
