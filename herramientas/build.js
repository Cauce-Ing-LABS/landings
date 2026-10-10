const fs = require("fs");
const path = require("path");
const L = require("./lib");
const TIENDA = require("./pages-tienda");
const CONSULTORIA = require("./pages-consultoria");
const SERVICIOS = require("./pages-servicios");

const REPO = path.resolve(__dirname, "..");
const OUT = path.join(REPO, "public_html");
const SRC = path.join(REPO, "diseños", "Línea base de diseños Web Caucha");

// En español no se usa la raya: títulos de sección sin ella, "Sesión 1: …" y comas en el texto corrido
function sinRayas(html) {
  const out = html
    .replace(/>— /g, ">")
    .replace(/((?:Sesión|Bloque) (?:\d+|única)) — /g, "$1: ")
    .replace(/publicidad — nosotros/g, "publicidad: nosotros")
    .replace(/ — /g, ", ")
    .replace(/(\d)–(\d)/g, "$1 a $2");
  const resto = out.match(/.{0,40}[—–].{0,40}/);
  if (resto) throw new Error("Quedó una raya: " + resto[0]);
  return out;
}

function conIdioma(html) {
  if (html.includes("assets/js/idioma.js")) return html;
  return html.replace(/(<script src="(\/?)assets\/js\/medicion\.js"><\/script>)/, '$1\n<script src="$2assets/js/idioma.js"></script>');
}

function write(rel, content) {
  if (rel.endsWith(".html")) content = conIdioma(sinRayas(content));
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log("ok", rel, content.length);
}

function replaceOnce(html, from, to, label) {
  const i = typeof from === "string" ? html.indexOf(from) : html.search(from);
  if (i === -1) throw new Error("No se encontró: " + label);
  return html.replace(from, to);
}

/* ======================= LANDING ======================= */
// Parte de Paginas Publicas/cauce.html sin cambiar su contenido visible:
// CSS → assets/css/cauce.css, scripts → assets/js/main.js, imágenes → assets/img/,
// y una cabecera nueva con SEO + medición (assets/js/medicion.js).
function landing() {
  const orig = fs.readFileSync(path.join(SRC, "Pagina Web Cauce.html"), "utf8").replace(/\r\n/g, "\n");
  let body = orig.match(/<body>\n?([\s\S]*?)<\/body>/)[1];

  // Imágenes incrustadas en base64 → archivos (mismo alt original)
  const imgs = [["Caucha saludando", "caucha-saludo.png"], ["Caucha", "caucha-nosotros.png"], ["Caucha celebrando un momento de claridad", "caucha-celebra.png"]];
  for (const [alt, file] of imgs) {
    body = replaceOnce(body, new RegExp(`src="data:image/png;base64,[^"]+" alt="${alt}"`), `src="assets/img/${file}" alt="${alt}"`, alt);
  }
  if (body.includes("base64,")) throw new Error("Quedó una imagen en base64");

  // Scripts en línea → assets/js/main.js (mismo código)
  const inline = [...body.matchAll(/<script(?: type="text\/javascript")?>([\s\S]*?)<\/script>/g)];
  if (inline.length !== 2) throw new Error("Se esperaban 2 scripts en línea, hay " + inline.length);
  const mainJs = "/* Cauce · scripts de la página principal (los mismos que tenía cauce.html) */\n\n" +
    "// Aparición suave al hacer scroll\n" + inline[0][1].trim() + "\n\n" +
    "// Globo de Calendly\n" + inline[1][1].trim() + "\n";
  write("assets/js/main.js", mainJs);
  for (const m of inline) body = body.replace(m[0], "");
  body = body.replace(/\n{3,}/g, "\n\n");

  // "Qué hacemos juntos" (pilares) se retira: su contenido vive ahora en "Cómo trabajamos"
  body = replaceOnce(body, /<section id="pilares"[\s\S]*?<\/section>\s*/, "", "sección pilares");
  body = replaceOnce(body, '<a href="#pilares">Qué hacemos</a>', '<a href="#servicios">Qué hacemos</a>', "menú qué hacemos");
  body = body.replace(/<a href="#pilares">(Datos|Procesos|Ingeniería)<\/a>/g, '<a href="#metodo">$1</a>');
  if (body.includes("#pilares")) throw new Error("Quedó un enlace a #pilares");

  // La URL de LinkedIn del original da 404; la real lleva la tilde codificada
  body = replaceOnce(body, "linkedin.com/company/cauce-ingenieria-s-a-s", "linkedin.com/company/cauce-ingenier%C3%ADa-s-a-s", "enlace LinkedIn");

  // Páginas web y tiendas en línea sí se hacen (como ingeniería); publicidad y redes no
  body = replaceOnce(body,
    "No hacemos publicidad, Instagram ni anuncios. Nos enfocamos en lo que pasa <em>dentro</em> del negocio: los datos, los procesos internos y la tecnología que los sostiene.",
    "No hacemos publicidad, Instagram ni anuncios. Nos enfocamos en lo que pasa <em>dentro</em> del negocio. Tu página web o tu tienda en línea sí la construimos, pero como ingeniería: conectada a tus datos y tus procesos.",
    "anti-agencia");
  body = replaceOnce(body,
    'Quieres "una página web por 500 mil pesos" sin entender tu negocio.',
    "Quieres una página web de plantilla, hecha sin que nadie entienda tu negocio.",
    "no es para ti: web");
  body = replaceOnce(body,
    "<summary>¿Hacen marketing, publicidad o manejo de redes?</summary>\n        <p>No. Nos enfocamos en lo que pasa adentro del negocio: datos, procesos internos y tecnología. Si lo que buscas es publicidad o manejo de redes, te recomendamos buenas agencias del Valle que sí se especializan en eso.</p>",
    "<summary>¿Hacen páginas web, marketing o manejo de redes?</summary>\n        <p>Páginas web y tiendas en línea sí: las diseñamos, las conectamos a tus pedidos, inventario y WhatsApp, y las administramos como webmaster. Marketing, publicidad y manejo de redes no; para eso te recomendamos buenas agencias del Valle que sí se especializan en eso.</p>",
    "faq marketing");
  // Cobertura: principalmente Colombia y Latinoamérica; virtual en cualquier país
  body = replaceOnce(body, "Para pymes, comerciantes y emprendedores en Colombia</span>", "Para pymes, comerciantes y emprendedores en Colombia y Latinoamérica</span>", "eyebrow cobertura");
  body = replaceOnce(body, "pero trabajamos con clientes en toda Colombia.", "pero trabajamos con clientes en toda Colombia y Latinoamérica, y de forma virtual en cualquier país.", "faq cobertura");
  body = body.split("para pymes, comerciantes y emprendedores en Colombia. Trabajamos contigo").join("para pymes, comerciantes y emprendedores en Colombia y Latinoamérica. Trabajamos contigo");
  // Público objetivo: tiendas en línea y físicas, negocios populares y emprendedores
  body = replaceOnce(body,
    "Ferretería, restaurante, consultorio, distribuidora, taller, agencia, lo que sea.",
    "Tienda física o en línea, negocio de barrio, ferretería, restaurante, consultorio, distribuidora, taller, lo que sea.",
    "perfil A");

  // Sin la etiqueta "01 · Diagnóstico" sobre "¿En qué estado está el cauce de tu negocio?"
  body = replaceOnce(body, /\s*<p class="mono"[^>]*>01 · Diagnóstico<\/p>/, "", "etiqueta 01 diagnóstico");

  // Automatización: scripting en lugar de Make
  body = replaceOnce(body, "herramientas como n8n, Make, o programación a la medida", "herramientas como n8n o scripting a la medida", "faq make");
  if (/\bMake\b/.test(body)) throw new Error("Quedó una mención a Make");

  // "Cómo trabajamos": cada paso explica qué hacemos y cuál es su resultado (diagrama o informe)
  const V = 'stroke="#0fb8d9" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const PASOS = {
    "Diagnóstico": {
      hacemos: ["Conversación con el dueño y el equipo", "Revisión de las herramientas, datos y procesos que ya tienes", "Identificación de puntos débiles, fugas y cosas por mejorar"],
      resultado: "Informe de diagnóstico: puntos débiles y oportunidades de mejora, priorizados en una hoja de ruta por retorno de inversión.",
      viz: `<rect x="8" y="6" width="44" height="52" rx="4" ${V}/><path d="M16 18 H36 M16 28 H40 M16 38 H32" ${V}/><circle cx="62" cy="44" r="12" ${V}/><path d="M71 53 L80 62" ${V}/><path d="M58 40 L66 48 M66 40 L58 48" stroke="#e08a4a" stroke-width="2" stroke-linecap="round"/>`,
    },
    "Datos": {
      hacemos: ["Mapa de actores: quién genera, usa y decide con cada dato", "Dónde se pierde la información, qué calidad tiene y qué conviene medir", "Integración de lo que hoy está en Siigo, Alegra, WhatsApp u hojas de cálculo"],
      resultado: "Diagrama de actores y flujos de información: quién genera cada dato, por dónde viaja y dónde se pierde.",
      viz: `<circle cx="14" cy="14" r="6" ${V}/><path d="M6 30 C6 22 22 22 22 30" ${V}/><circle cx="14" cy="48" r="6" ${V}/><path d="M6 64 C6 56 22 56 22 64" ${V}/><path d="M28 20 L52 32 M28 52 L52 40" ${V}/><ellipse cx="68" cy="26" rx="12" ry="4" ${V}/><path d="M56 26 V46 C56 51 80 51 80 46 V26" ${V}/>`,
    },
    "Procesos": {
      hacemos: ["Levantamiento de los procesos clave tal como funcionan hoy", "Rediseño quitando pasos que sobran y cuellos de botella", "Automatización solo de lo que debe automatizarse (n8n o scripting a la medida)"],
      resultado: "Diagramas BPMN de tus procesos: cómo funcionan hoy y cómo deberían fluir.",
      viz: `<circle cx="8" cy="34" r="5" ${V}/><path d="M13 34 H20" ${V}/><rect x="20" y="24" width="18" height="20" rx="3" ${V}/><path d="M38 34 H44" ${V}/><path d="M52 26 L60 34 L52 42 L44 34 Z" ${V}/><path d="M60 34 H66 M52 26 V12 H66" ${V}/><rect x="66" y="4" width="12" height="14" rx="2" ${V}/><circle cx="72" cy="34" r="5" stroke="#0fb8d9" stroke-width="3.5" fill="none"/>`,
    },
    "Ingeniería": {
      hacemos: ["Arquitectura de sistemas, red e infraestructura antes de construir", "Software a la medida, integraciones e inteligencia artificial aplicada", "Implementación y monitoreo, codo a codo con tu equipo"],
      resultado: "Diagramas de arquitectura de tus sistemas, de tu red e infraestructura, y la solución funcionando con tu equipo usándola.",
      viz: `<path d="M30 14 A8 8 0 0 1 46 12 A7 7 0 0 1 56 20 H28 A5 5 0 0 1 30 14 Z" ${V}/><path d="M42 20 V30" ${V}/><rect x="32" y="30" width="20" height="10" rx="2" ${V}/><path d="M42 40 V46 M14 46 H70 M14 46 V52 M42 46 V52 M70 46 V52" ${V}/><rect x="6" y="52" width="16" height="12" rx="2" ${V}/><rect x="34" y="52" width="16" height="12" rx="2" ${V}/><rect x="62" y="52" width="16" height="12" rx="2" ${V}/>`,
      link: ["/consultoria-ti/", "Ver las piezas de ingeniería"],
    },
  };
  for (const [paso, d] of Object.entries(PASOS)) {
    const extra = `
        <ul class="metodo-hacemos">
          ${d.hacemos.map((x) => `<li>${x}</li>`).join("\n          ")}
        </ul>
        <div class="metodo-resultado">
          <svg viewBox="0 0 86 68" aria-hidden="true">${d.viz}</svg>
          <p><span>Resultado</span>${d.resultado}</p>
        </div>${d.link ? `
        <a class="metodo-link" href="${d.link[0]}">${d.link[1]} →</a>` : ""}`;
    body = replaceOnce(body, new RegExp(`(<h4>${paso}</h4>\\s*<p>[\\s\\S]*?</p>)`), (m) => m + extra, "paso " + paso);
  }
  // El "Resultado: hoja de ruta clara" original queda dentro del nuevo resultado del Diagnóstico
  body = replaceOnce(body, /\s*<p class="duration">Resultado: hoja de ruta clara<\/p>/, "", "duración diagnóstico");

  // Sección nueva "Por dónde empezar", justo antes del Café Cauce
  body = replaceOnce(body, '<section id="cafe"', fs.readFileSync(path.join(__dirname, "rutas.html"), "utf8") + '<section id="cafe"', "sección café");

  // Datos estructurados
  const faqs = [...body.matchAll(/<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g)].map((m) => [m[1], m[2]]);
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      L.ORG,
      { "@type": "WebSite", "@id": `${L.SITE}/#sitio`, url: `${L.SITE}/`, name: "Cauce", inLanguage: "es-CO", publisher: { "@id": `${L.SITE}/#organizacion` } },
      L.ldFaq(faqs),
    ],
  };

  const title = "Cauce | Consultoría TI, automatización e IA en Cali";
  const description = "Consultoría TI, automatización de procesos, IA, desarrollo de software, ciberseguridad y capacitaciones para pymes en Colombia, Latinoamérica y el mundo.";
  const ogTitle = "Cauce · Tu negocio no necesita más tecnología. Necesita un cauce.";
  const ogDesc = "Un equipo de ingenieros expertos en TI que trabaja codo a codo contigo. Identificamos las fugas, organizamos tus datos, limpiamos los procesos y aplicamos la tecnología que de verdad mueve la aguja.";

  const html = `<!DOCTYPE html>
<html lang="es-CO">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${L.esc(title)}</title>
<meta name="description" content="${L.esc(description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${L.SITE}/">
<meta name="theme-color" content="#0d1b2a">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Cauce">
<meta property="og:locale" content="es_CO">
<meta property="og:title" content="${L.esc(ogTitle)}">
<meta property="og:description" content="${L.esc(ogDesc)}">
<meta property="og:url" content="${L.SITE}/">
<meta property="og:image" content="${L.SITE}/assets/img/og-cauce.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Cauce · Ingeniería para que tu negocio fluya">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${L.esc(ogTitle)}">
<meta name="twitter:description" content="${L.esc(ogDesc)}">
<meta name="twitter:image" content="${L.SITE}/assets/img/og-cauce.png">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/img/favicon-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/cauce.css">
<link rel="stylesheet" href="assets/css/servicios.css">

<script type="application/ld+json">
${JSON.stringify(graph, null, 1)}
</script>
</head>
<body data-page="/">
${body.trim()}

<script src="assets/js/medicion.js"></script>
<script src="assets/js/main.js"></script>
</body>
</html>
`;
  write("index.html", html);
}

/* ======================= CAPACITACIONES ======================= */
function capacitaciones() {
  const src = fs.readFileSync(path.join(SRC, "cauce-configurador-capacitaciones.html"), "utf8");
  let css = src.match(/<style>([\s\S]*?)<\/style>/)[1];
  let body = src.match(/<body>([\s\S]*?)<\/body>/)[1];

  // CSS: quitar lo que ahora viene del layout compartido y renombrar el hero
  css = css
    .replace(/\s*\.topbar\{[^}]*\}/, "")
    .replace(/\s*\.brand\{[^}]*\}/, "")
    .replace(/\s*\.brand \.dot\{[^}]*\}/, "")
    .replace(/\s*\.topbar-label\{[^}]*\}/, "")
    .replace(/\s*footer\{[^}]*\}/, "")
    .replace(/\s*body\{[^}]*\}/, "\n  body.cfg-page{background: var(--paper-warm); padding-bottom:112px;}")
    .replace(/body\{padding-bottom:270px;\}/, "body.cfg-page{padding-bottom:270px;}")
    .replace(/\.hero\{/g, ".cfg-hero{")
    .replace(/\.hero h1/g, ".cfg-hero h1")
    .replace(/\.hero p/g, ".cfg-hero p")
    .replace(/\.hero-eyebrow\{/g, ".cfg-hero .hero-eyebrow{")
    .replace(/\s*\.mono\{[^}]*\}/, "")
    .replace(/\s*a\{color:inherit;\}/, "");
  css += `
  .cfg-page .wa-float{display:none;}
  .cfg-page .dock{z-index:150;}
  .ldur, .dock-price .amount{font-family:var(--mono);}
  .cfg-hero .hero-eyebrow{justify-content:center;}
  .cfg-hero .breadcrumb ol{justify-content:center;}
`;
  for (const k of [".topbar{", "footer{", ".hero{"]) if (css.includes(k)) throw new Error("CSS capacitaciones aún tiene " + k);

  // Cuerpo: sin topbar ni footer propio; hero con palabra clave
  body = replaceOnce(body, /\s*<div class="topbar">[\s\S]*?<\/div>\s*<\/div>/, "", "topbar");
  body = replaceOnce(body, /\s*<footer>[\s\S]*?<\/footer>/, "", "footer");
  const crumbs = [["Inicio", "/"], ["Capacitaciones", "/capacitaciones/"]];
  body = replaceOnce(body,
    /<section class="hero">\s*<div class="hero-eyebrow"><span class="pulse"><\/span>Escuela Cauce<\/div>\s*<h1>Arma la <em>ruta<\/em> de tu equipo<\/h1>/,
    `<section class="cfg-hero">
    <div class="hero-eyebrow"><span class="pulse"></span>Escuela Cauce · Capacitaciones empresariales en Cali</div>
    <h1>Capacitación para tu empresa: arma la <em>ruta</em> de tu equipo</h1>`,
    "hero capacitaciones");
  body = body.replace(/class="ldur mono"/g, 'class="ldur"').replace('class="amount mono"', 'class="amount"');
  body = replaceOnce(body, 'id="waBtn" href="#"', 'id="waBtn" href="#" data-cotizador data-ubicacion="dock"', "waBtn");
  body = replaceOnce(body,
    "navigator.clipboard.writeText(buildMensaje()).then(() => {",
    "navigator.clipboard.writeText(buildMensaje()).then(() => {\n    if (window.cauce) window.cauce.track(\"copiar_resumen\", { cotizador: \"capacitaciones\" });",
    "copy track");

  // ---------- Sin costos: el configurador arma la ruta y suma horas, no precios ----------
  const PROGRAMS = JSON.parse(src.match(/const PROGRAMS = (\[[\s\S]*?\]);\n/)[1]);
  // Los costos internos (nómina y viáticos) no se publican en el código de la página
  const publicPrograms = PROGRAMS.map((p) => ({ ...p, niveles: p.niveles.map(({ nomina, viaticos, ...n }) => n) }));
  body = replaceOnce(body, /const PROGRAMS = \[[\s\S]*?\];\n/, () => `const PROGRAMS = ${JSON.stringify(publicPrograms)};\n`, "PROGRAMS");
  const noPrice = [
    ["El precio se ajusta mientras armas la ruta.", "Cuando la tengas lista, envíala y te respondemos con la propuesta."],
    [/<p class="note">Precios de referencia[^<]*<\/p>/, `<p class="note">Grupos de hasta 20 personas por nivel. El nivel 1 siempre es presencial. Para equipos fuera de Cali o grupos más grandes, escríbenos.</p>`],
    ['<div class="amount" id="amount">$0</div>', '<div class="amount" id="amount">0 h</div>'],
    [/const MARGIN_BY_COUNT = [^\n]*\nconst MARGIN_PARCIAL = [^\n]*\n/, ""],
    [`  1: "Precio estándar",\n  2: "Ahorro por paquete — 2 programas completos",\n  3: "Ahorro máximo — los 3 programas completos",`,
     `  1: "Tu ruta · 1 programa completo",\n  2: "Tu ruta · 2 programas completos",\n  3: "Tu ruta · los 3 programas completos",`],
    [/  const totalCosto = [^\n]*\n  const refPrecio = [^\n]*\n/, "  const totalHoras = prog.niveles.reduce((s,n) => s + parseInt(n.dur, 10), 0);\n"],
    ["Programa completo, solo este: <b>${fmt(refPrecio)}</b> + IVA", "Programa completo: <b>${totalHoras} horas</b> en 3 niveles"],
    [/function computePricing\(\)\{[\s\S]*?\n\}\n/, `function computePricing(){
  const completos = []; const parciales = []; let total = 0;
  PROGRAMS.forEach(prog => {
    const s = state[prog.id];
    const activeIdx = [0,1,2].filter(i => s.levels[i]);
    if (activeIdx.length === 0) return;
    total += activeIdx.reduce((sum,i) => sum + parseInt(prog.niveles[i].dur, 10), 0);
    if (activeIdx.length === 3) completos.push({ prog });
    else parciales.push({ prog, activeIdx });
  });
  return { completos, parciales, numCompletos: completos.length, total };
}
`],
    ["    `Precio estimado: ${fmt(total)} + IVA (${fmt(Math.round(total*1.19))} con IVA)`,\n    \"Zona Cali, hasta 20 personas por nivel.\",",
     "    `Total: ${total} horas de capacitación.`,\n    \"\",\n    \"Número de personas: \",\n    \"Ciudad: \","],
    [`"Precio estándar (ruta avanzada)"`, `"Tu ruta a la medida"`],
    [/dockNoteEl\.textContent = parciales\.length > 0\n\s*\? "Los programas completos[^"]*"\n\s*: "";/, `dockNoteEl.textContent = "Envíala y te respondemos con la propuesta.";`],
    [`ivaLineEl.textContent = fmt(Math.round(total * 1.19)) + " con IVA";`, `ivaLineEl.textContent = "de capacitación";`],
    ["amountEl.textContent = fmt(start + (target - start) * eased);", `amountEl.textContent = Math.round(start + (target - start) * eased) + " h";`],
  ];
  for (const [a, b] of noPrice) body = replaceOnce(body, a, b, String(a).slice(0, 50));
  for (const k of ["nomina", "viaticos", "MARGIN", "refPrecio", "IVA", "Precio"]) if (body.includes(k)) throw new Error("Capacitaciones aún contiene: " + k);

  // Programas en texto estático (indexable) generados desde los mismos datos del configurador
  const scriptStart = body.indexOf("<script>");
  const configuratorHtml = body.slice(0, scriptStart);
  const configuratorJs = body.slice(scriptStart);

  const programas = `<section class="section is-paper" id="programas">
  <div class="wrap">
    <div class="section-head">
      <div>
        <p class="mono eyebrow">— Los programas</p>
        <h2>Tres programas,<br><em>tres niveles cada uno.</em></h2>
      </div>
      <p class="lead">Cada programa sigue la misma lógica: el nivel 1 nivela la base, el nivel 2 desarrolla autonomía y el cierre convierte lo aprendido en un plan concreto para tu negocio.</p>
    </div>
    <div class="svc-grid cols-3">
${PROGRAMS.map((p) => `      <article class="svc-card">
        <span class="num-mono">${p.audiencia}</span>
        <h3>${p.nombre}</h3>
        <p>“${p.hook}”</p>
        <ul>
${p.niveles.map((n) => `          <li><strong>${n.nombre}</strong> (${n.dur}): ${n.proposito}</li>`).join("\n")}
        </ul>
      </article>`).join("\n")}
    </div>
  </div>
</section>`;

  const faqs = [
    ["¿Dónde se dictan las capacitaciones?", "Estamos en Cali. El nivel 1 de cada programa siempre es presencial; el nivel 2 y el cierre pueden ser presenciales o virtuales. Para equipos fuera de Cali, escríbenos y lo cotizamos."],
    ["¿Cuántas personas pueden participar?", "Hasta 20 personas por nivel. Para grupos más grandes armamos varias cohortes o una cotización especial."],
    ["¿Tengo que tomar el programa completo?", "No. Puedes elegir niveles sueltos o programas completos. Arma la ruta como la necesites y te enviamos la propuesta."],
    ["¿Qué pasa después del cierre?", "El cierre de cada programa termina con un documento de hallazgos y recomendaciones. Tú decides si lo implementas internamente o si contratas a Cauce para hacerlo."],
  ];

  const bodyHtml = configuratorHtml + "\n" + programas + "\n\n" + L.faqHtml(faqs, { bg: "is-warm" });

  write("capacitaciones/index.html", L.page({
    path: "/capacitaciones/",
    title: "Cursos de ciberseguridad, IA y ofimática en Cali | Cauce",
    description: "Capacitaciones corporativas: Ciberseguridad Esencial, IA para el Día a Día, Ofimática para tu Negocio y más. Presencial en Cali, grupos de hasta 20.",
    bodyClass: "cfg-page",
    conFooter: false,
    waMsg: "Hola Cauce, quiero información sobre las capacitaciones.",
    extraHead: `<style>${css}</style>\n`,
    jsonld: [
      L.ldService({ name: "Capacitaciones empresariales Escuela Cauce", description: "Programas de alfabetización digital, ciberseguridad y adopción de inteligencia artificial para equipos de trabajo, en tres niveles.", path: "/capacitaciones/", serviceType: "Capacitación empresarial" }),
      ...PROGRAMS.map((p) => ({
        "@type": "Course",
        name: p.nombre,
        description: `${p.audiencia} ${p.niveles.map((n) => n.nombre + " (" + n.dur + ")").join(", ")}.`,
        inLanguage: "es",
        provider: { "@id": `${L.SITE}/#organizacion` },
        hasPart: p.niveles.map((n) => ({
          "@type": "Course",
          name: n.nombre,
          description: n.objetivo || n.proposito,
          timeRequired: "PT" + parseInt(n.dur, 10) + "H",
          inLanguage: "es",
          provider: { "@id": `${L.SITE}/#organizacion` },
          ...(n.sesiones ? { syllabusSections: n.sesiones.map((s) => ({ "@type": "Syllabus", name: s.titulo.replace(/^(Sesión|Bloque) (\d+|única) — /, "") })) } : {}),
        })),
      })),
      L.ldBreadcrumb(crumbs),
      L.ldFaq(faqs),
    ],
    body: bodyHtml,
    scripts: configuratorJs + "\n",
  }));
}

/* ======================= 404 ======================= */
function notFound() {
  write("404.html", L.page({
    path: "/404.html",
    title: "Página no encontrada | Cauce",
    description: "La página que buscas no existe o cambió de dirección.",
    robots: "noindex, follow",
    body: `<section class="section notfound is-warm">
  <div class="wrap" style="text-align:center;">
    <img src="/assets/img/caucha-saludo.png" alt="Caucha, la nutria de Cauce" width="520" height="630">
    <p class="mono eyebrow">— Error 404</p>
    <h1 style="font-weight:400; font-size:clamp(2rem,5vw,3.5rem); margin-bottom:1rem;">Este tramo del río <em class="serif" style="color:var(--flow-dark)">no existe.</em></h1>
    <p style="color:var(--ink-soft); max-width:520px; margin:0 auto 2rem;">La página que buscas cambió de dirección o nunca existió. Estas son las rutas más usadas:</p>
    <div class="related" style="justify-content:center;">
      <a href="/">Inicio</a>
      <a href="/capacitaciones/">Capacitaciones</a>
      <a href="/consultoria-ti/">Consultoría TI</a>
      <a href="/tienda/">Tienda de tecnología</a>
    </div>
  </div>
</section>`,
  }));
}

/* ======================= SITEMAP / ROBOTS / HTACCESS ======================= */
function seoFiles(paths) {
  const today = new Date().toISOString().slice(0, 10);
  const prio = (p) => (p === "/" ? "1.0" : p.split("/").length > 3 ? "0.7" : "0.8");
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${L.SITE}${p}</loc><lastmod>${today}</lastmod><priority>${prio(p)}</priority></url>`).join("\n")}
</urlset>
`);
  write("robots.txt", `User-agent: *
Allow: /
Disallow: /404.html

Sitemap: ${L.SITE}/sitemap.xml
`);
  write(".htaccess", `# Cauce · configuración de Apache (hosting cPanel de GoDaddy)
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
  RewriteEngine On

  # HTTPS y dominio sin www. Detrás del firewall de GoDaddy (Sucuri) en modo "HTTPS parcial"
  # la visita llega cifrada al firewall y por HTTP al hosting: el firewall lo avisa con X-Forwarded-Proto
  RewriteCond %{HTTPS} off
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^(.*)$ https://cauce-ingenieria.com/$1 [R=301,L]
  RewriteCond %{HTTP_HOST} ^www\\. [NC]
  RewriteRule ^(.*)$ https://cauce-ingenieria.com/$1 [R=301,L]

  # Nombres de archivo anteriores → URLs nuevas
  RewriteRule ^Cauce(%20|\\s)Landing\\.html$ / [R=301,L,NC]
  RewriteCond %{THE_REQUEST} \\s/(.*/)?index\\.html[\\s?] [NC]
  RewriteRule ^(.*/)?index\\.html$ /$1 [R=301,L,NC]
  RewriteRule ^cauce-configurador-capacitaciones\\.html$ /capacitaciones/ [R=301,L,NC]
  RewriteRule ^lander/?$ / [R=301,L,NC]
  RewriteRule ^licencias-software/?$ /tienda/ [R=301,L,NC]
  RewriteRule ^renting-equipos/?$ /tienda/ [R=301,L,NC]
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript text/javascript application/json image/svg+xml application/xml text/xml text/plain
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 hour"
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/csv "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
  ExpiresByType text/javascript "access plus 1 week"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "SAMEORIGIN"
</IfModule>
`);
}

/* ======================= RUN ======================= */
landing();
capacitaciones();
const generated = [
  CONSULTORIA.consultoria(), ...SERVICIOS.servicios(), TIENDA.tienda(),
];
generated.forEach((g) => write(g.path.replace(/^\//, "") + "index.html", g.html));
notFound();

// Versiones en inglés y portugués (con hreflang en las tres)
const TR = require("./traducir");
const DIC = TR.cargarDiccionario(path.join(REPO, "traducciones"));
const faltan = new Set();
const traducidas = [];
for (const esPath in TR.RUTAS) {
  const file = path.join(OUT, esPath.slice(1), "index.html");
  const es = fs.readFileSync(file, "utf8");
  for (const lang of Object.keys(TR.LANGS)) {
    write(TR.RUTAS[esPath][lang].slice(1) + "index.html", TR.conHreflang(TR.traducirPagina(es, esPath, lang, DIC, faltan), esPath));
    traducidas.push(TR.RUTAS[esPath][lang]);
  }
  fs.writeFileSync(file, TR.conHreflang(es, esPath));
}
if (faltan.size) throw new Error("Textos sin traducir (agrégalos en traducciones/en.json y pt.json):\n" + [...faltan].join("\n"));

seoFiles(["/", "/capacitaciones/", ...generated.map((g) => g.path), ...traducidas]);
