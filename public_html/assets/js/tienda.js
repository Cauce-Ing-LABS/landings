/* Tienda de tecnología: el catálogo se lee de /tienda/productos.csv (editar solo ese archivo para actualizar productos).
   Filtros (modo, plazo, estado, categoría, búsqueda), paginación, ficha con opciones y pedido en un solo mensaje. */
(function () {
  var CSV_URL = "/tienda/productos.csv";
  var POR_PAGINA = 12;
  var KEY = "cauce_pedido_v3";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var sinTildes = function (s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
  var slug = function (s) { return sinTildes(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var lista = function (s, sep) { return String(s || "").split(sep || "|").map(function (x) { return x.trim(); }).filter(Boolean); };
  var esSi = function (s) { return /^(si|sí|s|x|1|true)$/i.test(String(s || "").trim()); };

  // ---------- ilustraciones (si el producto no tiene imagen propia) ----------
  var S = 'fill="#ffffff" stroke="#0d1b2a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  var N = 'fill="none" stroke="#0d1b2a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  var A = 'fill="none" stroke="#0fb8d9" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';
  var ICONOS = {
    portatil: '<rect x="18" y="16" width="60" height="40" rx="3" ' + S + '/><path d="M10 64 H86 L82 70 H14 Z" ' + S + '/><path d="M28 44 C 36 44 36 30 44 30 S 52 40 60 36 S 66 28 70 28" ' + A + "/>",
    torre: '<rect x="10" y="12" width="54" height="38" rx="3" ' + S + '/><path d="M37 50 V60 M26 62 H48" ' + N + '/><rect x="70" y="14" width="16" height="50" rx="3" ' + S + '/><circle cx="78" cy="24" r="2.5" fill="#0fb8d9"/><path d="M20 38 L30 28 L38 34 L52 22" ' + A + "/>",
    mini: '<rect x="24" y="30" width="48" height="26" rx="4" ' + S + '/><circle cx="62" cy="43" r="2.5" fill="#0fb8d9"/><path d="M32 43 H48" ' + A + '/><path d="M18 62 H78" ' + N + "/>",
    todoenuno: '<rect x="12" y="10" width="72" height="46" rx="4" ' + S + '/><path d="M40 56 L36 70 H60 L56 56" ' + S + '/><path d="M24 40 L36 28 L46 36 L60 22" ' + A + "/>",
    monitor: '<rect x="10" y="10" width="76" height="48" rx="3" ' + S + '/><path d="M48 58 V68 M34 70 H62" ' + N + '/><path d="M22 22 H52 M22 30 H44" ' + A + "/>",
    teclado: '<rect x="8" y="30" width="62" height="30" rx="4" ' + S + '/><path d="M16 38 H20 M26 38 H30 M36 38 H40 M46 38 H50 M56 38 H60 M18 46 H58 M26 53 H52" ' + N + '/><path d="M80 34 C 74 34 72 40 72 46 C 72 54 76 58 80 58 C 86 58 88 52 88 46 C 88 40 86 34 80 34 Z" ' + S + '/><path d="M80 34 V44" ' + A + "/>",
    mouse: '<path d="M48 12 C 34 12 30 24 30 36 V50 C 30 62 38 70 48 70 C 58 70 66 62 66 50 V36 C 66 24 62 12 48 12 Z" ' + S + '/><path d="M48 12 V32" ' + A + "/>",
    audio: '<path d="M20 50 V40 A28 28 0 0 1 76 40 V50" ' + N + '/><rect x="14" y="46" width="14" height="22" rx="5" ' + S + '/><rect x="68" y="46" width="14" height="22" rx="5" ' + S + '/><path d="M28 64 C 34 72 44 74 52 72" ' + A + "/>",
    camara: '<circle cx="48" cy="34" r="22" ' + S + '/><circle cx="48" cy="34" r="9" ' + S + '/><circle cx="48" cy="34" r="3" fill="#0fb8d9"/><path d="M36 56 L32 70 H64 L60 56" ' + N + "/>",
    parlante: '<rect x="18" y="16" width="24" height="50" rx="5" ' + S + '/><rect x="54" y="16" width="24" height="50" rx="5" ' + S + '/><circle cx="30" cy="48" r="7" ' + A + '/><circle cx="66" cy="48" r="7" ' + A + "/>",
    docking: '<rect x="10" y="32" width="76" height="22" rx="5" ' + S + '/><path d="M20 43 H28 M34 43 H40 M46 43 H52" ' + N + '/><circle cx="72" cy="43" r="3" fill="#0fb8d9"/><path d="M48 32 V20 H64" ' + A + "/>",
    cargador: '<rect x="26" y="26" width="34" height="30" rx="5" ' + S + '/><path d="M60 41 H72 C 80 41 80 60 72 60 H66" ' + N + '/><path d="M40 34 L36 42 H46 L42 50" ' + A + "/>",
    maletin: '<rect x="12" y="26" width="72" height="44" rx="6" ' + S + '/><path d="M36 26 V18 H60 V26" ' + N + '/><path d="M12 44 H84" ' + A + "/>",
    base: '<path d="M14 40 L82 26" ' + N + '/><rect x="16" y="22" width="60" height="8" rx="2" transform="rotate(-12 46 26)" ' + S + '/><path d="M30 44 L22 68 M66 36 L74 68" ' + A + "/>",
    cable: '<path d="M14 58 C 30 58 30 26 48 26 S 66 58 82 58" ' + N + '/><rect x="8" y="52" width="14" height="12" rx="2" ' + S + '/><rect x="74" y="52" width="14" height="12" rx="2" ' + S + '/><path d="M44 26 H52" ' + A + "/>",
    generico: '<rect x="20" y="16" width="56" height="50" rx="6" ' + S + '/><path d="M32 40 H64 M32 50 H52" ' + A + "/>",
  };
  function iconoDe(p) {
    var t = sinTildes(p.subcategoria + " " + p.nombre + " " + p.categoria);
    var reglas = [["todo en uno", "todoenuno"], ["mini pc", "mini"], ["combo", "torre"], ["cpu", "torre"], ["torre", "torre"], ["escritorio", "torre"],
      ["portatil", "portatil"], ["monitor", "monitor"], ["teclado", "teclado"], ["mouse", "mouse"], ["diadema", "audio"], ["camara", "camara"],
      ["parlante", "parlante"], ["docking", "docking"], ["expansion", "docking"], ["cargador", "cargador"], ["maletin", "maletin"], ["morral", "maletin"],
      ["base", "base"], ["cable", "cable"], ["adaptador", "cable"]];
    for (var i = 0; i < reglas.length; i++) if (t.indexOf(reglas[i][0]) !== -1) return ICONOS[reglas[i][1]];
    return ICONOS.generico;
  }
  var dibujo = function (p) { return '<svg viewBox="0 0 96 82" aria-hidden="true"><circle cx="48" cy="42" r="36" fill="#d5f1f7"/>' + iconoDe(p) + "</svg>"; };
  // Columna "imagen": una o varias fotos separadas por "|". Basta el nombre del archivo (se busca en /tienda/img/);
  // también acepta una ruta o URL completa.
  var rutaImagen = function (v) { return /^(https?:)?\/|^\.\//.test(v) ? v : "/tienda/img/" + v; };
  var media = function (p) {
    return p.imagenes.length
      ? '<img src="' + esc(p.imagenes[0]) + '" alt="' + esc(p.nombre) + '" width="400" height="400" loading="lazy" decoding="async" data-foto>'
      : dibujo(p);
  };

  // ---------- lectura del CSV (acepta ";" o "," y archivos guardados por Excel en UTF-8 o ANSI) ----------
  function decodificar(buf) {
    try { return new TextDecoder("utf-8", { fatal: true }).decode(buf); }
    catch (e) { return new TextDecoder("windows-1252").decode(buf); }
  }
  function parseCSV(texto) {
    texto = texto.replace(/^﻿/, "");
    var primera = texto.split(/\r?\n/)[0];
    var sep = (primera.split(";").length >= primera.split(",").length) ? ";" : ",";
    var filas = [], fila = [], campo = "", comillas = false;
    for (var i = 0; i < texto.length; i++) {
      var c = texto[i];
      if (comillas) {
        if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else comillas = false; }
        else campo += c;
      } else if (c === '"') comillas = true;
      else if (c === sep) { fila.push(campo); campo = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && texto[i + 1] === "\n") i++;
        fila.push(campo); filas.push(fila); fila = []; campo = "";
      } else campo += c;
    }
    if (campo || fila.length) { fila.push(campo); filas.push(fila); }
    var cab = filas.shift().map(function (h) { return slug(h).replace(/-/g, ""); });
    return filas.filter(function (f) { return f.some(function (x) { return x.trim(); }); }).map(function (f) {
      var o = {};
      cab.forEach(function (h, j) { o[h] = (f[j] || "").trim(); });
      return o;
    });
  }
  function aProducto(r, i) {
    var estado = sinTildes(r.estado || "");
    var estados = !r.estado ? null : (estado.indexOf("nuevo") !== -1 && estado.indexOf("reacond") !== -1) ? ["Nuevo", "Reacondicionado"]
      : estado.indexOf("reacond") !== -1 ? ["Reacondicionado"] : ["Nuevo"];
    var specs = lista(r.caracteristicas).map(function (x) {
      var k = x.indexOf(":");
      return k === -1 ? ["", x] : [x.slice(0, k).trim(), x.slice(k + 1).trim()];
    });
    var opciones = lista(r.opciones).map(function (g) {
      var k = g.indexOf(":");
      var nombre = k === -1 ? "Opción" : g.slice(0, k).trim();
      return { nombre: nombre, valores: lista(k === -1 ? g : g.slice(k + 1), "/") };
    }).filter(function (g) { return g.valores.length; });
    return {
      id: r.id || slug(r.nombre) || "producto-" + i,
      orden: Number(r.orden) || (i + 1) * 10,
      categoria: r.categoria || "Otros", subcategoria: r.subcategoria || "General",
      nombre: r.nombre || "Producto", referencia: r.referencia || "",
      estados: estados, alquiler: esSi(r.alquiler), destacado: esSi(r.destacado),
      resumen: r.resumen || "", etiquetas: lista(r.etiquetas), specs: specs, opciones: opciones,
      garantia: r.garantia || "", incluye: r.incluye || "", imagenes: lista(r.imagen).map(rutaImagen),
    };
  }

  // ---------- estado ----------
  var PRODUCTOS = [], POR_ID = {}, CATS = [];
  var grid = $("[data-grid='tienda']");
  var catalogo = document.getElementById("catalogo");
  var planes = $$(".producto-plan");
  var paginacion = $("[data-paginacion]");
  var cards = [];
  var state = { modo: "compra", plazo: "24", estado: "todos", cat: "todo", sub: "todo", q: "", orden: "destacados", pagina: 1 };
  var ultimoFiltro = "";
  var fallidas = {}; // fotos que no cargaron: no se repiten en la galería

  var pedido = {}, plan = null;
  try {
    var g = JSON.parse(localStorage.getItem(KEY) || "null");
    if (g && g.items) { pedido = g.items; state.plazo = g.plazo || state.plazo; plan = g.plan || null; }
  } catch (e) { pedido = {}; }
  var guardar = function () { try { localStorage.setItem(KEY, JSON.stringify({ items: pedido, plazo: state.plazo, plan: plan })); } catch (e) { /* sin almacenamiento */ } };
  var items = function () { return Object.keys(pedido).map(function (k) { return pedido[k]; }); };
  var totalItems = function () { return items().reduce(function (s, it) { return s + it.cantidad; }, 0); };
  var nombrePlan = function () {
    var p = planes.filter(function (x) { return x.dataset.id === plan; })[0];
    return p ? p.dataset.nombre.replace(/^Plan /, "") : "";
  };
  var tieneEleccion = function (p) { return (p.estados && p.estados.length > 1) || p.opciones.some(function (o) { return o.valores.length > 1; }); };
  var opcionesPorDefecto = function (p) { return p.opciones.map(function (o) { return o.valores[0]; }); };
  function detalleDe(p, estado, sel) {
    var partes = [];
    if (p.estados && estado) partes.push(estado);
    p.opciones.forEach(function (o, i) { if (o.valores.length > 1 || o.valores.length === 1) partes.push(sel[i]); });
    return partes.filter(Boolean).join(" · ");
  }
  var claveDe = function (id, modo, estado, sel) { return [id, modo, estado || "", (sel || []).join(",")].join("|"); };

  function agregar(k, base, n) {
    if (pedido[k]) pedido[k].cantidad += n;
    else if (base) { base.cantidad = n; pedido[k] = base; window.cauce.track("pedido_agregar", { producto: base.id, modo: base.modo }); }
    else return;
    if (pedido[k].cantidad <= 0) delete pedido[k];
    render();
  }

  function mensaje() {
    var linea = function (it) { return "• " + it.cantidad + " × " + it.nombre + (it.detalle ? " (" + it.detalle + ")" : ""); };
    var compra = items().filter(function (it) { return it.modo === "compra"; }).map(linea);
    var alquiler = items().filter(function (it) { return it.modo === "alquiler"; }).map(linea);
    var partes = ["Hola Cauce, quiero cotizar este pedido:"];
    if (compra.length) partes.push("", "Comprar:", compra.join("\n"));
    if (alquiler.length || plan) {
      partes.push("", "Alquilar en Cali a " + state.plazo + " meses:");
      partes.push("Plan de soporte: " + (plan ? nombrePlan() : "por definir"));
      partes.push(alquiler.length ? alquiler.join("\n") : "Equipos: por definir");
    }
    partes.push("", "Empresa: ", "Ciudad: ");
    return partes.join("\n");
  }

  // ---------- construir catálogo desde el CSV ----------
  function tarjeta(p) {
    var estadoTxt = !p.estados ? "" : p.estados.length > 1 ? "Nuevo o reacondicionado" : p.estados[0];
    var estadoCls = !p.estados ? "" : p.estados.length > 1 ? "es-ambos" : p.estados[0] === "Nuevo" ? "es-nuevo" : "es-reac";
    var nOpc = p.opciones.reduce(function (s, o) { return s * Math.max(1, o.valores.length); }, 1);
    return '<article class="estado producto" data-id="' + esc(p.id) + '">' +
      '<div class="estado-viz">' + (estadoTxt ? '<span class="producto-estado ' + estadoCls + '">' + estadoTxt + "</span>" : "") +
      (p.destacado ? '<span class="producto-tag">Más elegido</span>' : "") + media(p) + "</div>" +
      '<p class="mono symptom-label">' + esc(p.subcategoria) + "</p>" +
      "<h3>" + esc(p.nombre) + "</h3>" +
      (p.referencia ? '<p class="producto-ref">' + esc(p.referencia) + "</p>" : "") +
      '<ul class="producto-chips">' + p.etiquetas.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" +
      '<p class="producto-modelos">' + (nOpc > 1 ? nOpc + " configuraciones disponibles" : "&nbsp;") + "</p>" +
      '<div class="producto-foot"><button type="button" class="btn-ficha" data-ficha>Ver características</button>' +
      (tieneEleccion(p)
        ? '<button type="button" class="btn-add" data-ficha data-elegir>Elegir opciones</button>'
        : '<div class="cart-ctrl" data-cart-ctrl><button type="button" class="btn-add" data-add aria-label="Agregar ' + esc(p.nombre) + ' al pedido">+ Agregar</button>' +
          '<div class="qty" data-qty hidden><button type="button" data-menos aria-label="Quitar uno">−</button><output data-n>1</output><button type="button" data-mas aria-label="Agregar otro">+</button></div></div>') +
      '</div><p class="producto-en-pedido" data-en-pedido hidden></p></article>';
  }

  function construir() {
    // categorías y subcategorías en el orden en que aparecen en el CSV
    PRODUCTOS.forEach(function (p) {
      p.cat = slug(p.categoria); p.sub = slug(p.subcategoria);
      p.buscar = sinTildes([p.nombre, p.referencia, p.categoria, p.subcategoria].concat(p.etiquetas, p.estados || [],
        p.opciones.reduce(function (a, o) { return a.concat(o.valores); }, [])).join(" "));
      var c = CATS.filter(function (x) { return x.id === p.cat; })[0];
      if (!c) { c = { id: p.cat, nombre: p.categoria, subs: [] }; CATS.push(c); }
      if (!c.subs.some(function (s) { return s.id === p.sub; })) c.subs.push({ id: p.sub, nombre: p.subcategoria });
      POR_ID[p.id] = p;
    });

    $("[data-cat-list]").innerHTML = '<li><button type="button" class="cat-btn" data-cat="todo" aria-pressed="true">Todas <span data-count="todo"></span></button></li>' +
      CATS.map(function (c) {
        return '<li data-cat-item="' + c.id + '"><button type="button" class="cat-btn" data-cat="' + c.id + '" aria-pressed="false">' + esc(c.nombre) + ' <span data-count="' + c.id + '"></span></button>' +
          '<ul class="sub-list" data-subs="' + c.id + '" hidden>' + c.subs.map(function (s) {
            return '<li><button type="button" class="sub-btn" data-sub="' + s.id + '" data-sub-cat="' + c.id + '" aria-pressed="false">' + esc(s.nombre) + ' <span data-count-sub="' + c.id + ":" + s.id + '"></span></button></li>';
          }).join("") + "</ul></li>";
      }).join("");

    grid.innerHTML = PRODUCTOS.map(tarjeta).join("");
    cards = $$(".producto", grid);
    // si una foto no existe o el nombre está mal, se muestra el dibujo de la categoría
    $$("img[data-foto]", grid).forEach(function (img) {
      img.addEventListener("error", function () {
        fallidas[img.getAttribute("src")] = true;
        var p = POR_ID[img.closest(".producto").dataset.id];
        img.insertAdjacentHTML("afterend", dibujo(p));
        img.remove();
      });
    });
    cards.forEach(function (card) {
      var p = POR_ID[card.dataset.id];
      var ctrl = $("[data-cart-ctrl]", card);
      if (ctrl) {
        var base = function () {
          var est = p.estados ? p.estados[0] : "";
          return { id: p.id, nombre: p.nombre, modo: state.modo, detalle: detalleDe(p, est, opcionesPorDefecto(p)) };
        };
        $("[data-add]", ctrl).addEventListener("click", function () { agregar(claveDirecta(p), base(), 1); });
        $("[data-mas]", ctrl).addEventListener("click", function () { agregar(claveDirecta(p), base(), 1); });
        $("[data-menos]", ctrl).addEventListener("click", function () { agregar(claveDirecta(p), base(), -1); });
      }
      $$("[data-ficha]", card).forEach(function (b) { b.addEventListener("click", function () { abrirFicha(p.id, b); }); });
    });
    $$(".cat-btn").forEach(function (b) {
      b.addEventListener("click", function () { state.cat = b.dataset.cat; state.sub = "todo"; render(); window.cauce.track("filtro_tienda", { categoria: state.cat }); });
    });
    $$(".sub-btn").forEach(function (b) {
      b.addEventListener("click", function () { state.cat = b.dataset.subCat; state.sub = state.sub === b.dataset.sub ? "todo" : b.dataset.sub; render(); });
    });

    // Sin datos estructurados de Product: Google los exige con precio, reseñas o calificación,
    // y la tienda no publica precios
  }

  // ---------- filtros ----------
  function pasa(p, ignorarCat) {
    if (state.modo === "alquiler" && !p.alquiler) return false;
    if (state.estado !== "todos") {
      if (!p.estados || p.estados.indexOf(state.estado) === -1) return false;
    }
    if (state.q && !sinTildes(state.q).split(/\s+/).every(function (t) { return p.buscar.indexOf(t) !== -1; })) return false;
    if (ignorarCat) return true;
    if (state.cat !== "todo" && p.cat !== state.cat) return false;
    if (state.sub !== "todo" && p.sub !== state.sub) return false;
    return true;
  }
  var claveDirecta = function (p) { return claveDe(p.id, state.modo, p.estados ? p.estados[0] : "", opcionesPorDefecto(p)); };

  function renderPaginacion(paginas) {
    paginacion.hidden = paginas < 2;
    if (paginas < 2) { paginacion.innerHTML = ""; return; }
    var p = state.pagina, b = [];
    b.push('<button type="button" class="pag-btn pag-prev" data-pagina="' + (p - 1) + '"' + (p === 1 ? " disabled" : "") + ">← Anterior</button>");
    for (var i = 1; i <= paginas; i++) {
      if (paginas > 7 && i !== 1 && i !== paginas && Math.abs(i - p) > 1) {
        if (i === 2 || i === paginas - 1) b.push('<span class="pag-sep" aria-hidden="true">…</span>');
        continue;
      }
      b.push('<button type="button" class="pag-btn pag-num" data-pagina="' + i + '"' + (i === p ? ' aria-current="page"' : "") + ' aria-label="Página ' + i + '">' + i + "</button>");
    }
    b.push('<button type="button" class="pag-btn pag-next" data-pagina="' + (p + 1) + '"' + (p === paginas ? " disabled" : "") + ">Siguiente →</button>");
    paginacion.innerHTML = b.join("");
  }

  // ---------- render ----------
  function render() {
    $$("[data-modo]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.modo === state.modo)); });
    $$("[data-plazo]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.plazo === state.plazo)); });
    $$("[data-estado]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.estado === state.estado)); });
    $$(".cat-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.cat === state.cat)); });
    $$(".sub-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.subCat === state.cat && b.dataset.sub === state.sub)); });
    $$("[data-subs]").forEach(function (u) { u.hidden = u.dataset.subs !== state.cat; });
    $$("[data-ayuda]").forEach(function (p) { p.hidden = p.dataset.ayuda !== state.modo; });
    $(".tienda .plazo").hidden = state.modo !== "alquiler";

    var counts = { todo: 0 }, subs = {};
    PRODUCTOS.forEach(function (p) {
      if (!pasa(p, true)) return;
      counts.todo++;
      counts[p.cat] = (counts[p.cat] || 0) + 1;
      subs[p.cat + ":" + p.sub] = (subs[p.cat + ":" + p.sub] || 0) + 1;
    });
    $$("[data-count]").forEach(function (el) {
      var n = counts[el.dataset.count] || 0;
      el.textContent = n;
      if (el.dataset.count !== "todo") el.closest("[data-cat-item]").hidden = n === 0;
    });
    $$("[data-count-sub]").forEach(function (el) {
      var n = subs[el.dataset.countSub] || 0;
      el.textContent = n;
      el.closest("li").hidden = n === 0;
    });
    if (state.cat !== "todo" && !counts[state.cat]) { state.cat = "todo"; state.sub = "todo"; return render(); }
    if (state.sub !== "todo" && !subs[state.cat + ":" + state.sub]) { state.sub = "todo"; return render(); }

    // orden + paginación
    var ordenados = PRODUCTOS.slice().sort(function (a, b) {
      if (state.orden === "nombre") return a.nombre.localeCompare(b.nombre, "es");
      return (b.destacado - a.destacado) || (a.orden - b.orden);
    });
    ordenados.forEach(function (p) { grid.appendChild(grid.querySelector('[data-id="' + CSS.escape(p.id) + '"]')); });
    var filtro = [state.modo, state.estado, state.cat, state.sub, state.q, state.orden].join("|");
    if (filtro !== ultimoFiltro) { state.pagina = 1; ultimoFiltro = filtro; }
    var enOrden = ordenados.filter(function (p) { return pasa(p, false); });
    var visibles = enOrden.length;
    var paginas = Math.max(1, Math.ceil(visibles / POR_PAGINA));
    state.pagina = Math.min(Math.max(1, state.pagina), paginas);
    var desde = (state.pagina - 1) * POR_PAGINA, hasta = desde + POR_PAGINA;
    var enPagina = {};
    enOrden.slice(desde, hasta).forEach(function (p) { enPagina[p.id] = true; });

    cards.forEach(function (card) {
      var p = POR_ID[card.dataset.id];
      card.hidden = !enPagina[p.id];
      var ctrl = $("[data-cart-ctrl]", card);
      if (ctrl) {
        var it = pedido[claveDirecta(p)];
        $("[data-add]", ctrl).hidden = !!it;
        $("[data-qty]", ctrl).hidden = !it;
        if (it) $("[data-n]", ctrl).textContent = it.cantidad;
      }
      var n = items().filter(function (x) { return x.id === p.id && x.modo === state.modo; }).reduce(function (s, x) { return s + x.cantidad; }, 0);
      var tag = $("[data-en-pedido]", card);
      tag.hidden = !n;
      tag.textContent = "✓ " + n + " en tu pedido";
      card.classList.toggle("en-pedido", n > 0);
    });

    var mostrarPlanes = state.modo === "alquiler" && !state.q;
    $("[data-planes]").hidden = !mostrarPlanes;
    planes.forEach(function (p) {
      var elegido = p.dataset.id === plan;
      $("[data-plazo-label]", p).textContent = state.plazo;
      $("[data-elegir-plan]", p).setAttribute("aria-pressed", String(elegido));
      p.classList.toggle("en-pedido", elegido);
    });

    var titulo = state.q ? "Resultados para “" + state.q + "”" : "Todo el catálogo";
    if (!state.q && state.cat !== "todo") {
      var c = CATS.filter(function (x) { return x.id === state.cat; })[0];
      titulo = c.nombre;
      if (state.sub !== "todo") titulo += " · " + c.subs.filter(function (s) { return s.id === state.sub; })[0].nombre;
    }
    if (state.modo === "alquiler") titulo = mostrarPlanes ? "2. Elige los computadores que quieres alquilar" : titulo + " en alquiler";
    $("[data-titulo]").textContent = titulo;
    $("[data-resultados]").textContent =
      (visibles > POR_PAGINA ? "Mostrando " + (desde + 1) + " a " + Math.min(hasta, visibles) + " de " + visibles + " productos" : visibles + (visibles === 1 ? " producto" : " productos")) +
      (state.modo === "alquiler" ? " · alquiler solo en Cali" : " · entrega en Cali");
    $("[data-vacio]").hidden = visibles > 0;
    renderPaginacion(paginas);
    renderPedido();
  }

  // ---------- pedido ----------
  var bar = $("[data-pedido-bar]"), overlay = $("[data-pedido-overlay]"), listaPedido = $("[data-pedido-lista]");
  function grupo(titulo, modo) {
    var ks = Object.keys(pedido).filter(function (k) { return pedido[k].modo === modo; });
    var filaPlan = modo === "alquiler" && plan
      ? '<div class="pedido-item pedido-plan"><div><p class="pedido-nombre">Plan de soporte: ' + esc(nombrePlan()) + '</p><p class="pedido-detalle">Seguro y soporte para tus equipos alquilados · cuota a cotizar</p></div><span></span>' +
        '<button type="button" class="pedido-quitar" data-quitar-plan aria-label="Quitar el plan">✕</button></div>'
      : "";
    if (!ks.length && !filaPlan) return "";
    return '<div class="pedido-grupo"><p class="pedido-grupo-titulo">' + titulo + "</p>" + filaPlan + ks.map(function (k) {
      var it = pedido[k];
      return '<div class="pedido-item" data-key="' + esc(k) + '"><div><p class="pedido-nombre">' + esc(it.nombre) + '</p><p class="pedido-detalle">' + esc(it.detalle || (modo === "alquiler" ? "Cuota a cotizar" : "Precio a cotizar")) + "</p></div>" +
        '<div class="qty"><button type="button" data-p-menos aria-label="Quitar uno">−</button><output>' + it.cantidad + '</output><button type="button" data-p-mas aria-label="Agregar otro">+</button></div>' +
        '<button type="button" class="pedido-quitar" data-p-quitar aria-label="Quitar ' + esc(it.nombre) + '">✕</button></div>';
    }).join("") + "</div>";
  }
  function renderPedido() {
    var n = totalItems(), hay = n > 0 || !!plan;
    bar.hidden = !hay;
    document.body.classList.toggle("con-pedido", hay);
    $("[data-pedido-total]").textContent = n ? n + (n === 1 ? " producto" : " productos") + (plan ? " + plan de soporte" : "") : "Plan de soporte";
    listaPedido.innerHTML = hay
      ? grupo("Comprar · entrega en Cali", "compra") + grupo("Alquilar en Cali a " + state.plazo + " meses", "alquiler")
      : '<p class="pedido-vacio">Tu pedido está vacío. Agrega productos desde el catálogo.</p>';
    $$("[data-enviar-pedido]").forEach(function (a) {
      a.setAttribute("aria-disabled", hay ? "false" : "true");
      a.href = hay ? window.cauce.waLink(mensaje()) : "#catalogo";
    });
    guardar();
  }
  listaPedido.addEventListener("click", function (e) {
    if (e.target.closest("[data-quitar-plan]")) { plan = null; render(); return; }
    var item = e.target.closest(".pedido-item");
    if (!item) return;
    var k = item.dataset.key;
    if (e.target.closest("[data-p-mas]")) agregar(k, null, 1);
    else if (e.target.closest("[data-p-menos]")) agregar(k, null, -1);
    else if (e.target.closest("[data-p-quitar]")) { delete pedido[k]; render(); }
  });
  function abrirPanel() { overlay.hidden = false; document.body.style.overflow = "hidden"; $("[data-cerrar-pedido]", overlay).focus(); }
  function cerrarPanel() { overlay.hidden = true; document.body.style.overflow = ""; }
  $("[data-abrir-pedido]").addEventListener("click", abrirPanel);
  $("[data-cerrar-pedido]", overlay).addEventListener("click", cerrarPanel);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) cerrarPanel(); });
  $("[data-vaciar-pedido]").addEventListener("click", function () { pedido = {}; plan = null; render(); cerrarPanel(); });
  planes.forEach(function (p) {
    $("[data-elegir-plan]", p).addEventListener("click", function () {
      plan = plan === p.dataset.id ? null : p.dataset.id;
      if (plan) window.cauce.track("plan_elegido", { plan: plan });
      render();
    });
  });

  // ---------- ficha ----------
  var fOverlay = $("[data-ficha-overlay]"), ficha = { id: null, estado: "", sel: [], n: 1, origen: null };
  function pills(titulo, opciones, actual, attr, idx) {
    if (opciones.length < 2) return "";
    return '<div class="ficha-opciones"><span class="control-label">' + esc(titulo) + '</span><div class="pills">' + opciones.map(function (o) {
      return '<button type="button" class="pill" ' + attr + '="' + esc(o) + '"' + (idx != null ? ' data-grupo="' + idx + '"' : "") + ' aria-pressed="' + (o === actual) + '">' + esc(o) + "</button>";
    }).join("") + "</div></div>";
  }
  function pintarFicha() {
    var p = POR_ID[ficha.id];
    $("[data-ficha-opciones]").innerHTML = pills("Estado", p.estados || [], ficha.estado, "data-f-estado") +
      p.opciones.map(function (o, i) { return pills(o.nombre, o.valores, ficha.sel[i], "data-f-opcion", i); }).join("");
    $("[data-f-n]").textContent = ficha.n;
    $("[data-ficha-modo]").innerHTML = state.modo === "alquiler"
      ? "<strong>Alquiler en Cali a " + state.plazo + " meses.</strong> Cuota mensual a cotizar, con seguro y soporte incluidos."
      : "<strong>Compra.</strong> Te enviamos el precio con la cotización. Entrega en Cali.";
    var k = claveDe(p.id, state.modo, ficha.estado, ficha.sel);
    $("[data-ficha-en-pedido]").textContent = pedido[k] ? "Ya tienes " + pedido[k].cantidad + " con esta configuración en tu pedido." : "";
  }
  function abrirFicha(id, origen) {
    var p = POR_ID[id];
    ficha = { id: id, estado: p.estados ? p.estados[0] : "", sel: opcionesPorDefecto(p), n: 1, origen: origen };
    if (state.estado !== "todos" && p.estados && p.estados.indexOf(state.estado) !== -1) ficha.estado = state.estado;
    var card = cards.filter(function (c) { return c.dataset.id === id; })[0];
    var fm = $("[data-ficha-media]");
    fm.innerHTML = $(".estado-viz", card).innerHTML;
    // galería: miniaturas cuando el producto tiene varias fotos (por ejemplo, una por marca)
    var fotos = p.imagenes.filter(function (u) { return !fallidas[u]; });
    var principal = $("img", fm);
    if (principal && fotos.length > 1) {
      fm.insertAdjacentHTML("beforeend", '<div class="ficha-miniaturas">' + fotos.map(function (u, i) {
        return '<button type="button" class="ficha-mini" data-foto-src="' + esc(u) + '" aria-pressed="' + (i === 0) + '" aria-label="Ver foto ' + (i + 1) + '"><img src="' + esc(u) + '" alt=""></button>';
      }).join("") + "</div>");
    }
    if (principal) principal.addEventListener("error", function () { principal.insertAdjacentHTML("afterend", dibujo(p)); principal.remove(); });
    $("[data-ficha-cat]").textContent = p.categoria + " · " + p.subcategoria;
    $("[data-ficha-nombre]").textContent = p.nombre;
    $("[data-ficha-ref]").textContent = p.referencia;
    $("[data-ficha-resumen]").textContent = p.resumen;
    var filas = p.specs.concat(p.garantia ? [["Garantía", p.garantia]] : [], p.incluye ? [["Incluye", p.incluye]] : []);
    $("[data-ficha-specs]").innerHTML = filas.map(function (s) { return "<div><dt>" + esc(s[0]) + "</dt><dd>" + esc(s[1]) + "</dd></div>"; }).join("");
    pintarFicha();
    fOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    $("[data-cerrar-ficha]").focus();
    window.cauce.track("ver_ficha", { producto: id });
  }
  function cerrarFicha() {
    fOverlay.hidden = true;
    document.body.style.overflow = "";
    if (ficha.origen) ficha.origen.focus();
  }
  fOverlay.addEventListener("click", function (e) {
    if (e.target === fOverlay || e.target.closest("[data-cerrar-ficha]")) return cerrarFicha();
    var mini = e.target.closest("[data-foto-src]");
    if (mini) {
      var principal = $("[data-ficha-media] > img");
      if (principal) principal.src = mini.dataset.fotoSrc;
      $$("[data-foto-src]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === mini)); });
      return;
    }
    var est = e.target.closest("[data-f-estado]"), opc = e.target.closest("[data-f-opcion]");
    if (est) { ficha.estado = est.dataset.fEstado; pintarFicha(); }
    else if (opc) { ficha.sel[Number(opc.dataset.grupo)] = opc.dataset.fOpcion; pintarFicha(); }
    else if (e.target.closest("[data-f-mas]")) { ficha.n++; pintarFicha(); }
    else if (e.target.closest("[data-f-menos]")) { ficha.n = Math.max(1, ficha.n - 1); pintarFicha(); }
    else if (e.target.closest("[data-f-agregar]")) {
      var p = POR_ID[ficha.id];
      agregar(claveDe(p.id, state.modo, ficha.estado, ficha.sel), { id: p.id, nombre: p.nombre, modo: state.modo, detalle: detalleDe(p, ficha.estado, ficha.sel) }, ficha.n);
      cerrarFicha();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!fOverlay.hidden) cerrarFicha();
    else if (!overlay.hidden) cerrarPanel();
  });

  // ---------- controles fijos ----------
  $$("[data-modo]").forEach(function (b) { b.addEventListener("click", function () { state.modo = b.dataset.modo; render(); window.cauce.track("tienda_modo", { modo: state.modo }); }); });
  $$("[data-plazo]").forEach(function (b) { b.addEventListener("click", function () { state.plazo = b.dataset.plazo; render(); }); });
  $$("[data-estado]").forEach(function (b) { b.addEventListener("click", function () { state.estado = b.dataset.estado; render(); }); });
  var buscarT;
  $("[data-buscar-input]").addEventListener("input", function (e) {
    clearTimeout(buscarT);
    var v = e.target.value.trim();
    buscarT = setTimeout(function () { state.q = v; render(); if (v) window.cauce.track("tienda_buscar", { termino: v }); }, 200);
  });
  $("select[data-orden]").addEventListener("change", function (e) { state.orden = e.target.value; render(); });
  paginacion.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pagina]");
    if (!b || b.disabled) return;
    state.pagina = Number(b.dataset.pagina);
    render();
    window.scrollTo({ top: $(".tienda-toolbar").getBoundingClientRect().top + window.pageYOffset - 90 });
    window.cauce.track("tienda_pagina", { pagina: state.pagina });
  });
  $$("[data-ir-modo]").forEach(function (a) { a.addEventListener("click", function () { state.modo = a.dataset.irModo; state.cat = "todo"; state.sub = "todo"; render(); }); });

  function aplicarHash() {
    var hash = location.hash.replace("#", "");
    if (hash === "alquilar") { state.modo = "alquiler"; state.cat = "todo"; state.sub = "todo"; }
    else if (CATS.some(function (c) { return c.id === hash; })) { state.modo = "compra"; state.cat = hash; state.sub = "todo"; }
    else return false;
    render();
    catalogo.scrollIntoView();
    return true;
  }

  // ---------- arranque: leer el CSV ----------
  // Un fallo de red puntual se reintenta una vez; si persiste, se ofrece reintentar a mano o escribir por WhatsApp
  function cargar(intento) {
    $("[data-error-catalogo]").hidden = true;
    $("[data-cargando]").hidden = false;
    fetch(CSV_URL, { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.arrayBuffer(); })
    .then(function (buf) {
      PRODUCTOS = parseCSV(decodificar(buf))
        .filter(function (r) { return r.nombre && (!r.activo || esSi(r.activo)); })
        .map(aProducto);
      if (!PRODUCTOS.length) throw new Error("CSV sin productos activos");
      $("[data-cargando]").hidden = true;
      construir();
      window.addEventListener("hashchange", aplicarHash);
      if (!aplicarHash()) render();
    })
    .catch(function (err) {
      if (window.console) console.warn("No se pudo cargar el catálogo:", err);
      if (intento < 1) { setTimeout(function () { cargar(intento + 1); }, 1500); return; }
      $("[data-cargando]").hidden = true;
      $("[data-error-catalogo]").hidden = false;
    });
  }
  $$("[data-reintentar]").forEach(function (b) { b.addEventListener("click", function () { cargar(0); }); });
  $$("[data-limpiar-filtros]").forEach(function (b) {
    b.addEventListener("click", function () {
      state.estado = "todos"; state.cat = "todo"; state.sub = "todo"; state.q = "";
      var campo = $("[data-buscar-input]"); campo.value = "";
      render(); campo.focus();
    });
  });
  cargar(0);
})();
