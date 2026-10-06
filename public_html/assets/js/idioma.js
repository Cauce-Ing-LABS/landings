/* Selector de idioma: el sitio está en español; los demás idiomas usan la traducción automática de Google,
   que solo se carga cuando el visitante elige otro idioma (se recuerda con la cookie googtrans). */
(function () {
  var IDIOMAS = [
    ["es", "ES", "Español"],
    ["en", "EN", "English"],
    ["pt", "PT", "Português"],
    ["fr", "FR", "Français"],
    ["de", "DE", "Deutsch"],
    ["zh-CN", "中文", "中文（简体）"],
  ];

  function actual() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/);
    var code = m ? decodeURIComponent(m[1]) : "es";
    return IDIOMAS.some(function (i) { return i[0] === code; }) ? code : "es";
  }

  function guardar(code) {
    var valor = code === "es" ? "" : "/es/" + code;
    var vence = code === "es" ? "; expires=Thu, 01 Jan 1970 00:00:00 GMT" : "; max-age=31536000";
    var host = location.hostname;
    document.cookie = "googtrans=" + valor + "; path=/" + vence;
    if (host.indexOf(".") > 0 && !/^\d+(\.\d+){3}$/.test(host)) {
      document.cookie = "googtrans=" + valor + "; path=/; domain=." + host.replace(/^www\./, "") + vence;
    }
  }

  var css = document.createElement("style");
  css.textContent =
    ".idioma{position:relative;}" +
    ".idioma-btn{display:inline-flex; align-items:center; gap:0.35rem; height:38px; padding:0 0.7rem; border:1px solid var(--rule, #d9dee5); border-radius:999px; background:transparent; color:inherit; font:inherit; font-size:0.82rem; font-weight:500; cursor:pointer;}" +
    ".idioma-btn:hover, .idioma-btn[aria-expanded=true]{border-color:var(--flow, #0fb8d9);}" +
    ".idioma-btn svg{width:16px; height:16px;}" +
    ".idioma-lista{position:absolute; right:0; top:calc(100% + 6px); min-width:170px; margin:0; padding:0.35rem; list-style:none; background:#fff; border:1px solid var(--rule, #d9dee5); border-radius:14px; box-shadow:0 18px 40px -18px rgba(13,27,42,0.35); z-index:1000;}" +
    ".idioma-lista button{display:flex; width:100%; justify-content:space-between; gap:1rem; padding:0.55rem 0.75rem; border:0; border-radius:10px; background:none; color:#0d1b2a; font:inherit; font-size:0.9rem; text-align:left; cursor:pointer;}" +
    ".idioma-lista button:hover, .idioma-lista button:focus-visible{background:var(--flow-light, #e3f6fa); outline:none;}" +
    ".idioma-lista button[aria-current=true]{font-weight:600;}" +
    ".idioma-lista .cod{color:var(--ink-mute, #6b7a8c); font-size:0.75rem;}" +
    "@media (max-width:420px){.idioma-btn{padding:0 0.55rem;} .idioma-btn .idioma-cod{display:none;}}" +
    "body > .skiptranslate, .goog-te-banner-frame, #goog-gt-tt, .goog-te-balloon-frame{display:none !important;}" +
    "body{top:0 !important;} .goog-text-highlight{background:none !important; box-shadow:none !important;}";
  document.head.appendChild(css);

  var hoy = actual();
  var info = IDIOMAS.filter(function (i) { return i[0] === hoy; })[0];

  var caja = document.createElement("div");
  caja.className = "idioma notranslate";
  caja.setAttribute("translate", "no");
  caja.innerHTML =
    '<button type="button" class="idioma-btn" aria-haspopup="true" aria-expanded="false" aria-label="Idioma: ' + info[2] + '">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>' +
    '<span class="idioma-cod">' + info[1] + "</span></button>" +
    '<ul class="idioma-lista" hidden>' +
    IDIOMAS.map(function (i) {
      return '<li><button type="button" data-idioma="' + i[0] + '" lang="' + i[0] + '"' + (i[0] === hoy ? ' aria-current="true"' : "") + ">" + i[2] + ' <span class="cod">' + i[1] + "</span></button></li>";
    }).join("") +
    "</ul>";

  var cta = document.querySelector("nav .nav-cta");
  if (!cta) return;
  if (cta.parentNode.classList.contains("nav-inner")) {
    // En la página principal el menú reparte sus hijos de extremo a extremo: el selector va pegado al botón
    var grupo = document.createElement("div");
    grupo.style.cssText = "display:flex; align-items:center; gap:0.5rem;";
    cta.parentNode.insertBefore(grupo, cta);
    grupo.appendChild(caja);
    grupo.appendChild(cta);
  } else {
    cta.parentNode.insertBefore(caja, cta);
  }

  var btn = caja.querySelector(".idioma-btn");
  var lista = caja.querySelector(".idioma-lista");
  function abrir(si) {
    lista.hidden = !si;
    btn.setAttribute("aria-expanded", String(si));
    if (si) lista.querySelector("[aria-current=true]").focus();
  }
  btn.addEventListener("click", function (e) { e.stopPropagation(); abrir(lista.hidden); });
  document.addEventListener("click", function (e) { if (!caja.contains(e.target)) abrir(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lista.hidden) { abrir(false); btn.focus(); } });
  lista.addEventListener("click", function (e) {
    var b = e.target.closest("[data-idioma]");
    if (!b) return;
    var code = b.getAttribute("data-idioma");
    abrir(false);
    if (code === hoy) return;
    if (window.cauce && window.cauce.track) window.cauce.track("cambio_idioma", { idioma: code });
    guardar(code);
    location.reload();
  });

  // Nombres propios que no se traducen
  document.querySelectorAll(".brand .name, .footer-brand .name").forEach(function (el) { el.classList.add("notranslate"); el.setAttribute("translate", "no"); });

  if (hoy === "es") return;
  var destino = document.createElement("div");
  destino.id = "google_translate_element";
  destino.hidden = true;
  document.body.appendChild(destino);
  window.googleTranslateElementInit = function () {
    new window.google.translate.TranslateElement({ pageLanguage: "es", includedLanguages: "en,pt,fr,de,zh-CN", autoDisplay: false }, "google_translate_element");
  };
  var s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.body.appendChild(s);
})();
