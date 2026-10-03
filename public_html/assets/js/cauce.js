/* Cauce · comportamiento compartido del sitio público */
(function () {
  // Reemplazar por los IDs reales de Google Analytics 4 y Google Ads.
  // Mientras tengan las X, no se carga ningún script de Google.
  var CONFIG = {
    GA4_ID: "G-XXXXXXXXXX",
    ADS_ID: "AW-XXXXXXXXXX",
    // Etiquetas de conversión de Google Ads ("AW-XXX/abc123"); vacías = no se envían.
    ADS_CONVERSIONS: {
      click_whatsapp: "",
      click_calendly: "",
      cotizador_whatsapp: ""
    },
    WHATSAPP: "573013682430",
    CALENDLY: "https://calendly.com/cauce-ingenieria/cauce-consultoria-60-min-clon-clon-1"
  };

  var isSet = function (id) { return id && id.indexOf("XXXX") === -1; };
  var page = document.body.getAttribute("data-page") || location.pathname;

  // ---------- Google tag (GA4 + Ads) ----------
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  var tagIds = [CONFIG.GA4_ID, CONFIG.ADS_ID].filter(isSet);
  if (tagIds.length) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + tagIds[0];
    document.head.appendChild(s);
    gtag("js", new Date());
    tagIds.forEach(function (id) { gtag("config", id); });
  }

  function track(name, params) {
    params = params || {};
    params.pagina = page;
    gtag("event", name, params);
    var conv = CONFIG.ADS_CONVERSIONS[name];
    if (isSet(CONFIG.ADS_ID) && conv) gtag("event", "conversion", { send_to: conv });
  }

  // ---------- UTM: se guardan en la sesión para atribuir el lead ----------
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "gclid"];
  var utm = {};
  try {
    var qs = new URLSearchParams(location.search);
    UTM_KEYS.forEach(function (k) { if (qs.get(k)) utm[k] = qs.get(k); });
    if (Object.keys(utm).length) sessionStorage.setItem("cauce_utm", JSON.stringify(utm));
    else utm = JSON.parse(sessionStorage.getItem("cauce_utm") || "{}");
  } catch (e) { utm = {}; }

  function originNote() {
    var parts = [];
    if (utm.utm_source) parts.push(utm.utm_source + (utm.utm_medium ? "/" + utm.utm_medium : ""));
    if (utm.utm_campaign) parts.push(utm.utm_campaign);
    if (!parts.length && utm.gclid) parts.push("google ads");
    return parts.length ? "(Vengo de: " + parts.join(" · ") + ")" : "";
  }

  function waLink(message) {
    var note = originNote();
    var text = note ? message + "\n\n" + note : message;
    return "https://wa.me/" + CONFIG.WHATSAPP + "?text=" + encodeURIComponent(text);
  }

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

  // ---------- Clics: WhatsApp, Calendly, teléfono, correo ----------
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href") || "";

    if (href.indexOf("wa.me/") !== -1) {
      if (a.getAttribute("aria-disabled") === "true") { e.preventDefault(); return; }
      var note = originNote();
      if (note) {
        var url = new URL(href);
        var text = url.searchParams.get("text") || "Hola Cauce";
        if (text.indexOf("(Vengo de:") === -1) {
          url.searchParams.set("text", text + "\n\n" + note);
          a.href = url.toString();
        }
      }
      track(a.hasAttribute("data-cotizador") ? "cotizador_whatsapp" : "click_whatsapp", {
        ubicacion: a.getAttribute("data-ubicacion") || ""
      });
      return;
    }

    if (href.indexOf("calendly.com") !== -1 || a.hasAttribute("data-calendly")) {
      track("click_calendly", { ubicacion: a.getAttribute("data-ubicacion") || "" });
      e.preventDefault();
      loadCalendly()
        .then(function () { Calendly.initPopupWidget({ url: CONFIG.CALENDLY }); })
        .catch(function () { window.open(CONFIG.CALENDLY, "_blank", "noopener"); });
      return;
    }

    if (href.indexOf("mailto:") === 0) track("click_email");
  });

  // ---------- Menú móvil ----------
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.classList.toggle("is-open", !open);
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("is-open");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  // ---------- Aparición suave al hacer scroll ----------
  var fadeEls = document.querySelectorAll(".estado, .pilar, .metodo-step, .aud-card, .faq-item, .value, .svc-card, .entry");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); observer.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    fadeEls.forEach(function (el) { el.classList.add("fadein"); observer.observe(el); });
  }

  // ---------- FAQ: medir qué preguntas se abren ----------
  document.querySelectorAll(".faq-item").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) track("faq_abierta", { pregunta: (d.querySelector("summary") || {}).textContent || "" });
    });
  });

  window.cauce = { track: track, waLink: waLink, loadCalendly: loadCalendly, config: CONFIG };
})();
