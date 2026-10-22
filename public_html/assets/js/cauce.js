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

  // Se adelanta la carga cuando hay intención (cursor, toque, foco) o tras el primer desplazamiento, ya con la página libre
  function prefetchCalendly() { loadCalendly().catch(function () {}); }
  ["pointerover", "touchstart", "focusin"].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (e.target.closest && e.target.closest("a[data-calendly]")) prefetchCalendly();
    }, { passive: true, once: false });
  });
  window.addEventListener("scroll", function () {
    (window.requestIdleCallback || function (f) { setTimeout(f, 1500); })(prefetchCalendly);
  }, { passive: true, once: true });

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
  var fadeEls = document.querySelectorAll(".faq-item, .svc-card, .metodo-step, .estado, .value, .plan, .pilar, .aud-card");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); observer.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    fadeEls.forEach(function (el) { el.classList.add("fadein"); observer.observe(el); });
  }

  // ---------- Caucha: saluda una vez al entrar en pantalla (el movimiento lo define cauce.css) ----------
  var caucha = document.querySelectorAll('img[src*="assets/img/caucha-"]');
  if ("IntersectionObserver" in window && caucha.length) {
    var vivo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("caucha-vivo"); vivo.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    caucha.forEach(function (img) { vivo.observe(img); });
  }

  window.cauce.loadCalendly = loadCalendly;
})();
