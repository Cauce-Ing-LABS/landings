const SITE = "https://cauce-ingenieria.com";
const WA = "573013682430";
const CALENDLY = "https://calendly.com/cauce-ingenieria/cauce-consultoria-60-min-clon-clon-1";
const EMAIL = "caucha@cauce-ingenieria.com";
const LINKEDIN = "https://www.linkedin.com/company/cauce-ingenier%C3%ADa-s-a-s";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const wa = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

const logo = (inner = "white", size = "") => `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" fill="none"${size} aria-hidden="true">
        <path d="M14 70 H118" stroke="#0fb8d9" stroke-width="6" stroke-linecap="round"/>
        <path d="M50 70 C 58 70 58 100 64 100 H70 C 76 100 76 70 84 70" stroke="#0fb8d9" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M84 70 C 92 70 92 40 98 40 H104 C 110 40 110 70 118 70" stroke="#0fb8d9" stroke-width="6" stroke-linecap="round" fill="none"/>
        <circle cx="14" cy="70" r="4.5" fill="${inner}" stroke="#0fb8d9" stroke-width="3"/>
        <circle cx="50" cy="70" r="4.5" fill="${inner}" stroke="#0fb8d9" stroke-width="3"/>
        <circle cx="84" cy="70" r="4.5" fill="${inner}" stroke="#0fb8d9" stroke-width="3"/>
        <circle cx="67" cy="100" r="3.5" fill="#0fb8d9"/>
        <circle cx="101" cy="40" r="3.5" fill="#0fb8d9"/>
        <circle cx="118" cy="70" r="7" fill="#0fb8d9"/>
      </svg>`;

const WA_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-1-1.1-1.4-1.8-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5s-.6-1.5-.9-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z"/></svg>`;

const NAV_ITEMS = [
  ["/capacitaciones/", "Capacitaciones"],
  ["/consultoria-ti/", "Consultoría TI"],
  ["/tienda/", "Tienda"],
];

const HOME_NAV = [["#metodo", "Cómo trabajamos"], ["#pilares", "Qué hacemos"], ["#nosotros", "Quiénes somos"], ["#faq", "Preguntas"]];

function nav(current, isHome) {
  const links = (isHome ? HOME_NAV : NAV_ITEMS).map(([href, label]) => {
    const active = current && (href === current || current.startsWith(href));
    return `<a href="${href}"${active ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("\n      ");
  const cta = isHome
    ? `<a href="#cafe" class="nav-cta">Café Cauce</a>`
    : `<a href="${CALENDLY}" class="nav-cta" data-calendly data-ubicacion="nav">Café Cauce</a>`;
  return `<nav aria-label="Principal">
  <div class="nav-inner">
    <a href="/" class="brand" aria-label="Cauce, inicio">
      ${logo()}
      <span class="name">cauce<span class="dot">.</span></span>
    </a>
    <div class="nav-links" id="nav-links">
      ${links}
    </div>
    <div class="nav-right">
      ${cta}
      <button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><span></span></button>
    </div>
  </div>
</nav>`;
}

function footer() {
  return `<footer>
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem;">
          ${logo("#0d1b2a", ' width="36" height="36"')}
          <span class="name">cauce<span class="dot">.</span></span>
        </div>
        <p>Datos · Procesos · Ingeniería para pymes, comerciantes y emprendedores en Colombia y Latinoamérica. Trabajamos contigo para que tu negocio fluya.</p>
      </div>
      <div class="footer-col">
        <h5>Servicios</h5>
        <ul>
          <li><a href="/#cafe">Café Cauce</a></li>
          <li><a href="/capacitaciones/">Capacitaciones</a></li>
          <li><a href="/consultoria-ti/">Consultoría TI</a></li>
          <li><a href="/consultoria-ti/paginas-web-y-tiendas-en-linea/">Páginas web y tiendas en línea</a></li>
          <li><a href="/consultoria-ti/automatizacion-rpa-e-ia/">Automatización e IA</a></li>
          <li><a href="/consultoria-ti/soporte-ti/">Soporte TI</a></li>
          <li><a href="/tienda/">Tienda de tecnología</a></li>
          <li><a href="/#metodo">Datos</a></li>
          <li><a href="/#metodo">Procesos</a></li>
          <li><a href="/#metodo">Ingeniería</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>La firma</h5>
        <ul>
          <li><a href="/#metodo">Cómo trabajamos</a></li>
          <li><a href="/#nosotros">Quiénes somos</a></li>
          <li><a href="/#faq">Preguntas</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Contacto</h5>
        <ul>
          <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
          <li><a href="https://wa.me/${WA}" target="_blank" rel="noopener" data-ubicacion="footer">WhatsApp</a></li>
          <li><a href="${LINKEDIN}" target="_blank" rel="noopener">LinkedIn</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Cauce · Cali, Colombia</span>
      <span class="mono">Potenciado por Cauce</span>
    </div>
  </div>
</footer>`;
}

function waFloat(msg) {
  return `<a class="wa-float" href="${wa(msg)}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp" data-ubicacion="flotante">
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.873-1.107zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
  <span class="wa-label">WhatsApp</span>
</a>`;
}

/* Banda final: WhatsApp con mensaje propio + Café Cauce */
function ctaBand({ eyebrow = "— Siguiente paso", h2, p, waMsg, ubicacion }) {
  return `<section class="cta-band section" id="contacto">
  <div class="wrap">
    <div class="cta-band-inner">
      <div>
        <p class="mono eyebrow">${eyebrow}</p>
        <h2>${h2}</h2>
        <p>${p}</p>
        <div class="final-ctas">
          <a href="${wa(waMsg)}" class="btn btn-primary" target="_blank" rel="noopener" data-ubicacion="${ubicacion}-cta">Escríbenos por WhatsApp <span class="arrow">→</span></a>
          <a href="mailto:${EMAIL}" class="btn btn-secondary">${EMAIL}</a>
        </div>
      </div>
      <div class="cafe-box">
        <span class="oferta-tag mono">☕ Punto de partida</span>
        <p style="color:var(--paper); font-size:1.1rem; font-weight:500;">Café Cauce: una hora con un ingeniero</p>
        <div class="price">$15.500 COP</div>
        <ul>
          <li>Conversamos sobre tu negocio y lo que te preocupa</li>
          <li>Te llevas al menos 2 recomendaciones aplicables ese mismo día</li>
          <li>Presencial en Cali o por videollamada</li>
          <li>Si sigues con un diagnóstico, el café se descuenta</li>
        </ul>
        <a href="${CALENDLY}" class="btn-flow" data-calendly data-ubicacion="${ubicacion}-cafe" target="_blank" rel="noopener">Agendar Café Cauce
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10 H 16 M 11 5 L 16 10 L 11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>
    </div>
  </div>
</section>`;
}

function breadcrumb(items) {
  // items: [[label, path|null], ...]  (el último es la página actual)
  const lis = items.map(([label, path], i) =>
    i === items.length - 1 || !path
      ? `<li><span aria-current="page">${label}</span></li>`
      : `<li><a href="${path}">${label}</a></li>`).join("");
  return `<nav class="breadcrumb" aria-label="Migas de pan"><ol>${lis}</ol></nav>`;
}

function faqHtml(faqs, { heading = "Lo que <em>usualmente</em><br>nos preguntan.", eyebrow = "— Preguntas frecuentes", bg = "is-paper" } = {}) {
  return `<section class="faq section ${bg}" id="faq">
  <div class="wrap">
    <div class="section-head" style="margin-bottom: 3rem;">
      <div>
        <p class="mono eyebrow">${eyebrow}</p>
        <h2>${heading}</h2>
      </div>
    </div>
    <div class="faq-list">
${faqs.map(([q, a]) => `      <details class="faq-item">
        <summary>${q}</summary>
        <p>${a}</p>
      </details>`).join("\n")}
    </div>
  </div>
</section>`;
}

const stripTags = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/* ---------- datos estructurados ---------- */
const ORG = {
  "@type": "ProfessionalService",
  "@id": `${SITE}/#organizacion`,
  name: "Cauce Ingeniería",
  legalName: "Cauce Ingeniería S.A.S.",
  url: `${SITE}/`,
  logo: `${SITE}/assets/img/icon-512.png`,
  image: `${SITE}/assets/img/og-cauce.png`,
  slogan: "Ingeniería para que tu negocio fluya",
  email: EMAIL,
  telephone: "+57 301 368 2430",
  priceRange: "$$",
  address: { "@type": "PostalAddress", addressLocality: "Cali", addressRegion: "Valle del Cauca", addressCountry: "CO" },
  areaServed: [{ "@type": "City", name: "Cali" }, { "@type": "State", name: "Valle del Cauca" }, { "@type": "Country", name: "Colombia" }, { "@type": "Place", name: "América Latina" }, { "@type": "Place", name: "Todo el mundo (atención virtual)" }],
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "12:00" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: "+57 301 368 2430",
    email: EMAIL,
    availableLanguage: "Spanish",
  },
  sameAs: [LINKEDIN],
  knowsAbout: [
    "Consultoría TI", "Transformación digital para pymes", "Diagnóstico de procesos", "Gestión de datos", "Modelado de procesos BPMN",
    "Automatización de procesos", "RPA", "n8n", "Inteligencia artificial aplicada", "Agentes de IA",
    "Fábrica de software", "Desarrollo de software a la medida", "Aplicaciones web", "Aplicaciones móviles", "Páginas web corporativas", "Webmaster",
    "Integraciones con Siigo, Alegra y WhatsApp Business", "Arquitectura de software", "Pruebas de calidad de software",
    "Auditoría de seguridad", "OWASP ASVS", "Pentesting", "Ciberseguridad",
    "Redes corporativas", "Servidores y virtualización", "AWS, Google Cloud y Azure", "Monitoreo de infraestructura",
    "Soporte TI en sitio", "Mesa de ayuda", "Capacitación empresarial", "Alfabetización digital", "Ofimática",
    "Venta y alquiler de computadores",
  ],
  audience: {
    "@type": "BusinessAudience",
    audienceType: "Tiendas en línea, tiendas físicas, negocios populares y de barrio, emprendedores y pymes: ferreterías, droguerías, restaurantes, consultorios, distribuidoras, talleres y empresas de 15 a 100 empleados",
  },
};

function ldBreadcrumb(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name: stripTags(name), item: SITE + path })),
  };
}
function ldFaq(faqs) {
  return { "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: stripTags(q), acceptedAnswer: { "@type": "Answer", text: stripTags(a) } })) };
}
function ldService({ name, description, path, serviceType, offers, areaServed = [{ "@type": "Country", name: "Colombia" }, { "@type": "Place", name: "América Latina" }, { "@type": "Place", name: "Todo el mundo (atención virtual)" }] }) {
  const s = {
    "@type": "Service",
    name, description, serviceType,
    url: SITE + path,
    provider: { "@id": `${SITE}/#organizacion` },
    areaServed,
  };
  if (offers) s.offers = offers;
  return s;
}

/* ---------- página completa ---------- */
function page({ path, title, description, bodyClass = "", dataPage, extraHead = "", jsonld = [], body, scripts = "", waMsg = "Hola Cauce", isHome = false, robots = "index, follow", conFooter = true }) {
  const url = SITE + path;
  const graph = { "@context": "https://schema.org", "@graph": [ORG, ...jsonld] };
  return `<!DOCTYPE html>
<html lang="es-CO">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0d1b2a">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Cauce">
<meta property="og:locale" content="es_CO">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/img/og-cauce.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Cauce · Ingeniería para que tu negocio fluya">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}/assets/img/og-cauce.png">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/img/favicon-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/cauce.css">
<link rel="stylesheet" href="/assets/css/paginas.css">
${extraHead}<script type="application/ld+json">
${JSON.stringify(graph, null, 1)}
</script>
</head>
<body data-page="${dataPage || path}"${bodyClass ? ` class="${bodyClass}"` : ""}>
<a class="skip-link" href="#contenido">Saltar al contenido</a>
${nav(path, isHome)}

<main id="contenido">
${body}
</main>

${conFooter ? footer() : ""}

${waFloat(waMsg)}

<script src="/assets/js/medicion.js"></script>
<script src="/assets/js/cauce.js"></script>
${scripts}</body>
</html>
`;
}

module.exports = { ORG, SITE, WA, CALENDLY, EMAIL, esc, wa, logo, WA_ICON, nav, footer, ctaBand, breadcrumb, faqHtml, ldBreadcrumb, ldFaq, ldService, page };
