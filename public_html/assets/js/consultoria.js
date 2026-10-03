/* Consultoría TI: armador de piezas tipo lego → mensaje de WhatsApp */
(function () {
  var piezas = Array.prototype.slice.call(document.querySelectorAll(".pieza"));
  var orden = piezas.map(function (p) { return p.dataset.pieza; });
  var nombre = {};
  piezas.forEach(function (p) { nombre[p.dataset.pieza] = p.querySelector(".pieza-name").textContent; });

  var elegidas = [];
  var vacia = document.getElementById("torreVacia");
  var count = document.getElementById("torreCount");
  var wa = document.getElementById("torreWa");

  function mensaje() {
    var lista = orden.filter(function (id) { return elegidas.indexOf(id) !== -1; });
    return "Hola Cauce, armé mi solución de consultoría TI:\n\n• " +
      lista.map(function (id) { return nombre[id]; }).join("\n• ") +
      "\n\nEmpresa: \nCiudad: ";
  }

  function render(nuevas) {
    piezas.forEach(function (p) {
      var on = elegidas.indexOf(p.dataset.pieza) !== -1;
      p.classList.toggle("is-on", on);
      p.querySelector(".pieza-toggle").setAttribute("aria-pressed", String(on));
    });
    document.querySelectorAll("[data-en-torre]").forEach(function (el) {
      var on = elegidas.indexOf(el.dataset.enTorre) !== -1;
      el.hidden = !on;
      el.classList.toggle("drop", on && nuevas.indexOf(el.dataset.enTorre) !== -1);
    });
    vacia.hidden = elegidas.length > 0;
    count.textContent = elegidas.length + " de " + orden.length + " piezas";
    document.getElementById("torreCtaN").textContent = elegidas.length ? "(" + elegidas.length + ")" : "";
    wa.setAttribute("aria-disabled", elegidas.length ? "false" : "true");
    wa.href = elegidas.length ? window.cauce.waLink(mensaje()) : "#armador";
  }

  piezas.forEach(function (p) {
    p.querySelector(".pieza-toggle").addEventListener("click", function () {
      var id = p.dataset.pieza;
      var i = elegidas.indexOf(id);
      if (i === -1) { elegidas.push(id); render([id]); } else { elegidas.splice(i, 1); render([]); }
    });
  });

  document.querySelectorAll(".kit").forEach(function (k) {
    k.addEventListener("click", function () {
      var kit = k.dataset.kit.split(",");
      var nuevas = kit.filter(function (id) { return elegidas.indexOf(id) === -1; });
      elegidas = kit.slice();
      render(nuevas);
      window.cauce.track("armador_combinacion", { combinacion: k.textContent });
    });
  });

  document.getElementById("torreReset").addEventListener("click", function () { elegidas = []; render([]); });

  render([]);
})();
