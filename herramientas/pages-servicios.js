// Una página por bloque de consultoría TI (más páginas web y automatización, que viven dentro de desarrollo)
const L = require("./lib");
const { WA_ICON, faqHtml, ldBreadcrumb, ldFaq, ldService, page, wa } = L;
const { PIEZAS } = require("./pages-consultoria");

const BASE = "/consultoria-ti/";
const pieza = (id) => PIEZAS.find((p) => p.id === id);

// Público objetivo común; cada página elige y ajusta
const P = {
  online: "<strong>Tiendas en línea</strong> que venden por web, redes o WhatsApp y necesitan que pedidos, pagos e inventario cuadren.",
  fisica: "<strong>Tiendas físicas y negocios de barrio</strong>: ferreterías, droguerías, restaurantes, panaderías, misceláneas.",
  emprende: "<strong>Emprendedores</strong> que están arrancando y quieren hacerlo bien desde el principio, sin pagar de más.",
  pyme: "<strong>Pymes de 15 a 100 empleados</strong> que ya facturan en serio y necesitan orden técnico sin contratar un área de TI.",
  servicios: "<strong>Consultorios, talleres, distribuidoras y agencias</strong> con información de clientes que hoy vive en papeles, chats y hojas de cálculo.",
};

const SERVICIOS = [
  {
    slug: "consultoria-tecnologica", piezaId: "consultoria", corto: "Consultoría",
    title: "Consultoría tecnológica y diagnóstico TI en Cali | Cauce",
    description: "Diagnóstico de tu negocio, datos y procesos antes de invertir en tecnología. Hoja de ruta por retorno de inversión para pymes y emprendedores.",
    h1: "Consultoría tecnológica:<br><span class=\"accent\">primero entender, después invertir.</span>",
    sub: "Antes de comprar un software, una página o una automatización, revisamos cómo funciona tu negocio por dentro. Te decimos qué tecnología sí vale la pena, en qué orden y qué no necesitas.",
    serviceType: "Consultoría tecnológica y diagnóstico de procesos",
    waMsg: "Hola Cauce, quiero un diagnóstico tecnológico para mi negocio.",
    queH2: "Cuatro frentes que<br><em>revisamos contigo.</em>",
    queLead: "Es nuestro método de cuatro pasos aplicado a tu negocio. Es la base de todo lo demás: decide qué piezas necesitas y cuáles no.",
    que: [
      ["Diagnóstico", "Conversamos con el dueño y el equipo y revisamos lo que ya tienes: herramientas, software contratado, hojas de cálculo y la forma real de trabajar.", ["Puntos débiles, fugas de tiempo y de plata", "Software que se paga y no se usa", "Riesgos de seguridad evidentes"]],
      ["Datos", "Encontramos qué información genera tu negocio, dónde se pierde y qué conviene medir para decidir con números y no a la intuición.", ["Mapa de quién genera, usa y decide con cada dato", "Información repartida entre WhatsApp, papeles y archivos", "Integración con Siigo, Alegra u hojas de cálculo"]],
      ["Procesos", "Levantamos los procesos clave tal como funcionan hoy y los rediseñamos quitando pasos que sobran, antes de automatizar nada.", ["Diagramas BPMN de cómo funciona hoy y cómo debería", "Cuellos de botella que se repiten cada mes", "Qué automatizar y qué no"]],
      ["Ingeniería", "Con lo anterior armamos la hoja de ruta: qué construir, comprar o integrar, ordenado por retorno de inversión.", ["Piezas recomendadas y en qué orden", "Lo que puedes hacer tú solo y lo que necesita ayuda", "Alcance y precio cerrados para cada paso"]],
      ["Transformación digital realista", "Sin paquetes mágicos. Si una hoja de cálculo bien hecha resuelve, te lo decimos. Si necesitas software a la medida, también.", ["Decisiones técnicas con criterio", "Sin venderte cosas que no necesitas"]],
      ["Acompañamiento", "La implementación la hace el mismo equipo que hizo el diagnóstico, codo a codo con tu gente.", ["Nadie te pasa a otro después de la venta", "Sin “fase 2” sorpresa"]],
    ],
    pasos: [
      ["Café Cauce", "Una hora con un ingeniero para entender tu caso. Te llevas al menos dos recomendaciones aplicables ese mismo día."],
      ["Levantamiento", "Entrevistas con el dueño y el equipo, revisión de herramientas y de cómo fluye la información."],
      ["Análisis", "Mapa de datos, diagramas de procesos y lista priorizada de problemas y oportunidades."],
      ["Hoja de ruta", "Te presentamos el plan por retorno de inversión. Tú decides qué hacer, con nosotros o por tu cuenta."],
    ],
    recibes: ["Informe de diagnóstico con puntos débiles y oportunidades", "Diagrama de actores y flujos de información", "Diagramas BPMN de los procesos clave", "Hoja de ruta priorizada por retorno de inversión", "Propuesta con alcance y precio cerrados por pieza"],
    para: [P.fisica, P.online, P.emprende, P.pyme],
    ideal: pieza("consultoria").ideal,
    faqs: [
      ["¿Cuánto dura un diagnóstico?", "Depende del tamaño del negocio y de cuántos procesos revisemos. En la propuesta te damos el tiempo y el precio cerrados antes de empezar."],
      ["¿Tengo que contratar la implementación con ustedes?", "No. La hoja de ruta es tuya: puedes ejecutarla con tu equipo, con otro proveedor o con nosotros."],
      ["¿Sirve para un negocio pequeño?", "Sí. Trabajamos con tiendas, negocios de barrio y emprendedores, no solo con empresas grandes. El diagnóstico se ajusta al tamaño de tu operación."],
    ],
  },
  {
    slug: "arquitectura-de-software-y-redes", piezaId: "arquitectura", corto: "Arquitectura",
    title: "Arquitectura de software, redes y servidores | Cauce",
    description: "Diseñamos tu software, tu red y tus servidores antes de construir o comprar: componentes, datos, integraciones, topología y nube. Colombia y Latinoamérica.",
    h1: "Arquitectura de software y redes:<br><span class=\"accent\">los planos antes de construir.</span>",
    sub: pieza("arquitectura").desc + " Así lo que se construya, con o sin IA, puede crecer sin rehacerse.",
    serviceType: "Arquitectura de software, redes e infraestructura",
    waMsg: "Hola Cauce, quiero diseñar la arquitectura de mi software o de mi red.",
    queH2: "Tres planos,<br><em>una sola visión.</em>",
    queLead: "Definimos cómo debe ser tu solución antes de gastar en equipos o en horas de programación.",
    que: [
      ["Arquitectura de software", "Definimos los componentes, los datos y las integraciones de tu sistema para que se pueda construir por etapas y crecer.", ["Módulos, base de datos e integraciones", "Qué hacer con IA y qué no", "Decisiones de tecnología justificadas"]],
      ["Diseño de redes", "Topología, segmentación y la decisión entre cableado y wifi para una sede nueva o una red que ya no da abasto.", ["Redes separadas para caja, oficina e invitados", "Ubicación de equipos y puntos de red", "Crecimiento a nuevas sedes"]],
      ["Servidores y nube", "Nube, servidor propio o híbrido: lo correcto para tu negocio, no lo más caro ni lo de moda.", ["AWS, Google Cloud o Azure", "Servidor local con respaldos", "Costos mensuales estimados"]],
      ["Integraciones", "Cómo se conectan tus sistemas: facturación, inventario, tienda en línea, WhatsApp y hojas de cálculo.", ["Siigo, Alegra, WhatsApp Business", "Qué sistemas tienen API y cuáles no"]],
      ["Seguridad desde el diseño", "Accesos, permisos y respaldos pensados desde el plano, no parchados después.", ["Quién puede ver qué", "Plan de respaldo y recuperación"]],
      ["Documentación", "Planos y documentación para que nosotros o cualquier proveedor construya sobre ellos.", ["Diagramas de arquitectura", "Diagramas de red", "Decisiones y su porqué"]],
    ],
    pasos: [
      ["Requisitos", "Qué tiene que hacer la solución, para cuántos usuarios y con qué sistemas debe hablar."],
      ["Alternativas", "Comparamos opciones con costos y riesgos, en español claro."],
      ["Diseño", "Diagramas de arquitectura, de red y de infraestructura."],
      ["Entrega", "Documentación lista para construir, con nosotros o con otro proveedor."],
    ],
    recibes: ["Diagramas de arquitectura de software", "Diagramas de red e infraestructura", "Recomendación de nube, servidor o híbrido con costos", "Lista de integraciones y cómo se resuelven", "Documento de decisiones técnicas"],
    para: [P.emprende, P.online, P.pyme, "<strong>Negocios que abren sede</strong> o cuya red y sistemas ya no dan más."],
    ideal: pieza("arquitectura").ideal,
    faqs: [
      ["¿Por qué pagar por arquitectura si puedo empezar a programar?", "Porque corregir el diseño después cuesta mucho más. Con un buen plano, el desarrollo es más rápido, más barato y puede crecer sin rehacerse."],
      ["¿La arquitectura me obliga a desarrollar con ustedes?", "No. Los planos quedan a tu nombre y cualquier proveedor puede construir sobre ellos."],
      ["¿También diseñan la red de una tienda o una oficina pequeña?", "Sí. Una tienda con caja, datáfono, cámaras y wifi para clientes también necesita una red bien separada y segura."],
    ],
  },
  {
    slug: "desarrollo-de-software", piezaId: "desarrollo", corto: "Fábrica de software", nombre: "Fábrica de software y desarrollo a la medida",
    title: "Fábrica de software y desarrollo a la medida en Cali | Cauce",
    description: "Desarrollo de software a la medida: aplicaciones web, apps móviles, sistemas internos e integraciones con Siigo, Alegra y WhatsApp. Colombia y Latinoamérica.",
    h1: "Fábrica de software:<br><span class=\"accent\">desarrollo a la medida de tu negocio.</span>",
    sub: pieza("desarrollo").desc,
    serviceType: "Desarrollo de software a la medida",
    waMsg: "Hola Cauce, quiero desarrollar un software a la medida.",
    queH2: "Lo que<br><em>construimos.</em>",
    queLead: "Software que se adapta a cómo trabaja tu negocio, y no al revés.",
    que: [
      ["Aplicaciones web", "Sistemas que se usan desde el navegador: pedidos, inventario, citas, cotizaciones, portales para clientes.", ["Acceso desde cualquier equipo", "Usuarios y permisos por rol", "Reportes para decidir"]],
      ["Apps móviles", "Aplicaciones para celular para tu equipo en la calle o para tus clientes.", ["Vendedores y domiciliarios", "Pedidos y seguimiento", "Funciona con lo que ya usas"]],
      ["Sistemas internos", "Reemplazamos las hojas de cálculo sueltas por un sistema ordenado para tu operación.", ["Inventario y bodegas", "Producción y despachos", "Clientes y cartera"]],
      ["Integraciones", "Conectamos tus sistemas para que la información no se digite dos veces.", ["Siigo y Alegra", "WhatsApp Business", "Tiendas en línea y hojas de cálculo"]],
      ["Desarrollo asistido por IA", "Usamos inteligencia artificial para construir más rápido y más estandarizado, con ingenieros revisando cada entrega.", ["Menos tiempo y menor costo", "Calidad revisada por personas"]],
      ["Código a tu nombre", "Entregas por etapas, con código y documentación a nombre de tu empresa.", ["Avances reales desde el principio", "Sin quedar amarrado a nosotros"]],
    ],
    pasos: [
      ["Alcance", "Definimos qué se construye primero, con base en la arquitectura o en un diagnóstico corto."],
      ["Etapas", "Dividimos el desarrollo en entregas pequeñas que puedes probar."],
      ["Construcción y pruebas", "Desarrollamos, probamos y ajustamos con tu equipo en cada etapa."],
      ["Puesta en marcha", "Instalación, capacitación a los usuarios y acompañamiento al arrancar."],
    ],
    recibes: ["Software funcionando por etapas", "Código fuente y documentación a nombre de tu empresa", "Integraciones con tus sistemas actuales", "Capacitación a los usuarios", "Opción de soporte y mejoras después de la entrega"],
    para: [P.online, P.servicios, P.pyme, P.emprende],
    ideal: pieza("desarrollo").ideal,
    faqs: [
      ["¿Hacen apps hechas con IA?", "Sí, usamos IA para desarrollar más rápido, pero cada entrega pasa por ingenieros y por pruebas. Si ya tienes una app hecha con IA que no has podido poner en producción, también te ayudamos a revisarla y desplegarla."],
      ["¿El código queda a mi nombre?", "Sí. El código y la documentación son de tu empresa."],
      ["¿Cuánto cuesta un software a la medida?", "Depende del alcance. Te enviamos una propuesta con alcance y precio cerrados por etapa después de entender lo que necesitas."],
    ],
    relacionadas: ["paginas-web-y-tiendas-en-linea", "automatizacion-rpa-e-ia"],
  },
  {
    slug: "paginas-web-y-tiendas-en-linea", piezaId: "desarrollo", corto: "Páginas web", nombre: "Páginas web y tiendas en línea",
    title: "Páginas web y tiendas en línea para negocios | Cauce",
    description: "Diseño y desarrollo de páginas web corporativas y tiendas en línea, con dominio, hosting y administración como webmaster. Para negocios y emprendedores.",
    h1: "Páginas web y tiendas en línea:<br><span class=\"accent\">conectadas a tu negocio.</span>",
    sub: "Tu página o tu tienda en línea no debería ser una vitrina aislada. La construimos como ingeniería: rápida, segura, fácil de encontrar en Google y conectada a tus pedidos, tu inventario y tu WhatsApp.",
    serviceType: "Diseño y desarrollo de páginas web y tiendas en línea",
    waMsg: "Hola Cauce, quiero una página web o una tienda en línea para mi negocio.",
    queH2: "De la primera página<br><em>al día a día.</em>",
    queLead: "Construimos tu presencia web y nos quedamos administrándola si lo necesitas.",
    que: [
      ["Páginas web corporativas", "Un sitio claro que explica qué haces y lleva a tus clientes a escribirte o comprarte.", ["Diseño adaptado a celular", "Botones a WhatsApp y formularios", "Textos pensados para tu cliente"]],
      ["Tiendas en línea", "Catálogo, carrito y pedidos para vender por internet, con la forma de pago que elijas.", ["Catálogo fácil de actualizar", "Pedidos por WhatsApp o pago en línea", "Inventario conectado"]],
      ["Webmaster", "Administramos tu sitio para que no tengas que pensar en él.", ["Actualizaciones y cambios de contenido", "Copias de seguridad", "Revisión de que todo funcione"]],
      ["Dominio, hosting y seguridad", "Tu dirección .com o .co, el alojamiento y el certificado de seguridad, administrados por nosotros.", ["Renovación del dominio", "Certificado de seguridad (HTTPS)", "Renovaciones a tiempo"]],
      ["Bases para Google", "Estructura técnica para que Google entienda y encuentre tu sitio.", ["Velocidad y versión para celular", "Títulos, descripciones y datos estructurados", "Perfil de empresa en Google"]],
      ["Medición", "Sabes cuántas personas llegan, de dónde vienen y cuántas te escriben.", ["Google Analytics", "Clics a WhatsApp y formularios"]],
    ],
    pasos: [
      ["Entender el negocio", "Qué vendes, a quién y cómo te contactan hoy. Sin esto no hay página que funcione."],
      ["Estructura y contenido", "Secciones, textos y fotos de tus productos o servicios."],
      ["Construcción", "Diseño, desarrollo, conexión a WhatsApp, pagos o inventario según el caso."],
      ["Publicación y cuidado", "Dominio, hosting, Google y administración mensual si la quieres."],
    ],
    recibes: ["Página web o tienda en línea publicada con tu dominio", "Certificado de seguridad y versión para celular", "Conexión con WhatsApp y, si aplica, pagos e inventario", "Configuración básica para Google y medición de visitas", "Administración como webmaster (opcional)"],
    para: [P.online, P.fisica, P.emprende, P.servicios],
    ideal: "Tu negocio no aparece en internet, tu página está desactualizada o vendes por redes y los pedidos se te pierden.",
    nota: "No hacemos publicidad ni manejo de redes sociales. Si lo necesitas, te recomendamos agencias del Valle que se especializan en eso; nosotros cuidamos la parte técnica.",
    faqs: [
      ["¿Hacen tiendas en línea?", "Sí. Catálogo, carrito y pedidos, con pago en línea o pedido por WhatsApp, y conectadas a tu inventario cuando hace falta."],
      ["¿Qué es el servicio de webmaster?", "Es la administración de tu sitio: cambios de contenido, actualizaciones, copias de seguridad, dominio, hosting y certificado de seguridad. Tú te ocupas del negocio."],
      ["¿Manejan redes sociales o publicidad?", "No. Nos enfocamos en la parte técnica: el sitio, la tienda, su seguridad y su conexión con tu operación."],
      ["¿Puedo actualizar yo los productos?", "Sí. Dejamos la tienda lista para que tú o tu equipo actualicen productos, fotos y descripciones sin depender de nosotros."],
    ],
    relacionadas: ["desarrollo-de-software", "automatizacion-rpa-e-ia"],
  },
  {
    slug: "automatizacion-rpa-e-ia", piezaId: "desarrollo", corto: "Automatización e IA", nombre: "Automatización, RPA y agentes de IA",
    title: "Automatización de procesos, RPA y agentes de IA | Cauce",
    description: "Automatizamos tareas repetitivas con RPA, n8n y scripting, y creamos agentes de inteligencia artificial conectados a tus sistemas. Colombia y Latinoamérica.",
    h1: "Automatización, RPA y agentes de IA:<br><span class=\"accent\">que lo repetitivo se haga solo.</span>",
    sub: "Automatizamos solo lo que se debe automatizar. Primero limpiamos el proceso; después ponemos a trabajar robots, flujos y agentes de inteligencia artificial conectados a tus sistemas.",
    serviceType: "Automatización de procesos e inteligencia artificial",
    waMsg: "Hola Cauce, quiero automatizar procesos de mi negocio con RPA o IA.",
    queH2: "Cuatro formas de<br><em>automatizar.</em>",
    queLead: "Elegimos la herramienta según el proceso, no según la moda.",
    que: [
      ["Flujos con n8n", "Conectamos aplicaciones que tienen API para que la información pase sola de una a otra.", ["Pedidos de la tienda a la facturación", "Alertas y reportes automáticos", "Formularios que llegan ordenados"]],
      ["Scripting a la medida", "Programas cortos para tareas específicas que ninguna herramienta resuelve bien.", ["Procesar archivos y reportes", "Cruces de información", "Tareas programadas"]],
      ["RPA", "Robots de software que usan los programas como lo haría una persona, para sistemas que no tienen API.", ["Digitación repetitiva", "Descarga y carga de información", "Portales que no se conectan"]],
      ["Agentes de IA", "Asistentes de inteligencia artificial conectados a tus datos que responden, clasifican y ejecutan tareas.", ["Atención por WhatsApp", "Clasificación de correos y solicitudes", "Consultas sobre tu información"]],
      ["La regla “¿tiene API?”", "Si el sistema tiene API, lo conectamos directamente; si no, usamos RPA. Así la automatización es más estable y más barata.", ["Integraciones primero", "Robots solo cuando hace falta"]],
      ["Monitoreo", "Cada automatización queda vigilada para saber si falló y por qué.", ["Alertas de error", "Registro de lo que se ejecutó"]],
    ],
    pasos: [
      ["Elegir el proceso", "Buscamos las tareas que más tiempo consumen y que menos criterio requieren."],
      ["Limpiar", "Quitamos los pasos que sobran. Automatizar un proceso desordenado solo lo desordena más rápido."],
      ["Automatizar", "Flujos, scripts, robots o agentes de IA, según el caso."],
      ["Medir y cuidar", "Horas ahorradas, errores evitados y monitoreo para que siga funcionando."],
    ],
    recibes: ["Procesos automatizados y documentados", "Agentes de IA conectados a tu información, si aplican", "Monitoreo y alertas de cada automatización", "Capacitación a quien la va a supervisar", "Medición del tiempo ahorrado"],
    para: [P.online, P.servicios, P.pyme, P.fisica],
    ideal: "Tu equipo pasa horas copiando información de un lado a otro, respondiendo lo mismo o armando los mismos reportes.",
    faqs: [
      ["¿Qué diferencia hay entre RPA y una integración?", "Una integración conecta sistemas por su API y es más estable. El RPA imita a una persona usando el programa y se usa cuando el sistema no tiene API."],
      ["¿Un agente de IA puede atender a mis clientes por WhatsApp?", "Sí, conectado a tu catálogo o a tu información, y con la opción de pasar la conversación a una persona cuando hace falta."],
      ["¿Mi negocio es muy pequeño para automatizar?", "No siempre. Si tu negocio todavía pierde información en lo básico, primero lo ordenamos; automatizar viene después. Te lo decimos con honestidad."],
    ],
    relacionadas: ["desarrollo-de-software", "consultoria-tecnologica"],
  },
  {
    slug: "pruebas-de-software", piezaId: "calidad", corto: "Pruebas de calidad",
    title: "Pruebas de software y QA para empresas | Cauce",
    description: "Pruebas de calidad de software (QA): flujos críticos probados antes de cada lanzamiento, con informe priorizado. Para software propio o de terceros.",
    h1: "Pruebas de calidad de software:<br><span class=\"accent\">antes de que lo descubra tu cliente.</span>",
    sub: pieza("calidad").desc,
    serviceType: "Pruebas de calidad de software (QA)",
    waMsg: "Hola Cauce, quiero hacer pruebas de calidad a mi software.",
    queH2: "Qué<br><em>probamos.</em>",
    queLead: "Sirve para software nuestro o hecho por otro proveedor.",
    que: [
      ["Pruebas funcionales", "Revisamos que los flujos críticos hagan lo que deben.", ["Ventas y pagos", "Inventario", "Reportes"]],
      ["Casos raros", "Probamos lo que nadie prueba: datos mal escritos, cantidades extrañas, pasos fuera de orden.", ["Errores que llegan al cliente", "Datos que se dañan"]],
      ["Antes de cada lanzamiento", "Una revisión antes de publicar una versión o una actualización importante.", ["Lo nuevo funciona", "Lo que ya funcionaba no se dañó"]],
      ["Celular y navegadores", "Revisamos que la aplicación funcione bien en los dispositivos que usan tus clientes.", ["Versión para celular", "Navegadores comunes"]],
      ["Informe priorizado", "Cada hallazgo con su gravedad y qué corregir primero.", ["Pasos para reproducir el error", "Prioridad clara"]],
      ["Acompañamiento", "Verificamos que las correcciones sí resolvieron el problema.", ["Segunda ronda de pruebas"]],
    ],
    pasos: [
      ["Entender el software", "Qué hace, quién lo usa y cuáles son los flujos que no pueden fallar."],
      ["Plan de pruebas", "Casos normales y casos raros para cada flujo crítico."],
      ["Ejecución", "Probamos y documentamos cada hallazgo con evidencia."],
      ["Informe y verificación", "Prioridades, y nueva prueba después de las correcciones."],
    ],
    recibes: ["Plan de pruebas de los flujos críticos", "Informe de hallazgos con evidencia y prioridad", "Recomendaciones de corrección", "Verificación de las correcciones"],
    para: [P.online, P.pyme, P.emprende, "<strong>Empresas con software hecho por otro proveedor</strong> que falla y no saben por qué."],
    ideal: pieza("calidad").ideal,
    faqs: [
      ["¿Prueban software que no hicieron ustedes?", "Sí. Probamos software propio, de otro proveedor o hecho con IA."],
      ["¿Necesito acceso al código?", "No para las pruebas funcionales: probamos la aplicación como la usa una persona."],
      ["¿Cada cuánto conviene probar?", "Antes de cada lanzamiento o actualización importante, y cuando el sistema empieza a fallar sin explicación."],
    ],
    relacionadas: ["auditoria-de-seguridad-y-pentest", "desarrollo-de-software"],
  },
  {
    slug: "auditoria-de-seguridad-y-pentest", piezaId: "seguridad", corto: "Seguridad y pentest",
    title: "Auditoría de seguridad OWASP y pentest en Cali | Cauce",
    description: "Auditoría de seguridad de software con OWASP ASVS y pruebas de penetración (pentest) sobre tu software propietario. Informe priorizado por riesgo.",
    h1: "Auditoría de seguridad y pentest:<br><span class=\"accent\">tus puntos débiles, antes que un atacante.</span>",
    sub: pieza("seguridad").desc,
    serviceType: "Auditoría de seguridad informática y pruebas de penetración",
    waMsg: "Hola Cauce, quiero una auditoría de seguridad o un pentest para mi software.",
    queH2: "Cómo revisamos<br><em>tu seguridad.</em>",
    queLead: "Con un estándar reconocido como referencia, no con una lista improvisada.",
    que: [
      ["Auditoría OWASP ASVS", "Verificamos tu aplicación contra OWASP ASVS (Application Security Verification Standard), el estándar para evaluar la seguridad de aplicaciones.", ["Autenticación y sesiones", "Control de acceso", "Validación de datos"]],
      ["Pentest", "Pruebas de penetración controladas sobre tu software propietario, atacándolo como lo haría un atacante real.", ["Con autorización y alcance firmado", "Sin afectar tu operación"]],
      ["Accesos y contraseñas", "Revisamos quién entra, con qué permisos y qué tan fáciles son las claves.", ["Usuarios que sobran", "Permisos de más"]],
      ["Datos expuestos", "Buscamos información de clientes, pagos o del negocio que esté al alcance de quien no debe.", ["Datos personales", "Información de pagos"]],
      ["Informe por riesgo", "Cada vulnerabilidad con su nivel de riesgo y cómo corregirla.", ["Prioridades claras", "Explicado en español claro"]],
      ["Verificación", "Comprobamos que las correcciones cerraron las vulnerabilidades.", ["Nueva revisión después de corregir"]],
    ],
    pasos: [
      ["Alcance y autorización", "Qué se revisa, cómo y cuándo, por escrito y firmado."],
      ["Revisión", "Auditoría contra OWASP ASVS y pruebas de penetración controladas."],
      ["Informe", "Vulnerabilidades priorizadas por riesgo, con cómo corregir cada una."],
      ["Verificación", "Revisamos de nuevo después de las correcciones."],
    ],
    recibes: ["Informe de auditoría contra OWASP ASVS", "Resultados del pentest con evidencia", "Vulnerabilidades priorizadas por riesgo", "Recomendaciones de corrección", "Verificación de las correcciones"],
    para: [P.online, P.pyme, P.servicios, "<strong>Empresas que manejan datos de clientes o pagos</strong> o van a lanzar una versión importante."],
    ideal: pieza("seguridad").ideal,
    faqs: [
      ["¿Qué es OWASP ASVS?", "Es un estándar abierto que define qué debe cumplir una aplicación para considerarse segura. Lo usamos como lista de verificación para que la auditoría sea completa y comparable."],
      ["¿El pentest puede dañar mi sistema?", "Se hace con alcance y autorización por escrito, en horarios acordados y con cuidado de no afectar la operación. Si es posible, se hace sobre un ambiente de pruebas."],
      ["¿También capacitan a mi equipo en seguridad?", "Sí, en la Escuela Cauce tenemos el programa de Ciberseguridad para que nadie de tu equipo caiga en engaños."],
    ],
    relacionadas: ["pruebas-de-software", "infraestructura-y-redes"],
    extraLinks: [["/capacitaciones/", "Capacitación en ciberseguridad"]],
  },
  {
    slug: "infraestructura-y-redes", piezaId: "infraestructura", corto: "Infraestructura",
    title: "Redes corporativas, servidores y nube en Cali | Cauce",
    description: "Instalación y monitoreo de redes corporativas, VPN, servidores con respaldos y virtualización, y nube en AWS, Google Cloud o Azure con Terraform.",
    h1: "Infraestructura y redes corporativas:<br><span class=\"accent\">funcionando y vigiladas.</span>",
    sub: pieza("infraestructura").desc,
    serviceType: "Redes corporativas, servidores, nube y monitoreo",
    waMsg: "Hola Cauce, necesito ayuda con la red, los servidores o la nube de mi empresa.",
    queH2: "Lo que<br><em>instalamos y cuidamos.</em>",
    queLead: "De la red de la tienda a los servidores en la nube.",
    que: [
      ["Redes corporativas", "Instalación y ordenamiento de la red de tu oficina, tienda o bodega.", ["Redes separadas para caja, oficina e invitados", "Wifi estable", "Ordenamiento de cableado y equipos"]],
      ["VPN", "Conexión segura para trabajar desde fuera de la oficina o unir sedes.", ["Teletrabajo seguro", "Sedes conectadas"]],
      ["Servidores", "Instalación con RAID, respaldos y virtualización; migración sin perder información.", ["Servidor de archivos", "Respaldos verificados", "Migraciones"]],
      ["Nube", "Despliegue y operación en AWS, Google Cloud o Azure con Terraform.", ["Infraestructura como código", "Costos controlados"]],
      ["Monitoreo", "Alertas antes de que algo falle, para no enterarte por tus clientes.", ["Equipos y servicios vigilados", "Alertas tempranas"]],
      ["Parches y respaldos", "Actualizaciones de seguridad y respaldos que de verdad se prueban.", ["Restauraciones probadas", "Registro de cada cambio"]],
    ],
    pasos: [
      ["Inventario", "Qué equipos, redes y servicios tienes y en qué estado están."],
      ["Plan", "Qué instalar, migrar o corregir primero, según el riesgo."],
      ["Implementación", "Instalación y migración en horarios que no afecten tu operación."],
      ["Monitoreo", "Vigilancia, parches y respaldos de forma continua."],
    ],
    recibes: ["Red instalada y documentada", "Servidores o nube configurados con respaldos", "Monitoreo con alertas", "Diagrama de red e infraestructura", "Plan de respaldo y recuperación"],
    para: [P.fisica, P.pyme, P.servicios, "<strong>Negocios con varias sedes</strong> o personas que trabajan desde fuera de la oficina."],
    ideal: pieza("infraestructura").ideal,
    faqs: [
      ["¿Atienden en sitio?", "Sí, en Cali vamos a tu oficina, tienda o bodega. La nube y el monitoreo los manejamos de forma remota para empresas de Colombia, Latinoamérica y cualquier país."],
      ["¿Pueden migrar mi información a la nube sin perderla?", "Sí. Planeamos la migración, hacemos respaldos antes de empezar y verificamos que todo quede completo."],
      ["¿Qué pasa si mi red ya está instalada pero falla?", "La revisamos, la documentamos y corregimos lo necesario. No siempre hay que cambiar todo."],
    ],
    relacionadas: ["soporte-ti", "arquitectura-de-software-y-redes"],
  },
  {
    slug: "soporte-ti", piezaId: "soporte", corto: "Soporte TI",
    title: "Soporte TI en sitio para empresas en Cali | Cauce",
    description: "Tu área de TI sin contratarla: mesa de ayuda remota, soporte técnico en sitio en Cali, mantenimiento preventivo y tiempos de respuesta claros.",
    h1: "Soporte TI para empresas:<br><span class=\"accent\">tu área de TI sin contratarla.</span>",
    sub: pieza("soporte").desc,
    serviceType: "Soporte técnico y mesa de ayuda",
    waMsg: "Hola Cauce, quiero soporte TI para mi empresa.",
    queH2: "Cómo cuidamos<br><em>a tu equipo.</em>",
    queLead: "Alguien atiende cuando algo falla y cuida los equipos antes de que fallen.",
    que: [
      ["Mesa de ayuda remota", "Atendemos a tu equipo por WhatsApp, teléfono o correo y resolvemos con acceso remoto seguro.", ["Registro de cada caso", "Acceso seguro"]],
      ["Soporte en sitio en Cali", "Vamos a tu oficina, tienda o bodega cuando el problema no se resuelve a distancia.", ["Equipos, impresoras y red", "Instalaciones y cambios"]],
      ["Mantenimiento preventivo", "Revisiones programadas para que los equipos no fallen en el peor momento.", ["Limpieza y revisión", "Actualizaciones"]],
      ["Monitoreo de equipos", "Muchas veces nos enteramos de la falla antes que tú.", ["Alertas de disco, memoria y seguridad"]],
      ["Tiempos claros", "Niveles con tiempo de respuesta definido: 24–48 h, 8–24 h o menos de 4 h.", ["Tú eliges el nivel"]],
      ["Equipos", "Si necesitas computadores, los vendemos o alquilamos en Cali con soporte incluido.", ["Portátiles y escritorio", "Nuevos o reacondicionados"]],
    ],
    pasos: [
      ["Inventario", "Registramos tus equipos, usuarios y programas."],
      ["Puesta a punto", "Corregimos lo urgente y dejamos todo documentado."],
      ["Atención", "Mesa de ayuda y visitas según el nivel que elijas."],
      ["Mejora continua", "Informe de casos y recomendaciones para que fallen menos."],
    ],
    recibes: ["Mesa de ayuda con registro de casos", "Soporte en sitio en Cali", "Mantenimiento preventivo programado", "Inventario de equipos actualizado", "Informe periódico de casos y recomendaciones"],
    para: [P.fisica, P.servicios, P.pyme, P.online],
    ideal: "No tienes a nadie de TI en tu equipo y cada falla te detiene la operación.",
    faqs: [
      ["¿Atienden fuera de Cali?", "La mesa de ayuda remota sí, para Colombia, Latinoamérica y cualquier país. Las visitas en sitio son en Cali."],
      ["¿Qué tiempos de respuesta manejan?", "Según el nivel: de 24 a 48 horas, de 8 a 24 horas o menos de 4 horas. El tiempo de respuesta es cuándo empezamos a atender; la solución depende del caso."],
      ["¿Puedo alquilar los computadores con el soporte incluido?", "Sí. En la tienda alquilamos computadores en Cali con planes de soporte."],
    ],
    relacionadas: ["infraestructura-y-redes", "consultoria-tecnologica"],
    extraLinks: [["/tienda/#alquilar", "Alquiler de computadores en Cali"]],
  },
];

const brick = (p, label) => `<span class="brick" style="--c:${p.color}; --t:${p.texto};"><span class="brick-label">${label || p.corto || p.nombre}</span></span>`;

function servicio(s) {
  const p = pieza(s.piezaId);
  const nombre = s.nombre || p.nombre;
  const path = BASE + s.slug + "/";
  const crumbs = [["Inicio", "/"], ["Consultoría TI", BASE], [nombre, path]];
  const base = pieza("consultoria");
  const torre = s.piezaId === "consultoria" ? [p] : [p, base];
  const otras = SERVICIOS.filter((o) => o.slug !== s.slug);
  const primero = (s.relacionadas || []).map((slug) => otras.find((o) => o.slug === slug));
  const links = [...primero, ...otras.filter((o) => !primero.includes(o))];

  const body = `<header class="hero is-sub">
  <div class="hero-grid-bg"></div>
  <div class="wrap">
    <div class="sub-hero-grid">
      <div>
        <div class="hero-eyebrow"><span class="pulse"></span><span class="mono">Consultoría TI · ${s.corto}</span></div>
        <h1>${s.h1}</h1>
        <p class="hero-sub">${s.sub}</p>
        <div class="hero-ctas">
          <a href="${wa(s.waMsg)}" class="btn btn-primary" target="_blank" rel="noopener" data-ubicacion="servicio-${s.slug}-hero">${WA_ICON} Escríbenos por WhatsApp</a>
          <a href="${BASE}#armador" class="btn btn-secondary">Arma tu solución completa <span class="arrow">→</span></a>
        </div>
      </div>
      <div class="tower tower-hero tower-servicio" aria-hidden="true">
        ${torre.map((b, i) => brick(b, i === 0 ? s.corto : null)).join("\n        ")}
        <span class="baseplate"></span>
      </div>
    </div>
  </div>
</header>

<section class="section is-paper" id="que-hacemos">
  <div class="wrap">
    <div class="section-head">
      <div>
        <p class="mono eyebrow">— Qué hacemos</p>
        <h2>${s.queH2}</h2>
      </div>
      <p class="lead">${s.queLead}</p>
    </div>
    <div class="svc-grid cols-3">
${s.que.map(([h, txt, lis], i) => `      <article class="svc-card">
        <span class="num-mono">${String(i + 1).padStart(2, "0")}</span>
        <h3>${h}</h3>
        <p>${txt}</p>
        <ul>${lis.map((li) => `<li>${li}</li>`).join("")}</ul>
      </article>`).join("\n")}
    </div>
  </div>
</section>

<section class="section is-warm" id="como">
  <div class="wrap">
    <div class="section-head">
      <div>
        <p class="mono eyebrow">— Cómo lo hacemos</p>
        <h2>Cuatro pasos.<br><em>Sin atajos.</em></h2>
      </div>
      <p class="lead">El mismo equipo te acompaña de principio a fin, con alcance y precio cerrados.</p>
    </div>
    <div class="metodo-steps is-light">
${s.pasos.map(([h, txt], i) => `      <div class="metodo-step">
        <span class="num">${String(i + 1).padStart(2, "0")}</span>
        <h4>${h}</h4>
        <p>${txt}</p>
      </div>`).join("\n")}
    </div>
  </div>
</section>

<section class="section is-paper" id="para-quien">
  <div class="wrap">
    <div class="split">
      <div class="split-col is-yes">
        <h3>Qué recibes</h3>
        <ul>${s.recibes.map((r) => `<li><span>${r}</span></li>`).join("")}</ul>
      </div>
      <div class="split-col is-extra">
        <h3>Para quién es</h3>
        <ul>${s.para.map((r) => `<li><span>${r}</span></li>`).join("")}</ul>
      </div>
    </div>
    <p class="callout mt-2"><span class="mono">Ideal si</span>${s.ideal}${s.nota ? `<br><br>${s.nota}` : ""}</p>
  </div>
</section>

${faqHtml(s.faqs, { bg: "is-warm" })}

<section class="section is-paper servicio-otras">
  <div class="wrap">
    <p class="mono eyebrow">— Otras piezas de consultoría TI</p>
    <div class="related">
      <a href="${BASE}">Todas las piezas</a>
${links.map((o) => `      <a href="${BASE}${o.slug}/">${o.nombre || pieza(o.piezaId).nombre}</a>`).join("\n")}
${(s.extraLinks || []).map(([href, label]) => `      <a href="${href}">${label}</a>`).join("\n")}
    </div>
  </div>
</section>
`;

  return {
    path,
    html: page({
      path,
      title: s.title,
      description: s.description,
      waMsg: s.waMsg,
      bodyClass: "servicio-page",
      jsonld: [
        ldService({ name: nombre, description: s.description, path, serviceType: s.serviceType, areaServed: s.piezaId === "soporte" ? [{ "@type": "City", name: "Cali" }, { "@type": "Country", name: "Colombia" }, { "@type": "Place", name: "América Latina" }] : undefined }),
        ldBreadcrumb(crumbs),
        ldFaq(s.faqs),
      ],
      body,
    }),
  };
}

const servicios = () => SERVICIOS.map(servicio);
const enlacesPorPieza = (id) => SERVICIOS.filter((s) => s.piezaId === id).map((s) => [BASE + s.slug + "/", s.nombre || pieza(s.piezaId).nombre]);

module.exports = { servicios, SERVICIOS, enlacesPorPieza };
