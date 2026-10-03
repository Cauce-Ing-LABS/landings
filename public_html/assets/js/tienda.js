/* Tienda de tecnología: modo Comprar / Alquilar, plazo del alquiler y filtros por categoría */
(function () {
  var fmt = function (n) { return "$" + Math.round(n).toLocaleString("es-CO"); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  var cards = $$(".producto");
  var catalogo = document.getElementById("catalogo");
  var plazoBox = document.querySelector(".tienda .plazo");
  var nota = document.querySelector("[data-nota-modo]");
  var state = { modo: "compra", plazo: "24", cat: "todo" };

  var disponible = function (card) { return card.dataset[state.modo] === "true"; };

  function mensaje(card) {
    var nombre = card.dataset.nombre, spec = card.dataset.spec;
    if (state.modo === "compra") {
      return card.dataset.licencia
        ? "Hola Cauce, quiero cotizar la licencia: " + nombre + ".\n\nNúmero de usuarios o equipos: \nCiudad: "
        : "Hola Cauce, quiero comprar: " + nombre + " (" + spec + ").\n\nCantidad: \nCiudad: ";
    }
    if (card.dataset.precios) {
      var precio = JSON.parse(card.dataset.precios)[state.plazo];
      return "Hola Cauce, quiero alquilar el " + nombre + " a " + state.plazo + " meses (" + fmt(precio) + "/mes + IVA, con soporte).\n\nCantidad: \nCiudad: ";
    }
    return "Hola Cauce, quiero alquilar: " + nombre + " (" + spec + ") a " + state.plazo + " meses.\n\nCantidad: \nCiudad: ";
  }

  function precioTexto(card) {
    if (state.modo === "compra") return card.dataset.licencia ? "Precio según usuarios y plan" : "Precio a cotizar";
    if (card.dataset.precios) {
      return "<b>" + fmt(JSON.parse(card.dataset.precios)[state.plazo]) + "</b>/mes + IVA · con soporte · " + state.plazo + " meses";
    }
    return "Cuota mensual a cotizar";
  }

  function render() {
    $$("[data-modo]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.modo === state.modo)); });
    $$("[data-plazo]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.plazo === state.plazo)); });
    $$(".filter").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filter === state.cat)); });
    plazoBox.hidden = state.modo !== "alquiler";
    nota.textContent = state.modo === "alquiler"
      ? "En alquiler solo ves los equipos que se pueden alquilar. Los portátiles muestran su cuota mensual con soporte incluido; el resto te lo cotizamos."
      : "Precios a cotizar: toca \"Lo quiero\" y te respondemos por WhatsApp.";

    var counts = { todo: 0 };
    cards.forEach(function (card) {
      var ok = disponible(card);
      if (ok) { counts.todo++; counts[card.dataset.cat] = (counts[card.dataset.cat] || 0) + 1; }
      card.hidden = !ok || (state.cat !== "todo" && card.dataset.cat !== state.cat);
      card.querySelector("[data-precio-texto]").innerHTML = precioTexto(card);
      card.querySelector("[data-cta-texto]").textContent = card.dataset.licencia ? "Cotizar" : "Lo quiero";
      card.querySelector(".btn-want").href = window.cauce.waLink(mensaje(card));
    });
    $$("[data-count]").forEach(function (el) {
      var n = counts[el.dataset.count] || 0;
      el.textContent = n;
      el.closest(".filter").hidden = n === 0;
    });
    if (state.cat !== "todo" && !counts[state.cat]) { state.cat = "todo"; render(); }
  }

  $$("[data-modo]").forEach(function (b) {
    b.addEventListener("click", function () {
      state.modo = b.dataset.modo;
      render();
      window.cauce.track("tienda_modo", { modo: state.modo });
    });
  });
  $$("[data-plazo]").forEach(function (b) {
    b.addEventListener("click", function () { state.plazo = b.dataset.plazo; render(); });
  });
  $$(".filter").forEach(function (b) {
    b.addEventListener("click", function () {
      state.cat = b.dataset.filter;
      render();
      window.cauce.track("filtro_tienda", { categoria: state.cat, modo: state.modo });
    });
  });
  // Botones "Comprar" / "Alquilar" fuera del catálogo: fijan el modo y bajan al catálogo
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
