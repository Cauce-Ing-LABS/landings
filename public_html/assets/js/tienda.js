/* Tiendas de renting y licencias: filtros por categoría y plazo del renting */
(function () {
  var fmt = function (n) { return "$" + Math.round(n).toLocaleString("es-CO"); };

  // Filtros
  document.querySelectorAll(".filters").forEach(function (group) {
    var grid = document.querySelector('[data-grid="' + group.dataset.store + '"]');
    group.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;
      var cat = btn.dataset.filter;
      group.querySelectorAll(".filter").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      grid.querySelectorAll(".product").forEach(function (card) {
        card.hidden = cat !== "todo" && card.dataset.cat !== cat;
      });
      window.cauce.track("filtro_tienda", { tienda: group.dataset.store, categoria: cat });
    });
  });

  // Plazo (solo renting): actualiza precios y el mensaje de WhatsApp de cada producto
  var plazoBtns = document.querySelectorAll("[data-plazo]");
  plazoBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var plazo = btn.dataset.plazo;
      plazoBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      document.querySelectorAll(".product").forEach(function (card) {
        if (card.dataset.precios) {
          var precios = JSON.parse(card.dataset.precios);
          card.querySelector("[data-precio]").textContent = fmt(precios[plazo]);
          card.querySelector("[data-plazo-label]").textContent = plazo;
        }
        if (card.dataset.msgs) {
          var msgs = JSON.parse(card.dataset.msgs);
          card.querySelector(".btn-want").href = window.cauce.waLink(msgs[plazo]);
        }
      });
    });
  });
})();
