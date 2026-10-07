const L = require("./lib");
const { WA_ICON, breadcrumb, faqHtml, ctaBand, ldBreadcrumb, ldFaq, ldService, page, esc } = L;

// Orden de la torre, de la base hacia arriba
const PIEZAS = [
  {
    id: "consultoria", nombre: "Consultoría", color: "#0d1b2a", texto: "#f4f5f7",
    desc: "Nuestro método de cuatro pasos aplicado a tu negocio: Diagnóstico → Datos → Procesos → Ingeniería. Es la base de la torre: decide qué piezas necesitas y en qué orden.",
    incluye: [
      "<strong>Diagnóstico:</strong> conversamos con el dueño y el equipo, revisamos lo que ya tienes y encontramos dónde se pierde tiempo o plata.",
      "<strong>Datos:</strong> qué información genera tu negocio, dónde se pierde y qué conviene medir.",
      "<strong>Procesos:</strong> qué rediseñar antes de comprar o construir tecnología.",
      "<strong>Ingeniería:</strong> hoja de ruta ordenada por retorno de inversión, con las piezas que siguen.",
    ],
    ideal: "No sabes por dónde empezar o ya invertiste en tecnología y no rindió.",
  },
  {
    id: "arquitectura", nombre: "Arquitectura de redes y software", corto: "Arquitectura", color: "#0a8aa3", texto: "#ffffff",
    desc: "El diseño de tu infraestructura de red o de tus sistemas de software, antes de comprar un equipo o escribir una línea de código.",
    incluye: [
      "<strong>Software:</strong> definimos los componentes, los datos y las integraciones para que lo que se construya, con o sin IA, pueda crecer.",
      "<strong>Redes:</strong> topología, segmentación y cableado frente a wifi para una sede nueva o una red que ya no da abasto.",
      "<strong>Servidores:</strong> nube, servidor propio o híbrido: lo correcto para tu negocio, no lo más caro ni lo de moda.",
      "Planos y documentación para que nosotros o cualquier proveedor construya sobre ellos.",
    ],
    ideal: "Tienes una idea de software, abres sede o tu red y tus sistemas ya no dan más.",
  },
  {
    id: "desarrollo", nombre: "Desarrollo a la medida", color: "#0fb8d9", texto: "#0d1b2a",
    desc: "Convertimos la idea y el diseño en software funcionando. Con desarrollo asistido por IA, hoy es más rápido, más estandarizado y más económico, sin sacrificar calidad.",
    incluye: [
      "<strong>Fábrica de software:</strong> aplicaciones web, sistemas internos y apps móviles.",
      "<strong>Páginas web corporativas:</strong> diseño, desarrollo y administración como webmaster (dominio, hosting, certificado de seguridad y actualizaciones).",
      "<strong>Automatización e IA:</strong> RPA, flujos con n8n o scripting a la medida, y agentes de inteligencia artificial conectados a tus sistemas.",
      "Integraciones con lo que ya usas: Siigo, Alegra, WhatsApp Business, hojas de cálculo.",
      "Entregas por etapas, con código y documentación a nombre de tu empresa.",
    ],
    ideal: "Ya tienes la idea clara (y mejor si ya pasó por arquitectura).",
  },
  {
    id: "calidad", nombre: "Pruebas de calidad de software", corto: "Pruebas de calidad", color: "#4a5a6e", texto: "#ffffff",
    desc: "Comprobamos que tu software haga lo que esperas, en los casos normales y en los raros, antes de que lo descubra tu cliente.",
    incluye: [
      "Pruebas funcionales de los flujos críticos (ventas, pagos, inventario, reportes).",
      "Pruebas antes de cada lanzamiento o actualización importante.",
      "Informe de hallazgos priorizado: qué corregir primero.",
      "Sirve para software nuestro o hecho por otro proveedor.",
    ],
    ideal: "Vas a lanzar algo nuevo o tu sistema falla y no sabes por qué.",
  },
  {
    id: "seguridad", nombre: "Auditoría de seguridad y pentesting", corto: "Seguridad y pentest", color: "#075e70", texto: "#ffffff",
    desc: "Auditamos la seguridad de tu software y detectamos sus puntos débiles antes que un atacante, con el estándar OWASP ASVS como referencia.",
    incluye: [
      "<strong>Auditoría de seguridad:</strong> verificamos tu aplicación contra OWASP ASVS (Application Security Verification Standard), el estándar para evaluar la seguridad de aplicaciones.",
      "<strong>Pentest:</strong> pruebas de penetración controladas sobre tu software propietario, atacándolo como lo haría un atacante real.",
      "Revisión de accesos, contraseñas, permisos y datos expuestos.",
      "Informe de vulnerabilidades priorizado por riesgo, con cómo corregir cada una.",
    ],
    ideal: "Tu software maneja datos de clientes, pagos o información sensible, o vas a lanzar una versión importante.",
  },
  {
    id: "infraestructura", nombre: "Infraestructura y monitoreo", corto: "Infraestructura", color: "#8b97a8", texto: "#0d1b2a",
    desc: "Instalamos, migramos y vigilamos tus redes, servidores y aplicaciones en la nube para que sigan funcionando y seguros.",
    incluye: [
      "<strong>Redes corporativas:</strong> instalación, VPN para conectarte seguro desde fuera y monitoreo.",
      "<strong>Servidores:</strong> instalación con RAID, respaldos y virtualización; migración sin perder información.",
      "<strong>Nube:</strong> despliegue y operación en AWS, Google Cloud o Azure con Terraform.",
      "Monitoreo, parches y respaldos verificados, con alertas antes de que algo falle.",
    ],
    ideal: "Tu sistema se cae y te enteras por los clientes, o nadie revisa los respaldos.",
  },
  {
    id: "soporte", nombre: "Soporte TI", color: "#d5f1f7", texto: "#0d1b2a",
    desc: "Tu área de TI sin tener que contratarla: alguien atiende a tu equipo cuando algo falla y cuida los equipos antes de que fallen.",
    incluye: [
      "Mesa de ayuda remota con acceso seguro, y soporte en sitio en Cali.",
      "Monitoreo de los equipos: muchas veces nos enteramos de la falla antes que tú.",
      "Mantenimiento preventivo y registro de cada caso.",
      "Niveles con tiempo de respuesta claro: 24–48 h, 8–24 h o menos de 4 h.",
    ],
    ideal: "No tienes a nadie de TI en tu equipo. Si además necesitas equipos, mira la <a href=\"/tienda/\">tienda</a>.",
  },
];

// Servicios que viven dentro de una pieza pero se buscan por su propio nombre
const EXTRA = [
  ["Fábrica de software", "Desarrollo de aplicaciones web, sistemas internos y apps móviles a la medida, con entregas por etapas."],
  ["Páginas web corporativas y webmaster", "Diseño, desarrollo y administración de sitios web: dominio, hosting, certificado de seguridad y actualizaciones."],
  ["Automatización de procesos y RPA", "Automatización de tareas repetitivas con RPA, n8n o scripting a la medida."],
  ["Agentes de IA e inteligencia artificial aplicada", "Agentes de inteligencia artificial conectados a tus sistemas para atender, clasificar y ejecutar tareas."],
  ["Redes corporativas", "Diseño, instalación, VPN y monitoreo de redes empresariales."],
  ["Soporte TI en sitio", "Soporte técnico presencial en Cali y mesa de ayuda remota para empresas."],
];

// Página propia de cada pieza (las de desarrollo son tres)
const MAS = {
  consultoria: [["/consultoria-ti/consultoria-tecnologica/", "Ver consultoría tecnológica"]],
  arquitectura: [["/consultoria-ti/arquitectura-de-software-y-redes/", "Ver arquitectura"]],
  desarrollo: [["/consultoria-ti/desarrollo-de-software/", "Fábrica de software"], ["/consultoria-ti/paginas-web-y-tiendas-en-linea/", "Páginas web y tiendas en línea"], ["/consultoria-ti/automatizacion-rpa-e-ia/", "Automatización, RPA e IA"]],
  calidad: [["/consultoria-ti/pruebas-de-software/", "Ver pruebas de software"]],
  seguridad: [["/consultoria-ti/auditoria-de-seguridad-y-pentest/", "Ver auditoría y pentest"]],
  infraestructura: [["/consultoria-ti/infraestructura-y-redes/", "Ver redes e infraestructura"]],
  soporte: [["/consultoria-ti/soporte-ti/", "Ver soporte TI"]],
};

const KITS = [
  { nombre: "Tengo una idea", piezas: ["consultoria", "arquitectura", "desarrollo", "calidad"] },
  { nombre: "Ya tengo un software", piezas: ["calidad", "seguridad", "infraestructura"] },
  { nombre: "Mi oficina funcionando", piezas: ["soporte", "infraestructura"] },
  { nombre: "El ciclo completo", piezas: PIEZAS.map((p) => p.id) },
];

const brick = (p, extra = "") => `<span class="brick" style="--c:${p.color}; --t:${p.texto};"${extra}><span class="brick-label">${p.corto || p.nombre}</span></span>`;

function consultoria() {
  const path = "/consultoria-ti/";
  const crumbs = [["Inicio", "/"], ["Consultoría TI", path]];
  const faqs = [
    ["¿Tengo que contratar todas las piezas?", "No. Cada pieza se contrata por separado y encaja con las demás. Puedes empezar por una sola (por ejemplo, soporte TI) y sumar otras cuando las necesites."],
    ["No sé qué piezas necesito. ¿Por dónde empiezo?", "Por la consultoría o por un Café Cauce. En una hora revisamos tu caso y te decimos qué piezas tienen sentido y cuáles no."],
    ["¿Hacen páginas web, automatizaciones y agentes de IA?", "Sí, dentro de la pieza de desarrollo a la medida: páginas web corporativas y su administración, automatización de procesos con RPA, n8n o scripting, y agentes de inteligencia artificial conectados a tus sistemas. Como en todo, primero entendemos el proceso: automatizamos solo lo que vale la pena."],
    ["¿El soporte es en sitio o remoto?", "Las dos cosas. En Cali vamos a tu oficina cuando hace falta; en el resto del país atendemos por mesa de ayuda remota con acceso seguro. La consultoría, el desarrollo y la seguridad los hacemos de forma virtual para empresas de Colombia, Latinoamérica y cualquier país."],
    ["¿Cómo se cobra?", "Cada pieza tiene alcance y precio cerrados, que te enviamos en la propuesta después de entender tu caso. Sin sorpresas ni \"fase 2\" inesperada."],
  ];

  const body = `<header class="hero is-sub">
  <div class="hero-grid-bg"></div>
  <div class="wrap">
    <div class="sub-hero-grid">
      <div>
        <div class="hero-eyebrow"><span class="pulse"></span><span class="mono">Consultoría TI · Colombia, Latinoamérica y el mundo</span></div>
        <h1>Tu solución de TI,<br><span class="accent">pieza por pieza.</span></h1>
        <p class="hero-sub">Siete piezas que encajan como un lego. Elige solo las que tu negocio necesita, envíanos tu torre y la construimos contigo.</p>
        <div class="hero-ctas">
          <a href="#armador" class="btn btn-primary">Arma tu solución <span class="arrow">→</span></a>
        </div>
      </div>
      <div class="tower tower-hero" aria-hidden="true">
        ${PIEZAS.slice().reverse().map((p) => brick(p)).join("\n        ")}
        <span class="baseplate"></span>
      </div>
    </div>
  </div>
</header>

<section class="section armador" id="armador">
  <div class="wrap">
    <div class="section-head">
      <div>
        <p class="mono" style="color: var(--ink-mute); margin-bottom: 1rem;">— El armador</p>
        <h2>Toca las piezas.<br><em>Arma tu torre.</em></h2>
      </div>
      <p class="lead">Cada pieza que eliges se suma a tu torre. Cuando esté lista, envíala por WhatsApp y te respondemos con la propuesta.</p>
    </div>

    <div class="kits" role="group" aria-label="Combinaciones frecuentes">
      <span class="control-label">Combinaciones frecuentes</span>
      ${KITS.map((k) => `<button type="button" class="kit" data-kit="${k.piezas.join(",")}">${k.nombre}</button>`).join("\n      ")}
    </div>

    <div class="armador-grid">
      <div class="piezas" role="group" aria-label="Piezas">
${PIEZAS.map((p) => `        <article class="pieza" data-pieza="${p.id}">
          ${brick(p)}
          <h3 class="pieza-name">${p.nombre}</h3>
          <p class="pieza-desc">${p.desc}</p>
          <ul class="pieza-incluye">
            ${p.incluye.map((i) => `<li>${i}</li>`).join("\n            ")}
          </ul>
          <p class="pieza-ideal"><span>Ideal si</span> ${p.ideal}</p>
          <p class="pieza-mas">${MAS[p.id].map(([href, label]) => `<a href="${href}">${label} <span class="arrow">→</span></a>`).join("")}</p>
          <button type="button" class="pieza-toggle" aria-pressed="false" aria-label="Agregar ${p.nombre} a mi torre"><span class="add">+ Agregar a mi torre</span><span class="remove">✓ En tu torre · quitar</span></button>
        </article>`).join("\n")}
      </div>

      <aside class="torre-panel" aria-live="polite">
        <span class="control-label">Tu torre</span>
        <div class="tower" id="torre">
          <p class="tower-empty" id="torreVacia">Toca una pieza para empezar</p>
${PIEZAS.slice().reverse().map((p) => `          ${brick(p, ` data-en-torre="${p.id}" hidden`)}`).join("\n")}
          <span class="baseplate"></span>
        </div>
        <p class="torre-count" id="torreCount">0 de 7 piezas</p>
        <a class="btn-flow torre-cta" id="torreWa" href="#armador" target="_blank" rel="noopener" aria-disabled="true" data-cotizador data-ubicacion="consultoria-torre">${WA_ICON} Enviar mi torre <span class="torre-cta-n" id="torreCtaN"></span></a>
        <button type="button" class="torre-reset" id="torreReset">Empezar de nuevo</button>
      </aside>
    </div>
  </div>
</section>

${faqHtml(faqs, { bg: "is-warm" })}
`;

  return {
    path,
    html: page({
      path,
      title: "Consultoría TI, software y ciberseguridad en Cali | Cauce",
      description: "Fábrica de software, páginas web, RPA y agentes de IA, auditoría de seguridad y pentest, redes corporativas y soporte TI en sitio. Colombia y Latinoamérica.",
      waMsg: "Hola Cauce, quiero hablar sobre consultoría TI para mi empresa.",
      bodyClass: "armador-page",
      jsonld: [
        ldService({
          name: "Consultoría TI", path, serviceType: "Consultoría tecnológica y desarrollo de software",
          description: "Consultoría TI, fábrica de software, páginas web, automatización con RPA y agentes de IA, pruebas de calidad, auditoría de seguridad y pentesting, redes corporativas, infraestructura y soporte TI en sitio.",
          offers: { "@type": "OfferCatalog", name: "Servicios de consultoría TI", itemListElement: [...PIEZAS.map((p) => [p.nombre, p.desc]), ...EXTRA].map(([name, description]) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name, description } })) },
        }),
        ldBreadcrumb(crumbs),
        ldFaq(faqs),
      ],
      body,
      scripts: `<script src="/assets/js/consultoria.js"></script>\n`,
    }),
    piezas: PIEZAS,
  };
}

module.exports = { consultoria, PIEZAS };
