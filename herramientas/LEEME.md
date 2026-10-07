# Herramientas del sitio

Scripts que generan `public_html/` a partir de los diseños originales (`diseños/`) y de las traducciones (`traducciones/`). No se suben al hosting.

## Uso

```
cd herramientas
npm install          # solo la primera vez (instala puppeteer-core para las pruebas)
npm run generar      # regenera public_html/ en español, inglés y portugués
npm run servir       # sirve el sitio en http://127.0.0.1:8765 (requiere Python)
npm run probar       # en otra terminal, con el sitio servido: enlaces, SEO y pruebas de la tienda
```

Las pruebas usan Google Chrome instalado. Si está en otra ruta: `CHROME="ruta/a/chrome" npm run probar`.

## Archivos

| Archivo | Qué genera |
| --- | --- |
| `build.js` | Todo el sitio: página principal, capacitaciones, 404, sitemap, robots, .htaccess y las versiones traducidas |
| `lib.js` | Plantilla común: menú, pie, cabecera SEO y datos estructurados de la empresa |
| `rutas.html` | Sección "Por dónde empezar" de la página principal |
| `pages-consultoria.js` | Consultoría TI y su armador de piezas |
| `pages-servicios.js` | Las 9 páginas de servicio de consultoría |
| `pages-tienda.js` | La tienda (los productos salen del CSV, no de aquí) |
| `traducir.js`, `i18n.js` | Versiones en inglés y portugués |
| `check.js`, `e2e.js` | Pruebas |

## Reglas que el generador hace cumplir

- **Sin rayas** (— y –) en ningún texto: si aparece una, la generación se detiene.
- **Todo texto nuevo en español necesita su traducción.** Si cambias o agregas un texto en una página que tiene versión en inglés y portugués, `npm run generar` se detiene y lista lo que falta. Agrégalo en `traducciones/en.json` y `traducciones/pt.json`, en la sección `textos`, con el texto en español como clave. Los marcadores como `<b0>…</b0>` o `<i1/>` representan negritas, enlaces o saltos de línea y deben quedar iguales en la traducción.
- La página principal sale del diseño original sin cambios visibles, salvo los ajustes listados en `build.js`.
