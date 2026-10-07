const puppeteer = require("puppeteer-core");
const path = require("path");
const BASE = "http://127.0.0.1:8765";
const SHOTS = path.join(__dirname, "shots");
require("fs").mkdirSync(SHOTS, { recursive: true });

const PAGES = ["/", "/capacitaciones/", "/consultoria-ti/", "/tienda/", "/404.html"];
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); else console.log("  ✓", msg); };
const waText = (href) => new URL(href).searchParams.get("text");

(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`${page.url()} → ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${page.url()} console → ${m.text()}`); });

  // 1) Todas las páginas: sin errores, sin scroll horizontal, capturas
  for (const vp of [{ width: 1440, height: 900, tag: "desk" }, { width: 390, height: 844, tag: "mob", isMobile: true, hasTouch: true }]) {
    await page.setViewport(vp);
    for (const p of PAGES) {
      await page.goto(BASE + p, { waitUntil: "networkidle2" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) fails.push(`scroll horizontal ${overflow}px en ${p} (${vp.tag})`);
      await page.evaluate(() => document.querySelectorAll(".fadein").forEach((e) => e.classList.add("visible")));
      await new Promise((r) => setTimeout(r, 900));
      const name = (p.replace(/\//g, "_").replace(/^_|_$/g, "") || "home") + "-" + vp.tag + ".png";
      await page.screenshot({ path: path.join(SHOTS, name), fullPage: true });
    }
  }
  await page.setViewport({ width: 1440, height: 900 });

  // 2) Página principal: sección nueva con enlaces a las 3 rutas
  console.log("Principal:");
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  const rutas = await page.$$eval("#servicios a", (as) => as.map((a) => a.getAttribute("href")));
  ok(["/capacitaciones/", "/consultoria-ti/", "/tienda/"].every((h) => rutas.includes(h)), "Sección 'Por dónde empezar' enlaza a capacitaciones, consultoría, renting y licencias");
  ok(await page.$eval("#servicios", (s) => s.nextElementSibling && s.nextElementSibling.id === "cafe"), "La sección queda justo antes del Café Cauce");

  // 3) Capacitaciones sin precios
  console.log("Capacitaciones:");
  await page.goto(BASE + "/capacitaciones/", { waitUntil: "networkidle2" });
  const src = await page.content();
  const hits = src.replace(/\$\{[^}]*\}/g, "").match(/.{50}(\$\d|IVA|nomina|viaticos).{20}/g);
  if (hits) console.log("   encontrado:", hits);
  ok(!hits, "Sin precios, IVA ni costos internos en la página");
  await page.click('.master-toggle[data-programa="p1"]');
  await new Promise((r) => setTimeout(r, 700));
  ok(await page.$eval("#amount", (e) => e.textContent) === "28 h", "Programa completo de Alfabetización suma 28 h");
  const ct = waText(await page.$eval("#waBtn", (a) => a.href));
  ok(ct.includes("Alfabetización Digital: completo") && ct.includes("28 horas") && !ct.includes("$"), "Mensaje de WhatsApp con la ruta y las horas, sin precio");

  // 4) Consultoría TI: armador
  console.log("Consultoría TI:");
  await page.goto(BASE + "/consultoria-ti/?utm_source=google&utm_medium=cpc", { waitUntil: "networkidle2" });
  ok(await page.$eval("#torreWa", (a) => a.getAttribute("aria-disabled")) === "true", "Enviar deshabilitado con la torre vacía");
  await page.click('.pieza[data-pieza="desarrollo"] .pieza-toggle');
  await page.click('.pieza[data-pieza="consultoria"] .pieza-toggle');
  const enTorre = await page.$$eval("[data-en-torre]", (els) => els.filter((e) => !e.hidden).map((e) => e.dataset.enTorre));
  ok(enTorre.join(",") === "desarrollo,consultoria", "La torre apila las piezas (consultoría en la base)");
  const t = waText(await page.$eval("#torreWa", (a) => a.href));
  ok(t.includes("• Consultoría\n• Desarrollo a la medida") && t.includes("(Vengo de: google/cpc)"), "Mensaje con las piezas en orden y el origen del anuncio");
  await page.evaluate(() => document.querySelector(".kit").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.click(".kit");
  ok((await page.$$eval("[data-en-torre]", (els) => els.filter((e) => !e.hidden).length)) === 4, "Combinación 'Tengo una idea' arma 4 piezas");
  await page.click("#torreReset");
  ok(await page.$eval("#torreCount", (e) => e.textContent) === "0 de 7 piezas", "Empezar de nuevo vacía la torre");

  // 5) Tienda de tecnología (catálogo desde productos.csv)
  console.log("Tienda:");
  const fs = require("fs");
  const CSV = path.join(__dirname, "..", "public_html", "tienda", "productos.csv");
  const csvOriginal = fs.readFileSync(CSV);
  const cargar = async (url) => { await page.goto("about:blank"); await page.goto(BASE + (url || "/tienda/"), { waitUntil: "networkidle2" }); await page.waitForFunction(() => document.querySelector("[data-cargando]").hidden); };
  await cargar();
  await page.evaluate(() => localStorage.clear());
  await cargar();
  const visibles = () => page.$$eval(".producto", (els) => els.filter((e) => !e.hidden).map((e) => e.dataset.id));
  const tap = (sel) => page.$eval(sel, (b) => b.click());
  ok((await page.$$(".producto")).length === 25, "25 productos leídos del CSV");
  ok((await page.$$eval(".cat-btn", (bs) => bs.map((b) => b.dataset.cat))).join(",") === "todo,portatiles,computadores-de-escritorio,monitores", "Categorías desde el CSV: portátiles, escritorio, monitores");
  ok((await visibles()).length === 12 && (await page.$eval("[data-resultados]", (e) => e.textContent)).startsWith("Mostrando 1 a 12 de 25"), "Paginación: 12 de 25");
  ok(!/\$\d/.test(await page.$eval("#catalogo", (e) => e.innerText)), "Sin precios");
  ok(!(await page.content()).includes("<footer"), "La tienda no tiene footer");

  await tap('.cat-btn[data-cat="computadores-de-escritorio"]');
  await tap('.sub-btn[data-sub-cat="computadores-de-escritorio"][data-sub="torre-cpu"]');
  const torres = await visibles();
  ok(torres.length === 1 && torres.includes("cpu-core-i5-7ma"), "Subcategoría Torre (CPU)");
  await tap('.cat-btn[data-cat="todo"]');

  await page.type("[data-buscar-input]", "nitro");
  await new Promise((r) => setTimeout(r, 400));
  ok((await visibles()).includes("acer-nitro-an515-58-55ty"), "Búsqueda 'nitro'");
  await page.$eval("[data-buscar-input]", (i) => { i.value = ""; i.dispatchEvent(new Event("input")); });
  await new Promise((r) => setTimeout(r, 400));

  await tap('[data-estado="Nuevo"]');
  const nuevos = await visibles();
  ok(nuevos.length > 0 && !nuevos.includes("portatil-core-i5-12va-reacondicionado") && nuevos.includes("asus-expertbook-b1403cva-s65014x"), "Filtro Nuevo");
  await tap('[data-estado="todos"]');

  // ficha con grupos de opciones (RAM y Disco) como iA Computers
  await tap('.producto[data-id="cpu-core-i5-7ma"] [data-elegir]');
  ok((await page.$$("[data-ficha-opciones] .ficha-opciones")).length === 2, "Ficha con opciones de RAM y Disco");
  ok((await page.$$(".ficha-mini")).length === 3, "Galería con 3 fotos (Lenovo, Dell, HP)");
  await tap(".ficha-mini:nth-child(2)");
  ok((await page.$eval("[data-ficha-media] > img", (i) => i.src)).includes("cpu-sff-dell"), "Clic en una miniatura cambia la foto principal");
  const filas = await page.$$eval("[data-ficha-specs] div", (d) => d.map((x) => x.querySelector("dt").textContent));
  ok(filas.includes("Procesador") && filas.includes("Garantía") && filas.includes("Incluye"), "Ficha con características, garantía e incluye");
  await tap('[data-f-opcion="16 GB"]');
  await tap('[data-f-opcion="512 GB SSD"]');
  await tap("[data-f-mas]");
  await tap("[data-f-agregar]");
  await tap('.producto[data-id="monitor-24-nuevo"] [data-add]');
  ok((await page.$eval("[data-pedido-total]", (e) => e.textContent)) === "3 productos", "Pedido con 3 productos");

  // alquiler: solo PCs, planes de soporte sin precio
  await tap('[data-modo="alquiler"]');
  const alq = await visibles();
  ok(alq.length > 0 && !alq.some((id) => /^(monitor|mouse|combo-teclado|diadema|parlante|cargador|maletin|cables|camara|docking|base)/.test(id)), "Alquiler: solo computadores");
  ok(!(await page.$eval("[data-planes]", (e) => e.hidden)) && (await page.$eval("[data-planes]", (e) => e.innerText)).includes("Cuota a cotizar"), "Planes de soporte visibles y sin precio");
  await tap('.producto-plan[data-id="plan-estandar"] [data-elegir-plan]');
  await tap('.producto[data-id="portatil-core-i5-12va-reacondicionado"] [data-elegir]');
  await tap("[data-f-agregar]");

  const msg = waText(await page.$eval(".pedido-bar [data-enviar-pedido]", (a) => a.href));
  ok(msg.includes("Comprar:\n• 2 × CPU Intel Core i5 7.ª generación HP, Dell o Lenovo (Reacondicionado · 16 GB · 512 GB SSD)"), "Mensaje con las opciones elegidas en la ficha");
  ok(msg.includes("• 1 × Monitor nuevo 24″ HDMI (Nuevo)"), "Mensaje con producto sin opciones");
  ok(msg.includes("Alquilar en Cali a 24 meses:\nPlan de soporte: Estándar\n• 1 × Portátil Intel Core i5 12.ª generación HP, Dell o Lenovo (Reacondicionado · 8 GB · 256 GB SSD)"), "Mensaje de alquiler con plan y equipo");
  ok(msg.split("Hola Cauce").length === 2 && !/\$\d/.test(msg), "Un solo mensaje, sin precios");
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForFunction(() => document.querySelector("[data-cargando]").hidden);
  ok((await page.$eval("[data-pedido-total]", (e) => e.textContent)) === "4 productos + plan de soporte", "El pedido se conserva al recargar");
  await page.evaluate(() => localStorage.clear());

  // actualizar el CSV: producto nuevo, producto desactivado, archivo de Excel con comas y ANSI
  try {
    let txt = csvOriginal.toString("utf8").replace(/^\uFEFF/, "");
    txt = txt.replace(/\nmonitor-22-reacondicionado;si;/, "\nmonitor-22-reacondicionado;no;");
    txt += "teclado-mecanico;si;999;Monitores;24″ o más;Teclado mecánico;Redragon;Nuevo;no;no;Para escribir todo el día.;Mecánico | USB;Switches: Rojos;;Garantía de fábrica;Teclado;\r\n";
    fs.writeFileSync(CSV, "\uFEFF" + txt, "utf8");
    await cargar();
    const ids = await page.$$eval(".producto", (els) => els.map((e) => e.dataset.id));
    ok(ids.includes("teclado-mecanico") && !ids.includes("monitor-22-reacondicionado") && ids.length === 25, "Editar el CSV agrega productos y oculta los inactivos");

    // fotos: nombre de archivo en la columna "imagen" (se busca en /tienda/img/) y respaldo si no existe
    const IMG = path.join(__dirname, "..", "public_html", "tienda", "img", "prueba-foto.png");
    fs.copyFileSync(path.join(__dirname, "..", "public_html", "assets", "img", "icon-512.png"), IMG);
    try {
      const conFoto = txt.split(/\r?\n/).map((l) => l.startsWith("teclado-mecanico;") ? l.replace(/;$/, ";prueba-foto.png") : l.startsWith("monitor-24-nuevo;") ? l.replace(/;[^;]*$/, ";no-existe.jpg") : l).join("\r\n");
      fs.writeFileSync(CSV, "\uFEFF" + conFoto, "utf8");
      await cargar("/tienda/#monitores");
      await page.$eval('.producto[data-id="teclado-mecanico"]', (c) => c.scrollIntoView({ block: "center", behavior: "instant" }));
      await page.waitForFunction(() => { const i = document.querySelector('.producto[data-id="teclado-mecanico"] img'); return !i || i.complete; }, { timeout: 5000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 300));
      const foto = await page.$eval('.producto[data-id="teclado-mecanico"] .estado-viz', (v) => { const i = v.querySelector("img"); return i ? i.getAttribute("src") + "|" + i.naturalWidth : "sin img"; });
      if (foto !== "/tienda/img/prueba-foto.png|512") console.log("   foto:", foto);
      ok(foto === "/tienda/img/prueba-foto.png|512", "Foto por nombre de archivo en /tienda/img/");
      ok(await page.$eval('.producto[data-id="monitor-24-nuevo"] .estado-viz', (v) => !v.querySelector("img") && !!v.querySelector("svg")), "Foto inexistente: vuelve al dibujo");
    } finally {
      fs.unlinkSync(IMG);
    }

    const filasCsv = txt.trim().split(/\r?\n/).map((l) => l.split(";").map((c) => (/[,"]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c)).join(","));
    const latin1 = Buffer.from(filasCsv.join("\r\n"), "latin1");
    fs.writeFileSync(CSV, latin1);
    await cargar();
    const nombre = await page.$eval('.producto[data-id="portatil-core-i5-12va-reacondicionado"] h3', (e) => e.textContent);
    ok((await page.$$(".producto")).length === 25 && nombre === "Portátil Intel Core i5 12.ª generación HP, Dell o Lenovo", "Lee CSV separado por comas y guardado en ANSI (tildes correctas)");
  } finally {
    fs.writeFileSync(CSV, csvOriginal);
  }
  await cargar();
  ok((await page.$$(".producto")).length === 25, "CSV original restaurado");

  // 6) Enlaces directos y páginas anteriores
  console.log("Enlaces:");
  await cargar("/tienda/#monitores");
  ok((await visibles()).length === 2, "/tienda/#monitores filtra monitores");
  await cargar("/tienda/#alquilar");
  ok(await page.$eval('[data-modo="alquiler"]', (b) => b.getAttribute("aria-pressed")) === "true", "/tienda/#alquilar abre en modo Alquilar");
  const home = await (await fetch(BASE + "/")).text();
  ok(home.includes('href="/tienda/" class="btn btn-primary">Ir a la tienda') && !home.includes("Ver licencias"), "Tarjeta de la principal solo con 'Ir a la tienda'");
  const cap = await (await fetch(BASE + "/capacitaciones/")).text();
  ok(!cap.includes("Siguiente paso") && !cap.includes("<footer"), "Capacitaciones sin 'Siguiente paso' ni footer");

  // 7) Menú de subpáginas
  console.log("Menú:");
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(BASE + "/consultoria-ti/", { waitUntil: "networkidle2" });
  await page.click(".nav-toggle");
  ok(await page.$eval("#nav-links", (e) => getComputedStyle(e).display !== "none"), "Menú móvil se abre");
  ok(await page.$eval('#nav-links a[aria-current="page"]', (e) => e.textContent) === "Consultoría TI", "Página actual marcada");

  await browser.close();
  console.log(errors.length ? "\nERRORES JS:\n" + [...new Set(errors)].join("\n") : "\nSin errores de JavaScript.");
  console.log(fails.length ? "\nFALLOS:\n" + fails.join("\n") : "Todas las pruebas pasaron.");
})();
