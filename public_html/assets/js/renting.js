/* Cotizador de renting (precios de referencia: dosier Soporte + Renting, sección 9) */
(function () {
  var PLANES = {
    basico: {
      nombre: "Básico",
      equipo: "portátil reacondicionado i3 / 8 GB",
      soporte: "soporte remoto",
      precios: { 12: 168000, 24: 133000, 36: 122000 }
    },
    estandar: {
      nombre: "Estándar",
      equipo: "portátil reacondicionado certificado i5 / 16 GB",
      soporte: "soporte remoto + 1 visita mensual",
      precios: { 12: 476000, 24: 386000, 36: 357000 }
    },
    premium: {
      nombre: "Premium",
      equipo: "portátil gama alta i5 / 16 GB",
      soporte: "soporte prioritario presencial",
      precios: { 12: 847000, 24: 723000, 36: 683000 }
    }
  };
  var IVA = 0.19;
  var MAX_EQUIPOS = 50;

  var state = { plan: null, plazo: 24, cantidad: 1, extras: [] };

  var fmt = function (n) { return "$" + Math.round(n).toLocaleString("es-CO"); };
  var $ = function (sel) { return document.querySelector(sel); };

  var planBtns = document.querySelectorAll("[data-plan]");
  var plazoBtns = document.querySelectorAll("[data-plazo]");
  var extraBtns = document.querySelectorAll("[data-extra]");
  var qtyOut = $("#qty");
  var amountEl = $("#amount");
  var ivaEl = $("#ivaLine");
  var tierEl = $("#tierLabel");
  var chipsEl = $("#chips");
  var noteEl = $("#dockNote");
  var waBtn = $("#waBtn");
  var copyBtn = $("#copyBtn");
  var toast = $("#toast");

  function total() {
    if (!state.plan) return 0;
    return PLANES[state.plan].precios[state.plazo] * state.cantidad;
  }

  function mensaje() {
    var lineas = ["Hola, quiero cotizar renting de equipos con Cauce:", ""];
    if (state.plan) {
      var p = PLANES[state.plan];
      lineas.push("• Plan " + p.nombre + " (" + p.equipo + " + " + p.soporte + ")");
      lineas.push("• " + state.cantidad + (state.cantidad === 1 ? " equipo" : " equipos") + " a " + state.plazo + " meses");
      lineas.push("• Cuota estimada: " + fmt(total()) + "/mes + IVA (" + fmt(total() * (1 + IVA)) + " con IVA)");
    }
    if (state.extras.length) {
      lineas.push("• " + (state.plan ? "También quiero cotizar: " : "Quiero cotizar: ") + state.extras.join(", "));
    }
    lineas.push("", "Ciudad: ");
    return lineas.join("\n");
  }

  function render() {
    planBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.plan === state.plan)); });
    plazoBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.plazo) === state.plazo)); });
    extraBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(state.extras.indexOf(b.dataset.extra) !== -1)); });
    qtyOut.textContent = state.cantidad;

    document.querySelectorAll("[data-precio-plan]").forEach(function (el) {
      el.textContent = fmt(PLANES[el.dataset.precioPlan].precios[state.plazo]);
    });
    document.querySelectorAll("[data-plazo-label]").forEach(function (el) { el.textContent = state.plazo; });

    var hayAlgo = state.plan || state.extras.length;
    var chips = [];
    if (state.plan) {
      chips.push("Plan " + PLANES[state.plan].nombre);
      chips.push(state.cantidad + (state.cantidad === 1 ? " equipo" : " equipos") + " · " + state.plazo + " meses");
    }
    state.extras.forEach(function (x) { chips.push(x + " (a cotizar)"); });
    chipsEl.innerHTML = chips.length
      ? chips.map(function (c) { return '<span class="chip">' + c + "</span>"; }).join("")
      : '<span class="dock-empty">Elige un plan o agrega equipos</span>';

    if (state.plan) {
      tierEl.textContent = "Cuota mensual estimada · equipo + soporte";
      amountEl.textContent = fmt(total());
      ivaEl.textContent = fmt(total() * (1 + IVA)) + "/mes con IVA";
    } else {
      tierEl.textContent = hayAlgo ? "Cotización a la medida" : "Arma tu plan";
      amountEl.textContent = hayAlgo ? "A cotizar" : "$0";
      ivaEl.innerHTML = "&nbsp;";
    }
    noteEl.textContent = state.extras.length && state.plan
      ? "Los equipos y servicios adicionales se cotizan aparte y te llegan en la propuesta."
      : "";

    copyBtn.disabled = !hayAlgo;
    waBtn.setAttribute("aria-disabled", hayAlgo ? "false" : "true");
    waBtn.href = hayAlgo ? window.cauce.waLink(mensaje()) : "#cotizador";
  }

  planBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      state.plan = state.plan === b.dataset.plan ? null : b.dataset.plan;
      render();
    });
  });
  plazoBtns.forEach(function (b) {
    b.addEventListener("click", function () { state.plazo = Number(b.dataset.plazo); render(); });
  });
  extraBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var x = b.dataset.extra;
      var i = state.extras.indexOf(x);
      if (i === -1) state.extras.push(x); else state.extras.splice(i, 1);
      render();
    });
  });
  $("#qtyMinus").addEventListener("click", function () { state.cantidad = Math.max(1, state.cantidad - 1); render(); });
  $("#qtyPlus").addEventListener("click", function () { state.cantidad = Math.min(MAX_EQUIPOS, state.cantidad + 1); render(); });

  copyBtn.addEventListener("click", function () {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(mensaje()).then(function () {
      window.cauce.track("copiar_resumen", { cotizador: "renting" });
      toast.classList.add("show");
      setTimeout(function () { toast.classList.remove("show"); }, 2200);
    });
  });

  // Enlaces "Cotizar este plan" desde otras secciones de la página
  document.querySelectorAll("[data-preselect]").forEach(function (a) {
    a.addEventListener("click", function () { state.plan = a.dataset.preselect; render(); });
  });

  render();
})();
