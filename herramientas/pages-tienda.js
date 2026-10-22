const L = require("./lib");
const { WA_ICON, faqHtml, ldBreadcrumb, ldFaq, ldService, page, esc } = L;
const fmt = (n) => "$" + n.toLocaleString("es-CO");

// Planes de soporte del alquiler: aplican a los equipos que el cliente elija en el catálogo (sin precio: la cuota se cotiza)
const PLANES = [
  { id: "plan-basico", nombre: "Plan Básico", ideal: "Si tu equipo resuelve casi todo por su cuenta.", items: ["Soporte remoto", "Te respondemos en 24–48 h hábiles", "Equipo asegurado contra daño y robo"] },
  { id: "plan-estandar", nombre: "Plan Estándar", ideal: "Si quieres mantenimiento y visitas periódicas.", items: ["Soporte remoto + 1 visita al mes", "Mantenimiento preventivo", "Te respondemos en 8–24 h hábiles", "Equipo asegurado contra daño y robo"], destacado: true },
  { id: "plan-premium", nombre: "Plan Premium", ideal: "Si tu operación no puede detenerse.", items: ["Soporte presencial prioritario", "Mantenimiento preventivo", "Te respondemos en menos de 4 h hábiles", "Equipo asegurado contra daño y robo"] },
];
const PLAZO = 24;

const cartCtrl = (label) => `<div class="cart-ctrl" data-cart-ctrl>
            <button type="button" class="btn-add" data-add aria-label="Agregar ${esc(label)} al pedido">+ Agregar</button>
            <div class="qty" data-qty hidden>
              <button type="button" data-menos aria-label="Quitar uno">−</button>
              <output data-n>1</output>
              <button type="button" data-mas aria-label="Agregar otro">+</button>
            </div>
          </div>`;

function planCard(p) {
  return `      <article class="plan producto-plan${p.destacado ? " is-featured" : ""}" data-id="${p.id}" data-nombre="${esc(p.nombre)}">
        ${p.destacado ? '<span class="plan-tag">Más elegido</span>' : ""}
        <h3>${p.nombre}</h3>
        <p class="plan-spec plan-ideal">${p.ideal}</p>
        <div class="plan-price"><b>Cuota a cotizar</b><small>Cuota mensual por equipo · plazo elegido: <span data-plazo-label>${PLAZO}</span> meses</small></div>
        <ul>${p.items.map((x) => `<li>${x}</li>`).join("")}</ul>
        <button type="button" class="btn-plan-elegir" data-elegir-plan aria-pressed="false"><span class="add">Elegir este plan</span><span class="remove">✓ Plan elegido</span></button>
      </article>`;
}

function tienda() {
  const path = "/tienda/";
  const crumbs = [["Inicio", "/"], ["Tienda de tecnología", path]];
  const faqs = [
    ["¿Enviar el pedido me compromete a comprar?", "No. El pedido es una solicitud de cotización. Te respondemos por WhatsApp con precios, disponibilidad y tiempos de entrega, y tú decides si sigues."],
    ["¿Qué diferencia hay entre nuevo y reacondicionado?", "Un equipo nuevo viene sellado de fábrica con su garantía. Uno reacondicionado es un equipo empresarial de buena gama que se revisa, se le cambian las piezas necesarias, se formatea y se entrega con garantía, a un costo menor que uno nuevo."],
    ["¿En qué ciudades venden y alquilan equipos?", "Por ahora la tienda atiende solo en Cali: allí entregamos los equipos que compras o alquilas, y el alquiler incluye soporte técnico presencial. La consultoría TI la hacemos en Colombia, Latinoamérica y, de forma virtual, en cualquier país."],
    ["¿Qué incluye el alquiler?", "El computador configurado y listo para usar, seguro contra daño, robo y cortocircuito, y soporte técnico. Al terminar el contrato puedes renovar con equipos nuevos o devolverlos."],
    ["¿Los equipos tienen garantía?", "Sí. Los equipos reacondicionados se revisan y prueban antes de entregarse y tienen garantía escrita; los nuevos tienen la garantía de fábrica. En la ficha de cada producto ves la garantía y lo que incluye."],
  ];

  const offers = {
    "@type": "OfferCatalog",
    name: "Tienda de tecnología Cauce",
    itemListElement: [
      { "@type": "OfferCatalog", name: "Planes de soporte para alquiler de computadores en Cali", itemListElement: PLANES.map((p) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: p.nombre, description: p.items.join(", ") }, areaServed: { "@type": "City", name: "Cali" } })) }
    ],
  };

  // Datos de cada producto para la ficha (características, modelos, estados)
  const CART_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/></svg>`;

  const body = `<header class="hero is-sub">
  <div class="hero-grid-bg"></div>
  <div class="wrap">
    <div class="hero-eyebrow"><span class="pulse"></span><span class="mono">Tienda de tecnología · Venta y alquiler en Cali</span></div>
    <h1>La tecnología de tu negocio,<br><span class="accent">en un solo lugar.</span></h1>
    <p class="hero-sub">Portátiles, computadores de escritorio y monitores, <strong>nuevos o reacondicionados</strong>, revisados y con garantía escrita. Arma tu pedido y envíanoslo por WhatsApp: te respondemos con la cotización, sin compromiso.</p>
    <div class="hero-ctas">
      <a href="#catalogo" class="btn btn-primary" data-ir-modo="compra">Quiero comprar <span class="arrow">→</span></a>
      <a href="#catalogo" class="btn btn-secondary" data-ir-modo="alquiler">Alquilar computadores en Cali</a>
    </div>
  </div>
</header>

<section class="section pasos-tienda">
  <div class="wrap">
    <ol class="pasos">
      <li><span class="num">01</span><div><h3>Encuentra lo que necesitas</h3><p>Busca por categoría o por nombre, y revisa las características y configuraciones de cada equipo.</p></div></li>
      <li><span class="num">02</span><div><h3>Arma tu pedido</h3><p>Elige si lo compras o lo alquilas, nuevo o reacondicionado, y ajusta las cantidades.</p></div></li>
      <li><span class="num">03</span><div><h3>Envíalo por WhatsApp</h3><p>Te respondemos con precios, disponibilidad y tiempos de entrega. Enviar el pedido no te compromete a nada.</p></div></li>
    </ol>
  </div>
</section>

<section id="catalogo" class="pilares section catalogo tienda">
  <div class="wrap">
    <span id="licencias" class="ancla" aria-hidden="true"></span><span id="alquilar" class="ancla" aria-hidden="true"></span>
    <div class="tienda-layout">
      <aside class="tienda-side" aria-label="Filtros de la tienda">
        <label class="buscar">
          <span class="control-label">Buscar</span>
          <input type="search" data-buscar-input placeholder="Ej.: portátil i5, ExpertBook, Nitro, monitor 24″…" autocomplete="off">
        </label>

        <div class="side-bloque">
          <span class="control-label" id="lbl-modo">¿Cómo lo quieres?</span>
          <div class="seg seg-modo" role="group" aria-labelledby="lbl-modo">
            <button type="button" data-modo="compra" aria-pressed="true">Comprar</button>
            <button type="button" data-modo="alquiler" aria-pressed="false">Alquilar</button>
          </div>
          <p class="side-nota" data-ayuda="compra">Entregamos en Cali.</p>
          <p class="side-nota" data-ayuda="alquiler" hidden>Alquiler de computadores, solo en Cali y su área. Incluye seguro y soporte.</p>
        </div>

        <div class="side-bloque plazo" hidden>
          <span class="control-label" id="lbl-plazo">Plazo del alquiler</span>
          <div class="seg" role="group" aria-labelledby="lbl-plazo">
            <button type="button" data-plazo="12" aria-pressed="false">12 m</button>
            <button type="button" data-plazo="24" aria-pressed="true">24 m</button>
            <button type="button" data-plazo="36" aria-pressed="false">36 m</button>
          </div>
        </div>

        <div class="side-bloque">
          <span class="control-label" id="lbl-estado">Estado del equipo</span>
          <div class="seg seg-estado" role="group" aria-labelledby="lbl-estado">
            <button type="button" data-estado="todos" aria-pressed="true">Todos</button>
            <button type="button" data-estado="Nuevo" aria-pressed="false">Nuevo</button>
            <button type="button" data-estado="Reacondicionado" aria-pressed="false">Reacondicionado</button>
          </div>
          <p class="side-nota"><strong>Reacondicionado:</strong> equipo empresarial revisado, con piezas verificadas, formateado y con garantía, a menor costo que uno nuevo.</p>
        </div>

        <div class="side-bloque">
          <span class="control-label">Categorías</span>
          <ul class="cat-list" data-cat-list></ul>
        </div>
      </aside>

      <div class="tienda-main">
        <div class="tienda-toolbar">
          <div>
            <h2 data-titulo>Todo el catálogo</h2>
            <p class="tienda-resultados" data-resultados>&nbsp;</p>
          </div>
          <label class="ordenar"><span class="control-label">Ordenar</span>
            <select data-orden>
              <option value="destacados">Destacados</option>
              <option value="nombre">Nombre (de la A a la Z)</option>
            </select>
          </label>
        </div>

        <div class="planes-alquiler" data-planes hidden>
          <div class="planes-head">
            <h2>1. Elige tu plan de soporte <em>para el alquiler.</em></h2>
            <p>El plan define el soporte y el seguro de tus equipos alquilados en Cali. Después, en el paso 2, agrega abajo los computadores que quieres alquilar.</p>
            <div class="planes-plazo">
              <span class="control-label" id="lbl-plazo-planes">Plazo del contrato: 12, 24 o 36 meses</span>
              <div class="seg" role="group" aria-labelledby="lbl-plazo-planes">
                <button type="button" data-plazo="12" aria-pressed="false">12 meses</button>
                <button type="button" data-plazo="24" aria-pressed="true">24 meses</button>
                <button type="button" data-plazo="36" aria-pressed="false">36 meses</button>
              </div>
            </div>
          </div>
          <div class="plan-grid">
${PLANES.map(planCard).join("\n")}
          </div>
          <p class="planes-note">Te enviamos la cuota mensual según el plan, el plazo y los equipos que elijas.</p>
        </div>

        <p class="tienda-cargando" data-cargando>Cargando catálogo…</p>
        <p class="tienda-vacio" data-error-catalogo hidden>No pudimos cargar el catálogo en este momento. <a href="${esc(L.wa("Hola Cauce, quiero cotizar equipos de la tienda."))}" target="_blank" rel="noopener" data-ubicacion="tienda-error">Escríbenos por WhatsApp</a> y te ayudamos, o <button type="button" class="link-btn" data-reintentar>vuelve a intentarlo</button>.</p>
        <div class="producto-grid" data-grid="tienda"></div>
        <noscript><p class="tienda-vacio">Para ver el catálogo activa JavaScript o escríbenos por WhatsApp al +57 301 368 2430.</p></noscript>
        <div class="paginacion" data-paginacion role="navigation" aria-label="Páginas del catálogo" hidden></div>
        <p class="tienda-vacio" data-vacio hidden>No encontramos productos con esos filtros. Prueba con otra búsqueda o <a href="${esc(L.wa("Hola Cauce, estoy buscando un producto que no encontré en la tienda: "))}" target="_blank" rel="noopener" data-ubicacion="tienda-vacio">escríbenos y lo conseguimos</a>. También puedes <button type="button" class="link-btn" data-limpiar-filtros>quitar los filtros</button>.</p>
      </div>
    </div>
  </div>
</section>

${faqHtml(faqs, { bg: "is-warm" })}

<!-- Ficha de producto -->
<div class="ficha-overlay" data-ficha-overlay hidden>
  <div class="ficha" role="dialog" aria-modal="true" aria-labelledby="fichaTitulo">
    <button type="button" class="pedido-cerrar ficha-cerrar" data-cerrar-ficha aria-label="Cerrar">✕</button>
    <div class="ficha-media" data-ficha-media></div>
    <div class="ficha-info">
      <p class="mono ficha-cat" data-ficha-cat></p>
      <h2 id="fichaTitulo" data-ficha-nombre></h2>
      <p class="ficha-ref" data-ficha-ref></p>
      <p class="ficha-resumen" data-ficha-resumen></p>
      <div data-ficha-opciones></div>
      <dl class="ficha-specs" data-ficha-specs></dl>
      <p class="ficha-modo" data-ficha-modo></p>
      <div class="ficha-agregar">
        <div class="qty"><button type="button" data-f-menos aria-label="Uno menos">−</button><output data-f-n>1</output><button type="button" data-f-mas aria-label="Uno más">+</button></div>
        <button type="button" class="btn-flow" data-f-agregar>Agregar al pedido</button>
      </div>
      <p class="ficha-en-pedido" data-ficha-en-pedido></p>
    </div>
  </div>
</div>

<!-- Pedido -->
<div class="pedido-bar" data-pedido-bar hidden>
  <div class="pedido-bar-inner">
    <button type="button" class="pedido-resumen" data-abrir-pedido>
      ${CART_ICON}<span><strong data-pedido-total>0 productos</strong> en tu pedido</span><span class="pedido-ver">Ver pedido</span>
    </button>
    <a class="btn-cta" data-enviar-pedido href="#catalogo" target="_blank" rel="noopener" data-cotizador data-ubicacion="tienda-pedido-barra">${WA_ICON}Enviar por WhatsApp</a>
  </div>
</div>

<div class="pedido-overlay" data-pedido-overlay hidden>
  <aside class="pedido-panel" role="dialog" aria-modal="true" aria-labelledby="pedidoTitulo">
    <div class="pedido-head">
      <div>
        <p class="mono" style="color: var(--flow-dark);">Tu pedido</p>
        <h2 id="pedidoTitulo">Revisa y envía</h2>
      </div>
      <button type="button" class="pedido-cerrar" data-cerrar-pedido aria-label="Cerrar">✕</button>
    </div>
    <div class="pedido-lista" data-pedido-lista></div>
    <div class="pedido-foot">
      <p>Te respondemos por WhatsApp con precios, disponibilidad y tiempos de entrega. Enviar el pedido no te compromete a nada.</p>
      <a class="btn-flow" data-enviar-pedido href="#catalogo" target="_blank" rel="noopener" data-cotizador data-ubicacion="tienda-pedido-panel">${WA_ICON} Enviar pedido por WhatsApp</a>
      <button type="button" class="pedido-vaciar" data-vaciar-pedido>Vaciar pedido</button>
    </div>
  </aside>
</div>`;

  return {
    path,
    html: page({
      path,
      title: "Portátiles y computadores para empresas en Cali | Cauce",
      description: "Portátiles, computadores de escritorio y monitores nuevos o reacondicionados, con garantía. Venta y alquiler en Cali.",
      waMsg: "Hola Cauce, quiero información sobre la tienda de tecnología.",
      bodyClass: "tienda-page",
      conFooter: false,
      jsonld: [
        ldService({ name: "Tienda de tecnología: venta y alquiler de equipos", description: "Venta y alquiler en Cali de portátiles, computadores de escritorio y monitores, nuevos o reacondicionados.", path, serviceType: "Venta y alquiler de equipos de tecnología", offers, areaServed: { "@type": "City", name: "Cali" } }),
        ldBreadcrumb(crumbs),
        ldFaq(faqs),
      ],
      body,
      scripts: `<script src="/assets/js/tienda.js"></script>\n`,
    }),
  };
}

module.exports = { tienda };
