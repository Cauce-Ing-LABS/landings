/* Selector de licencias: arma el mensaje de cotización (sin precios publicados) */
(function () {
  var MAX_USUARIOS = 200;
  var state = { categorias: [], usuarios: 5 };
  var $ = function (sel) { return document.querySelector(sel); };

  var catBtns = document.querySelectorAll("[data-licencia]");
  var qtyOut = $("#qty");
  var amountEl = $("#amount");
  var ivaEl = $("#ivaLine");
  var tierEl = $("#tierLabel");
  var chipsEl = $("#chips");
  var waBtn = $("#waBtn");
  var copyBtn = $("#copyBtn");
  var toast = $("#toast");

  function mensaje() {
    return [
      "Hola, quiero cotizar licencias de software con Cauce:",
      "",
      "• " + state.categorias.join("\n• "),
      "• Usuarios / equipos: " + state.usuarios,
      "",
      "¿Ya tenemos alguna licencia activa?: ",
      "Ciudad: "
    ].join("\n");
  }

  function render() {
    catBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", String(state.categorias.indexOf(b.dataset.licencia) !== -1));
    });
    qtyOut.textContent = state.usuarios;

    var n = state.categorias.length;
    chipsEl.innerHTML = n
      ? state.categorias.map(function (c) { return '<span class="chip">' + c + "</span>"; }).join("")
      : '<span class="dock-empty">Elige lo que necesitas licenciar</span>';
    tierEl.textContent = n ? n + (n === 1 ? " categoría" : " categorías") + " · " + state.usuarios + " usuarios" : "Arma tu cotización";
    amountEl.textContent = n ? "A cotizar" : "—";
    ivaEl.textContent = n ? "Precio según plan y número de usuarios" : " ";

    copyBtn.disabled = !n;
    waBtn.setAttribute("aria-disabled", n ? "false" : "true");
    waBtn.href = n ? window.cauce.waLink(mensaje()) : "#cotizador";
  }

  catBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var c = b.dataset.licencia;
      var i = state.categorias.indexOf(c);
      if (i === -1) state.categorias.push(c); else state.categorias.splice(i, 1);
      render();
    });
  });
  $("#qtyMinus").addEventListener("click", function () { state.usuarios = Math.max(1, state.usuarios - 1); render(); });
  $("#qtyPlus").addEventListener("click", function () { state.usuarios = Math.min(MAX_USUARIOS, state.usuarios + 1); render(); });

  copyBtn.addEventListener("click", function () {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(mensaje()).then(function () {
      window.cauce.track("copiar_resumen", { cotizador: "licencias" });
      toast.classList.add("show");
      setTimeout(function () { toast.classList.remove("show"); }, 2200);
    });
  });

  render();
})();
