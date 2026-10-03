/* Tienda de tecnología: modo Comprar / Alquilar, plazo, filtros y pedido (carrito) que se envía en un solo mensaje */
(function () {
  var fmt = function (n) { return "$" + Math.round(n).toLocaleString("es-CO"); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var KEY = "cauce_pedido";

  var cards = $$(".producto");
  var planes = $$(".producto-plan");
  var catalogo = document.getElementById("catalogo");
  var state = { modo: "compra", plazo: "24", cat: "todo" };

  // pedido: { "id|modo": { id, nombre, modo, licencia, cantidad } }
  var pedido = {};
  try {
    var guardado = JSON.parse(localStorage.getItem(KEY) || "null");
    if (guardado && guardado.items) { pedido = guardado.items; state.plazo = guardado.plazo || state.plazo; }
  } catch (e) { pedido = {}; }
  function guardar() {
    try { localStorage.setItem(KEY, JSON.stringify({ items: pedido, plazo: state.plazo })); } catch (e) { /* sin almacenamiento */ }
  }

  var clave = function (el) { return el.dataset.id + "|" + (el.classList.contains("producto-plan") ? "alquiler" : state.modo); };
  var precioPlan = function (id) {
    var plan = planes.filter(function (p) { return p.dataset.id === id; })[0];
    return plan ? JSON.parse(plan.dataset.precios)[state.plazo] : null;
  };

  // ---------- mensaje único ----------
  function lineas(modo) {
    return Object.keys(pedido).map(function (k) { return pedido[k]; })
      .filter(function (it) { return it.modo === modo; })
      .map(function (it) {
        var extra = "";
        var precio = precioPlan(it.id);
        if (precio) extra = " (" + fmt(precio) + "/mes por equipo + IVA, con soporte)";
        else if (it.licencia) extra = " (licencia)";
        return "• " + it.cantidad + " × " + it.nombre + extra;
      });
  }
  function mensaje() {
    var compra = lineas("compra"), alquiler = lineas("alquiler");
    var partes = ["Hola Cauce, quiero cotizar este pedido:"];
    if (compra.length) partes.push("", "Comprar:", compra.join("\n"));
    if (alquiler.length) partes.push("", "Alquilar a " + state.plazo + " meses:", alquiler.join("\n"));
    partes.push("", "Empresa: ", "Ciudad: ");
    return partes.join("\n");
  }
  var totalItems = function () { return Object.keys(pedido).reduce(function (s, k) { return s + pedido[k].cantidad; }, 0); };

  // ---------- render ----------
  function precioTexto(card) {
    if (state.modo === "compra") return card.dataset.licencia ? "Precio según usuarios y plan" : "Te enviamos el precio";
    return "Cuota mensual a cotizar";
  }

  function pintarControl(el) {
    var it = pedido[clave(el)];
    el.querySelector("[data-add]").hidden = !!it;
    el.querySelector("[data-qty]").hidden = !it;
    if (it) el.querySelector("[data-n]").textContent = it.cantidad;
    el.classList.toggle("en-pedido", !!it);
  }

  function render() {
    $$("[data-modo]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.modo === state.modo)); });
    $$("[data-plazo]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.plazo === state.plazo)); });
    $$(".filter").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filter === state.cat)); });
    $$("[data-ayuda]").forEach(function (p) { p.hidden = p.dataset.ayuda !== state.modo; });
    document.querySelector(".tienda .plazo").hidden = state.modo !== "alquiler";
    document.querySelector("[data-planes]").hidden = state.modo !== "alquiler" || (state.cat !== "todo" && state.cat !== "computo");
    document.querySelector("[data-catalogo-titulo]").textContent = state.modo === "alquiler" ? "Más equipos en alquiler" : "Catálogo";

    planes.forEach(function (p) {
      p.querySelector("[data-precio]").textContent = fmt(JSON.parse(p.dataset.precios)[state.plazo]);
      p.querySelector("[data-plazo-label]").textContent = state.plazo;
      pintarControl(p);
    });

    var counts = { todo: 0 };
    cards.forEach(function (card) {
      var ok = card.dataset[state.modo] === "true";
      if (ok) { counts.todo++; counts[card.dataset.cat] = (counts[card.dataset.cat] || 0) + 1; }
      card.hidden = !ok || (state.cat !== "todo" && card.dataset.cat !== state.cat);
      card.querySelector("[data-precio-texto]").textContent = precioTexto(card);
      pintarControl(card);
    });
    $$("[data-count]").forEach(function (el) {
      var n = counts[el.dataset.count] || 0;
      el.textContent = n;
      el.closest(".filter").hidden = n === 0;
    });
    if (state.cat !== "todo" && !counts[state.cat]) { state.cat = "todo"; render(); return; }
    renderPedido();
  }

  // ---------- pedido: barra y panel ----------
  var bar = document.querySelector("[data-pedido-bar]");
  var overlay = document.querySelector("[data-pedido-overlay]");
  var lista = document.querySelector("[data-pedido-lista]");

  function grupo(titulo, modo) {
    var items = Object.keys(pedido).filter(function (k) { return pedido[k].modo === modo; });
    if (!items.length) return "";
    return '<div class="pedido-grupo"><p class="pedido-grupo-titulo">' + titulo + "</p>" + items.map(function (k) {
      var it = pedido[k];
      var precio = precioPlan(it.id);
      var detalle = precio ? fmt(precio) + "/mes por equipo + IVA" : (it.licencia ? "Licencia · precio según plan" : (modo === "alquiler" ? "Cuota a cotizar" : "Precio a cotizar"));
      return '<div class="pedido-item" data-key="' + k + '"><div><p class="pedido-nombre">' + it.nombre + '</p><p class="pedido-detalle">' + detalle + '</p></div>' +
        '<div class="qty"><button type="button" data-p-menos aria-label="Quitar uno">−</button><output>' + it.cantidad + '</output><button type="button" data-p-mas aria-label="Agregar otro">+</button></div>' +
        '<button type="button" class="pedido-quitar" data-p-quitar aria-label="Quitar ' + it.nombre + '">✕</button></div>';
    }).join("") + "</div>";
  }

  function renderPedido() {
    var n = totalItems();
    bar.hidden = n === 0;
    document.body.classList.toggle("con-pedido", n > 0);
    document.querySelector("[data-pedido-total]").textContent = n + (n === 1 ? " producto" : " productos");
    lista.innerHTML = n
      ? grupo("Comprar", "compra") + grupo("Alquilar a " + state.plazo + " meses", "alquiler")
      : '<p class="pedido-vacio">Tu pedido está vacío. Agrega productos desde el catálogo.</p>';
    $$("[data-enviar-pedido]").forEach(function (a) {
      a.setAttribute("aria-disabled", n ? "false" : "true");
      a.href = n ? window.cauce.waLink(mensaje()) : "#catalogo";
    });
    guardar();
  }

  function cambiar(k, delta, base) {
    if (!pedido[k]) {
      if (delta <= 0) return;
      pedido[k] = base;
      window.cauce.track("pedido_agregar", { producto: base.id, modo: base.modo });
    } else {
      pedido[k].cantidad += delta;
      if (pedido[k].cantidad <= 0) delete pedido[k];
    }
    render();
  }

  function base(el) {
    var esPlan = el.classList.contains("producto-plan");
    return { id: el.dataset.id, nombre: el.dataset.nombre, modo: esPlan ? "alquiler" : state.modo, licencia: !!el.dataset.licencia, cantidad: 1 };
  }

  planes.concat(cards).forEach(function (el) {
    el.querySelector("[data-add]").addEventListener("click", function () { cambiar(clave(el), 1, base(el)); });
    el.querySelector("[data-mas]").addEventListener("click", function () { cambiar(clave(el), 1); });
    el.querySelector("[data-menos]").addEventListener("click", function () { cambiar(clave(el), -1); });
  });

  lista.addEventListener("click", function (e) {
    var item = e.target.closest(".pedido-item");
    if (!item) return;
    var k = item.dataset.key;
    if (e.target.closest("[data-p-mas]")) cambiar(k, 1);
    else if (e.target.closest("[data-p-menos]")) cambiar(k, -1);
    else if (e.target.closest("[data-p-quitar]")) { delete pedido[k]; render(); }
  });

  function abrir() { overlay.hidden = false; document.body.style.overflow = "hidden"; overlay.querySelector("[data-cerrar-pedido]").focus(); }
  function cerrar() { overlay.hidden = true; document.body.style.overflow = ""; }
  document.querySelector("[data-abrir-pedido]").addEventListener("click", abrir);
  overlay.querySelector("[data-cerrar-pedido]").addEventListener("click", cerrar);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) cerrar(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !overlay.hidden) cerrar(); });
  document.querySelector("[data-vaciar-pedido]").addEventListener("click", function () { pedido = {}; render(); cerrar(); });

  // ---------- controles ----------
  $$("[data-modo]").forEach(function (b) {
    b.addEventListener("click", function () { state.modo = b.dataset.modo; render(); window.cauce.track("tienda_modo", { modo: state.modo }); });
  });
  $$("[data-plazo]").forEach(function (b) {
    b.addEventListener("click", function () { state.plazo = b.dataset.plazo; render(); });
  });
  $$(".filter").forEach(function (b) {
    b.addEventListener("click", function () { state.cat = b.dataset.filter; render(); window.cauce.track("filtro_tienda", { categoria: state.cat, modo: state.modo }); });
  });
  $$("[data-ir-modo]").forEach(function (a) {
    a.addEventListener("click", function () { state.modo = a.dataset.irModo; state.cat = "todo"; render(); });
  });

  // Enlaces directos: /tienda/#licencias, /tienda/#alquilar, /tienda/#pos …
  function aplicarHash() {
    var hash = location.hash.replace("#", "");
    if (hash === "alquilar") { state.modo = "alquiler"; state.cat = "todo"; }
    else if (document.querySelector('.filter[data-filter="' + hash + '"]')) { state.modo = "compra"; state.cat = hash; }
    else return false;
    render();
    catalogo.scrollIntoView();
    return true;
  }
  window.addEventListener("hashchange", aplicarHash);
  if (!aplicarHash()) render();
})();
