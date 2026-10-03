/* Cauce · comportamiento de las subpáginas (menú móvil, animaciones, agenda de Calendly).
   Requiere medicion.js cargado antes. */
(function () {
  var CALENDLY = window.cauce.config.CALENDLY;

  // ---------- Calendly: se carga solo cuando alguien lo pide ----------
  var calendlyLoading = null;
  function loadCalendly() {
    if (window.Calendly) return Promise.resolve();
    if (calendlyLoading) return calendlyLoading;
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(css);
    calendlyLoading = new Promise(function (resolve, reject) {
      var js = document.createElement("script");
      js.src = "https://assets.calendly.com/assets/external/widget.js";
      js.onload = resolve;
      js.onerror = reject;
      document.head.appendChild(js);
    });
    return calendlyLoading;
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-calendly]");
    if (!a) return;
    e.preventDefault();
    loadCalendly()
      .then(function () { Calendly.initPopupWidget({ url: CALENDLY }); })
      .catch(function () { window.open(CALENDLY, "_blank", "noopener"); });
  });

  // ---------- Menú móvil ----------
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    var close = function () {
      toggle.setAttribute("aria-expanded", "false");
      links.classList.remove("is-open");
    };
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.classList.toggle("is-open", !open);
    });
    links.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("is-open")) { close(); toggle.focus(); }
    });
  }

  // ---------- Aparición suave al hacer scroll ----------
  var fadeEls = document.querySelectorAll(".faq-item, .svc-card, .metodo-step");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); observer.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    fadeEls.forEach(function (el) { el.classList.add("fadein"); observer.observe(el); });
  }

  window.cauce.loadCalendly = loadCalendly;
})();
