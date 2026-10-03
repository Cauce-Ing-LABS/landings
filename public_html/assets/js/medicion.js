/* Cauce · medición para SEO/SEM (Google Analytics 4 + Google Ads). No modifica nada visual. */
(function () {
  // Reemplazar por los IDs reales. Mientras tengan las X, no se carga ningún script de Google.
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

  // ---------- Google tag ----------
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

  // ---------- Clics: WhatsApp, Calendly, correo (solo se miden, no se alteran) ----------
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href") || "";

    if (href.indexOf("wa.me/") !== -1) {
      if (a.getAttribute("aria-disabled") === "true") return;
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
    } else if (href.indexOf("calendly.com") !== -1 || a.hasAttribute("data-calendly")) {
      track("click_calendly", { ubicacion: a.getAttribute("data-ubicacion") || "" });
    } else if (href.indexOf("mailto:") === 0) {
      track("click_email");
    }
  });

  // FAQ: qué preguntas se abren
  document.querySelectorAll(".faq-item").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) track("faq_abierta", { pregunta: (d.querySelector("summary") || {}).textContent || "" });
    });
  });

  window.cauce = { track: track, waLink: waLink, config: CONFIG };
})();
