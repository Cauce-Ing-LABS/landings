/* Tienda de tecnología: filtros (modo, plazo, estado, categoría, búsqueda), ficha de producto y pedido en un solo mensaje */
(function () {
  var fmt = function (n) { return "$" + Math.round(n).toLocaleString("es-CO"); };
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var sinTildes = function (s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
  var KEY = "cauce_pedido_v2";

  var FICHAS = JSON.parse($("#fichas-datos").textContent);
  var grid = $("[data-grid='tienda']");
  var cards = $$(".producto", grid);
  var planes = $$(".producto-plan");
  var catalogo = document.getElementById("catalogo");
  var state = { modo: "compra", plazo: "24", estado: "todos", cat: "todo", sub: "todo", q: "", orden: "destacados" };

  // ---------- pedido ----------
  // { clave: { id, nombre, modo, detalle, licencia, plan, cantidad } }
  var pedido = {};
  try {
    var g = JSON.parse(localStorage.getItem(KEY) || "null");
    if (g && g.items) { pedido = g.items; state.plazo = g.plazo || state.plazo; }
  } catch (e) { pedido = {}; }
  var guardar = function () { try { localStorage.setItem(KEY, JSON.stringify({ items: pedido, plazo: state.plazo })); } catch (e) { /* sin almacenamiento */ } };
  var items = function () { return Object.keys(pedido).map(function (k) { return pedido[k]; }); };
  var totalItems = function () { return items().reduce(function (s, it) { return s + it.cantidad; }, 0); };

  function detalleDe(id, estado, modelo) {
    var f = FICHAS[id], partes = [];
    if (f.estados && estado) partes.push(estado);
    if (f.modelos.length > 1 && modelo) partes.push(modelo);
    return partes.join(" · ");
  }
  function claveDe(id, modo, estado, modelo) { return [id, modo, estado || "", modelo || ""].join("|"); }

  function agregar(k, base, n) {
    if (pedido[k]) pedido[k].cantidad += n;
    else { base.cantidad = n; pedido[k] = base; window.cauce.track("pedido_agregar", { producto: base.id, modo: base.modo }); }
    if (pedido[k].cantidad <= 0) delete pedido[k];
    render();
  }

  function mensaje() {
    var linea = function (it) {
      var extra = it.plan ? " — portátil reacondicionado con seguro y soporte" : (it.detalle ? " — " + it.detalle : "");
      return "• " + it.cantidad + " × " + it.nombre + extra;
    };
    var compra = items().filter(function (it) { return it.modo === "compra"; }).map(linea);
    var alquiler = items().filter(function (it) { return it.modo === "alquiler"; }).map(linea);
    var partes = ["Hola Cauce, quiero cotizar este pedido:"];
    if (compra.length) partes.push("", "Comprar:", compra.join("\n"));
    if (alquiler.length) partes.push("", "Alquilar en Cali a " + state.plazo + " meses:", alquiler.join("\n"));
    partes.push("", "Empresa: ", "Ciudad: ");
    return partes.join("\n");
  }

  // ---------- filtros ----------
  function pasa(card, ignorarCat) {
    if (card.dataset[state.modo] !== "true") return false;
    if (state.estado !== "todos") {
      if (!card.dataset.estados) return false;
      if (card.dataset.estados.split(",").indexOf(state.estado) === -1) return false;
    }
    if (state.q) {
      var texto = card.dataset.buscar;
      if (!sinTildes(state.q).split(/\s+/).every(function (t) { return texto.indexOf(t) !== -1; })) return false;
    }
    if (ignorarCat) return true;
    if (state.cat !== "todo" && card.dataset.cat !== state.cat) return false;
    if (state.sub !== "todo" && card.dataset.sub !== state.sub) return false;
    return true;
  }

  function ordenar() {
    var lista = cards.slice().sort(function (a, b) {
      return state.orden === "nombre"
        ? a.dataset.nombre.localeCompare(b.dataset.nombre, "es")
        : Number(a.dataset.orden) - Number(b.dataset.orden);
    });
    lista.forEach(function (c) { grid.appendChild(c); });
  }

  // ---------- render ----------
  function pintarControl(el, k) {
    var ctrl = $("[data-cart-ctrl]", el);
    if (!ctrl) return;
    var it = pedido[k];
    $("[data-add]", ctrl).hidden = !!it;
    $("[data-qty]", ctrl).hidden = !it;
    if (it) $("[data-n]", ctrl).textContent = it.cantidad;
  }
  function claveDirecta(card) {
    var f = FICHAS[card.dataset.id];
    return claveDe(card.dataset.id, state.modo, f.estados ? f.estados[0] : "", f.modelos[0]);
  }

  function render() {
    $$("[data-modo]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.modo === state.modo)); });
    $$("[data-plazo]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.plazo === state.plazo)); });
    $$("[data-estado]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.estado === state.estado)); });
    $$(".cat-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.cat === state.cat)); });
    $$(".sub-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.subCat === state.cat && b.dataset.sub === state.sub)); });
    $$("[data-subs]").forEach(function (u) { u.hidden = u.dataset.subs !== state.cat; });
    $$("[data-ayuda]").forEach(function (p) { p.hidden = p.dataset.ayuda !== state.modo; });
    $(".tienda .plazo").hidden = state.modo !== "alquiler";

    // conteos por categoría y subcategoría (sin contar el filtro de categoría)
    var counts = { todo: 0 }, subs = {};
    cards.forEach(function (c) {
      if (!pasa(c, true)) return;
      counts.todo++;
      counts[c.dataset.cat] = (counts[c.dataset.cat] || 0) + 1;
      var sk = c.dataset.cat + ":" + c.dataset.sub;
      subs[sk] = (subs[sk] || 0) + 1;
    });
    $$("[data-count]").forEach(function (el) {
      var n = counts[el.dataset.count] || 0;
      el.textContent = n;
      if (el.dataset.count !== "todo") el.closest("[data-cat-item]").hidden = n === 0;
    });
    $$("[data-count-sub]").forEach(function (el) {
      var n = subs[el.dataset.countSub] || 0;
      el.textContent = n;
      el.closest("li").hidden = n === 0;
    });
    if (state.cat !== "todo" && !counts[state.cat]) { state.cat = "todo"; state.sub = "todo"; return render(); }
    if (state.sub !== "todo" && !subs[state.cat + ":" + state.sub]) { state.sub = "todo"; return render(); }

    ordenar();
    var visibles = 0;
    cards.forEach(function (card) {
      var ok = pasa(card, false);
      card.hidden = !ok;
      if (ok) visibles++;
      pintarControl(card, claveDirecta(card));
      var n = items().filter(function (it) { return it.id === card.dataset.id && it.modo === state.modo; }).reduce(function (s, it) { return s + it.cantidad; }, 0);
      var tag = $("[data-en-pedido]", card);
      tag.hidden = !n;
      tag.textContent = "✓ " + n + " en tu pedido";
      card.classList.toggle("en-pedido", n > 0);
    });

    var mostrarPlanes = state.modo === "alquiler" && !state.q &&
      (state.cat === "todo" || state.cat === "computo") && (state.sub === "todo" || state.sub === "portatiles") &&
      (state.estado === "todos" || state.estado === "Reacondicionado");
    $("[data-planes]").hidden = !mostrarPlanes;
    planes.forEach(function (p) {
      $("[data-plazo-label]", p).textContent = state.plazo;
      pintarControl(p, claveDe(p.dataset.id, "alquiler"));
      p.classList.toggle("en-pedido", !!pedido[claveDe(p.dataset.id, "alquiler")]);
    });

    var titulo = state.q ? "Resultados para “" + state.q + "”" : "Todo el catálogo";
    if (!state.q && state.cat !== "todo") {
      var catBtn = $('.cat-btn[data-cat="' + state.cat + '"]');
      titulo = catBtn.firstChild.textContent.trim();
      if (state.sub !== "todo") titulo += " · " + $('.sub-btn[data-sub-cat="' + state.cat + '"][data-sub="' + state.sub + '"]').firstChild.textContent.trim();
    }
    $("[data-titulo]").textContent = state.modo === "alquiler" ? titulo + " en alquiler" : titulo;
    $("[data-resultados]").textContent = visibles + (visibles === 1 ? " producto" : " productos") +
      (state.modo === "alquiler" ? " · alquiler solo en Cali" : " · envíos a toda Colombia");
    $("[data-vacio]").hidden = visibles > 0 || mostrarPlanes;

    renderPedido();
  }

  // ---------- barra y panel del pedido ----------
  var bar = $("[data-pedido-bar]"), overlay = $("[data-pedido-overlay]"), lista = $("[data-pedido-lista]");
  function grupo(titulo, modo) {
    var ks = Object.keys(pedido).filter(function (k) { return pedido[k].modo === modo; });
    if (!ks.length) return "";
    return '<div class="pedido-grupo"><p class="pedido-grupo-titulo">' + titulo + "</p>" + ks.map(function (k) {
      var it = pedido[k];
      var det = it.plan ? "Con seguro y soporte · cuota a cotizar" : (it.detalle || (modo === "alquiler" ? "Cuota a cotizar" : "Precio a cotizar"));
      return '<div class="pedido-item" data-key="' + k + '"><div><p class="pedido-nombre">' + it.nombre + '</p><p class="pedido-detalle">' + det + "</p></div>" +
        '<div class="qty"><button type="button" data-p-menos aria-label="Quitar uno">−</button><output>' + it.cantidad + '</output><button type="button" data-p-mas aria-label="Agregar otro">+</button></div>' +
        '<button type="button" class="pedido-quitar" data-p-quitar aria-label="Quitar ' + it.nombre + '">✕</button></div>';
    }).join("") + "</div>";
  }
  function renderPedido() {
    var n = totalItems();
    bar.hidden = n === 0;
    document.body.classList.toggle("con-pedido", n > 0);
    $("[data-pedido-total]").textContent = n + (n === 1 ? " producto" : " productos");
    lista.innerHTML = n
      ? grupo("Comprar · envío a toda Colombia", "compra") + grupo("Alquilar en Cali a " + state.plazo + " meses", "alquiler")
      : '<p class="pedido-vacio">Tu pedido está vacío. Agrega productos desde el catálogo.</p>';
    $$("[data-enviar-pedido]").forEach(function (a) {
      a.setAttribute("aria-disabled", n ? "false" : "true");
      a.href = n ? window.cauce.waLink(mensaje()) : "#catalogo";
    });
    guardar();
  }
  lista.addEventListener("click", function (e) {
    var item = e.target.closest(".pedido-item");
    if (!item) return;
    var k = item.dataset.key;
    if (e.target.closest("[data-p-mas]")) agregar(k, null, 1);
    else if (e.target.closest("[data-p-menos]")) agregar(k, null, -1);
    else if (e.target.closest("[data-p-quitar]")) { delete pedido[k]; render(); }
  });
  function abrirPanel() { overlay.hidden = false; document.body.style.overflow = "hidden"; $("[data-cerrar-pedido]", overlay).focus(); }
  function cerrarPanel() { overlay.hidden = true; document.body.style.overflow = ""; }
  $("[data-abrir-pedido]").addEventListener("click", abrirPanel);
  $("[data-cerrar-pedido]", overlay).addEventListener("click", cerrarPanel);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) cerrarPanel(); });
  $("[data-vaciar-pedido]").addEventListener("click", function () { pedido = {}; render(); cerrarPanel(); });

  // ---------- controles directos en tarjetas y planes ----------
  cards.forEach(function (card) {
    var id = card.dataset.id, f = FICHAS[id];
    var ctrl = $("[data-cart-ctrl]", card);
    if (ctrl) {
      var base = function () {
        var est = f.estados ? f.estados[0] : "";
        return { id: id, nombre: f.nombre, modo: state.modo, licencia: f.licencia, detalle: detalleDe(id, est, f.modelos[0]) };
      };
      $("[data-add]", ctrl).addEventListener("click", function () { agregar(claveDirecta(card), base(), 1); });
      $("[data-mas]", ctrl).addEventListener("click", function () { agregar(claveDirecta(card), base(), 1); });
      $("[data-menos]", ctrl).addEventListener("click", function () { agregar(claveDirecta(card), base(), -1); });
    }
    $$("[data-ficha]", card).forEach(function (b) { b.addEventListener("click", function () { abrirFicha(id, b); }); });
  });
  planes.forEach(function (p) {
    var k = claveDe(p.dataset.id, "alquiler");
    var base = function () { return { id: p.dataset.id, nombre: p.dataset.nombre, modo: "alquiler", plan: true, detalle: "" }; };
    $("[data-add]", p).addEventListener("click", function () { agregar(k, base(), 1); });
    $("[data-mas]", p).addEventListener("click", function () { agregar(k, base(), 1); });
    $("[data-menos]", p).addEventListener("click", function () { agregar(k, base(), -1); });
  });

  // ---------- ficha de producto ----------
  var fOverlay = $("[data-ficha-overlay]"), ficha = { id: null, estado: "", modelo: "", n: 1, origen: null };
  function pills(cont, titulo, opciones, actual, attr) {
    if (opciones.length < 2) { cont.innerHTML = ""; return; }
    cont.innerHTML = '<span class="control-label">' + titulo + '</span><div class="pills">' + opciones.map(function (o) {
      return '<button type="button" class="pill" ' + attr + '="' + o.replace(/"/g, "&quot;") + '" aria-pressed="' + (o === actual) + '">' + o + "</button>";
    }).join("") + "</div>";
  }
  function pintarFicha() {
    var f = FICHAS[ficha.id];
    pills($("[data-ficha-estados]"), "Estado", f.estados || [], ficha.estado, "data-f-estado");
    pills($("[data-ficha-modelos]"), f.licencia ? "Plan" : "Modelo", f.modelos, ficha.modelo, "data-f-modelo");
    $("[data-f-n]").textContent = ficha.n;
    $("[data-ficha-modo]").innerHTML = state.modo === "alquiler"
      ? "<strong>Alquiler en Cali a " + state.plazo + " meses.</strong> Cuota mensual a cotizar, con seguro y soporte incluidos."
      : "<strong>Compra.</strong> Te enviamos el precio con la cotización. Envíos a toda Colombia.";
    var k = claveDe(ficha.id, state.modo, ficha.estado, ficha.modelo);
    $("[data-ficha-en-pedido]").textContent = pedido[k] ? "Ya tienes " + pedido[k].cantidad + " de esta opción en tu pedido." : "";
  }
  function abrirFicha(id, origen) {
    var f = FICHAS[id];
    ficha = { id: id, estado: f.estados ? f.estados[0] : "", modelo: f.modelos[0], n: 1, origen: origen };
    if (state.estado !== "todos" && f.estados && f.estados.indexOf(state.estado) !== -1) ficha.estado = state.estado;
    var card = cards.filter(function (c) { return c.dataset.id === id; })[0];
    $("[data-ficha-media]").innerHTML = $(".estado-viz", card).innerHTML;
    $("[data-ficha-cat]").textContent = f.cat + " · " + f.sub;
    $("[data-ficha-nombre]").textContent = f.nombre;
    $("[data-ficha-ref]").textContent = f.licencia ? f.ref : "Referencia: " + f.ref + (f.ref.indexOf("Según") === 0 ? "" : " o equivalente según disponibilidad");
    $("[data-ficha-resumen]").textContent = f.resumen;
    $("[data-ficha-specs]").innerHTML = f.specs.map(function (s) { return "<div><dt>" + s[0] + "</dt><dd>" + s[1] + "</dd></div>"; }).join("");
    pintarFicha();
    fOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    $("[data-cerrar-ficha]").focus();
    window.cauce.track("ver_ficha", { producto: id });
  }
  function cerrarFicha() {
    fOverlay.hidden = true;
    document.body.style.overflow = "";
    if (ficha.origen) ficha.origen.focus();
  }
  fOverlay.addEventListener("click", function (e) {
    if (e.target === fOverlay || e.target.closest("[data-cerrar-ficha]")) return cerrarFicha();
    var est = e.target.closest("[data-f-estado]"), mod = e.target.closest("[data-f-modelo]");
    if (est) { ficha.estado = est.dataset.fEstado; pintarFicha(); }
    else if (mod) { ficha.modelo = mod.dataset.fModelo; pintarFicha(); }
    else if (e.target.closest("[data-f-mas]")) { ficha.n++; pintarFicha(); }
    else if (e.target.closest("[data-f-menos]")) { ficha.n = Math.max(1, ficha.n - 1); pintarFicha(); }
    else if (e.target.closest("[data-f-agregar]")) {
      var f = FICHAS[ficha.id];
      var k = claveDe(ficha.id, state.modo, ficha.estado, ficha.modelo);
      agregar(k, { id: ficha.id, nombre: f.nombre, modo: state.modo, licencia: f.licencia, detalle: detalleDe(ficha.id, ficha.estado, ficha.modelo) }, ficha.n);
      cerrarFicha();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!fOverlay.hidden) cerrarFicha();
    else if (!overlay.hidden) cerrarPanel();
  });

  // ---------- controles de filtros ----------
  $$("[data-modo]").forEach(function (b) { b.addEventListener("click", function () { state.modo = b.dataset.modo; render(); window.cauce.track("tienda_modo", { modo: state.modo }); }); });
  $$("[data-plazo]").forEach(function (b) { b.addEventListener("click", function () { state.plazo = b.dataset.plazo; render(); }); });
  $$("[data-estado]").forEach(function (b) { b.addEventListener("click", function () { state.estado = b.dataset.estado; render(); }); });
  $$(".cat-btn").forEach(function (b) {
    b.addEventListener("click", function () { state.cat = b.dataset.cat; state.sub = "todo"; render(); window.cauce.track("filtro_tienda", { categoria: state.cat }); });
  });
  $$(".sub-btn").forEach(function (b) {
    b.addEventListener("click", function () { state.cat = b.dataset.subCat; state.sub = state.sub === b.dataset.sub ? "todo" : b.dataset.sub; render(); });
  });
  var buscarT;
  $("[data-buscar-input]").addEventListener("input", function (e) {
    clearTimeout(buscarT);
    var v = e.target.value.trim();
    buscarT = setTimeout(function () { state.q = v; render(); if (v) window.cauce.track("tienda_buscar", { termino: v }); }, 200);
  });
  $("select[data-orden]").addEventListener("change", function (e) { state.orden = e.target.value; render(); });
  $$("[data-ir-modo]").forEach(function (a) { a.addEventListener("click", function () { state.modo = a.dataset.irModo; state.cat = "todo"; state.sub = "todo"; render(); }); });

  // Enlaces directos: /tienda/#alquilar, /tienda/#licencias, /tienda/#pos, /tienda/#redes …
  function aplicarHash() {
    var hash = location.hash.replace("#", "");
    if (hash === "alquilar") { state.modo = "alquiler"; state.cat = "todo"; state.sub = "todo"; }
    else if ($('.cat-btn[data-cat="' + hash + '"]')) { state.modo = "compra"; state.cat = hash; state.sub = "todo"; }
    else return false;
    render();
    catalogo.scrollIntoView();
    return true;
  }
  window.addEventListener("hashchange", aplicarHash);
  if (!aplicarHash()) render();
})();
