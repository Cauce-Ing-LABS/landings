# landings

Sitio web de **Cauce Ingeniería** · [cauce-ingenieria.com](https://cauce-ingenieria.com) · español, inglés y portugués.

| Ambiente | Dirección | Se publica desde |
|---|---|---|
| Producción | [cauce-ingenieria.com](https://cauce-ingenieria.com) | rama `main` |
| Pruebas | [test-paginas.cauce-ingenieria.com/landings/](https://test-paginas.cauce-ingenieria.com/landings/) | rama `test` |

---

## Contenido

1. [Estructura del repositorio](#estructura-del-repositorio)
2. [Trabajar en el sitio](#trabajar-en-el-sitio)
3. [Flujo de ramas](#flujo-de-ramas)
4. [Paso a paso de un cambio](#paso-a-paso-de-un-cambio)
5. [Hotfix: emergencias en producción](#hotfix-emergencias-en-producción)
6. [Qué pasa automáticamente](#qué-pasa-automáticamente)
7. [Reglas de protección](#reglas-de-protección)
8. [Configuración del repositorio](#configuración-del-repositorio)
9. [Replicar este flujo en otro proyecto](#replicar-este-flujo-en-otro-proyecto)
10. [Solución de problemas](#solución-de-problemas)

---

## Estructura del repositorio

| Carpeta / archivo | Qué contiene |
|---|---|
| `public_html/` | El sitio generado. Es exactamente lo que se publica. |
| `herramientas/` | Generador del sitio (`build.js`), pruebas y scripts del despliegue. |
| `herramientas/fuentes/` | Diseños fuente que el generador transforma en el sitio. |
| `traducciones/` | Textos en inglés y portugués, y las rutas traducidas. |
| `.github/workflows/` | Automatizaciones de GitHub Actions (ver [Qué pasa automáticamente](#qué-pasa-automáticamente)). |

Scripts del despliegue en `herramientas/`:

| Script | Cuándo corre | Qué hace |
|---|---|---|
| `preparar-test.js` | Deploy a pruebas | Copia el sitio para que funcione dentro de la carpeta `/landings/`, apaga Analytics y le pide a Google no indexarlo. |
| `fechas-sitemap.js` | Deploy a producción | Pone en `sitemap.xml` la fecha real del último cambio de cada página, según Git. |
| `versionar-assets.js` | Deploy a producción | Agrega una huella (`?v=…`) a cada CSS y JS para que el navegador nunca mezcle HTML nuevo con CSS viejo. |

> `public_html/` se genera con `build.js`. **No edites a mano** los HTML ni el `.htaccess`: se pierden en la siguiente generación. Cambia el generador y vuelve a generar.

---

## Trabajar en el sitio

```bash
cd herramientas
npm install
npm run generar        # reconstruye public_html/
npm run servir         # ver el sitio en http://127.0.0.1:8765
npm run probar         # enlaces + pruebas de navegador
```

Más detalle en `herramientas/LEEME.md` y `herramientas/COMO-ACTUALIZAR-TIENDA.md`.

---

## Flujo de ramas

```
develop ──► feature/HU-xxx ──PR──► test ──────────────► pruebas (GitHub Pages)
                                    │
                                    └──PR──► main ─────► producción (GoDaddy)
                                              │
                    develop y test ◄──sync automático──┘

Emergencias:   main ──► hotfix/xxx ──PR──► main
```

| Rama | Para qué | Quién escribe en ella |
|---|---|---|
| `main` | Producción. Lo que está aquí es lo que ve el público. | Solo PR desde `test` o `hotfix/*`, con aprobación. |
| `test` | Pruebas. Lo que el cliente revisa antes de aprobar. | PR desde ramas de trabajo, con aprobación. El bot de sync. |
| `develop` | Base de trabajo. Siempre igual a producción. | Solo el bot de sync. |
| `feature/HU-xxx-…` | Un cambio (una historia de usuario). | Quien hace el cambio. Se borra sola al mergear. |
| `hotfix/…` | Arreglo urgente de producción. | Quien hace el arreglo. Se borra sola al mergear. |

**Regla de oro:** todo PR lo aprueba **una persona distinta** a quien hizo el último cambio.

---

## Paso a paso de un cambio

### 1. Crear la rama

```bash
git checkout develop
git pull                                   # develop siempre al día antes de empezar
git checkout -b feature/HU-123-descripcion-corta
```

### 2. Trabajar y subir

```bash
cd herramientas && npm run generar && npm run probar && cd ..
git add .
git commit -m "feat(HU-123): qué cambia, en una línea"
git push -u origin feature/HU-123-descripcion-corta
```

### 3. PR a pruebas

En GitHub: **Compare & pull request**.

```
base: test   ←   compare: feature/HU-123-descripcion-corta
```

> **base** = a dónde llegan los cambios (destino). **compare** = de dónde salen (origen).
> GitHub pone `main` como base por defecto: **cámbiala a `test`**.

Otro colaborador revisa **Files changed** y aprueba. Al mergear, en 1–2 minutos el cambio está en
[test-paginas.cauce-ingenieria.com/landings/](https://test-paginas.cauce-ingenieria.com/landings/).

### 4. Revisión del cliente

Se comparte el enlace de pruebas. Si hay ajustes, se hacen **en la misma rama** y se abre otro PR a `test`.

### 5. PR a producción

Cuando todo está aprobado:

```
base: main   ←   compare: test
```

Otro colaborador aprueba y se mergea. En menos de un minuto está en [cauce-ingenieria.com](https://cauce-ingenieria.com),
con la caché del firewall limpia. No hay que hacer nada más.

> `test` acumula todo lo que se ha mergeado ahí. El PR `test → main` lleva **todo** lo pendiente de pruebas:
> revisa **Files changed** antes de aprobar.

---

## Hotfix: emergencias en producción

Para un error en producción que no puede esperar el ciclo de pruebas:

```bash
git checkout main
git pull
git checkout -b hotfix/descripcion-del-arreglo
# … arreglo, commit, push …
```

PR: `base: main ← compare: hotfix/descripcion-del-arreglo`. También necesita aprobación de otra persona.

- La rama **debe salir de `main`**. Si sale de `develop` o `test`, el check la bloquea: arrastraría a producción trabajo sin aprobar.
- Después del merge, el sync baja el arreglo a `develop` y `test` solo.

---

## Qué pasa automáticamente

| Workflow | Se dispara con | Qué hace |
|---|---|---|
| **Validar flujo de ramas** (`validar-pr.yml`) | Cada PR a `test` o `main` | Bloquea PRs que no siguen el flujo (ej. `feature → main`, hotfix creado desde `develop`). Es un check obligatorio. |
| **Deploy TEST** (`deploy-test.yml`) | Push a `test` | Prepara la copia de pruebas y la publica en GitHub Pages. |
| **Deploy PROD** (`deploy-prod.yml`) | Push a `main` | Fechas reales en el sitemap → huella en CSS/JS → sube a GoDaddy por FTPS solo lo que cambió (con reintento) → limpia la caché del firewall. |
| **Sincronizar develop y test** (`sync-ramas.yml`) | Push a `main` | Baja `main` a `develop` y a `test` con la GitHub App `cauce-labs-sync`. Si hay conflicto, abre un PR para resolverlo a mano. |

Todos se pueden relanzar desde la pestaña **Actions** → el workflow → **Run workflow** / **Re-run jobs**.

---

## Reglas de protección

Configuradas en **Settings → Rules → Rulesets**:

| Regla | Rama | Qué exige | Excepciones (bypass) |
|---|---|---|---|
| `proteger-main` | `main` | PR obligatorio · 1 aprobación de alguien distinto al último push · check `validar-origen` · sin borrar ni reescribir historial | Admin, *solo dentro de un PR* (mientras el equipo sea de una persona) |
| `proteger-test` | `test` | Igual que `main` | Admin (solo PR) · App `cauce-labs-sync` |
| `proteger-develop` | `develop` | PR obligatorio · 1 aprobación · sin borrar ni reescribir | Admin (solo PR) · App `cauce-labs-sync` |

> Cuando haya más de un colaborador, **quitar el bypass de admin** para que la regla de aprobación aplique a todos.
> **Nunca** quitar `cauce-labs-sync` de `test` y `develop`: sin ese permiso el sync falla.

---

## Configuración del repositorio

Lo que necesita el repo para que todo funcione (los **valores** viven solo en GitHub y en los paneles de cada servicio; nunca en el código):

**Settings → Secrets and variables → Actions**

| Tipo | Nombre | Para qué |
|---|---|---|
| Variable | `SYNC_APP_ID` | ID de la GitHub App `cauce-labs-sync`. |
| Secret | `SYNC_APP_PRIVATE_KEY` | Llave privada (`.pem`) de esa App. |

**Settings → Environments → `produccion`** (solo la rama `main` puede usarlo)

| Secret | Para qué |
|---|---|
| `FTP_SERVER` | IP del hosting. **No** el dominio: el dominio pasa por el firewall, que no deja pasar FTP. |
| `FTP_USERNAME` | Cuenta FTP exclusiva para GitHub, encerrada en `public_html`. |
| `FTP_PASSWORD` | Contraseña de esa cuenta. |
| `SUCURI_API_KEY` / `SUCURI_API_SECRET` | API del firewall (Website Security → Firewall → Settings → API). Opcionales: sin ellos, la caché se limpia a mano. |

**Otros ajustes**

- **Settings → Pages → Source:** GitHub Actions.
- **Settings → Environments → `github-pages`:** rama `test` permitida.
- **Settings → General:** "Automatically delete head branches" activado.
- **Organización:** dominio `cauce-ingenieria.com` verificado en Pages; repo `Cauce-Ing-LABS.github.io` con el dominio `test-paginas.cauce-ingenieria.com` (índice de todos los proyectos en pruebas).

**Seguridad del hosting:** el `.htaccess` solo acepta tráfico que llega desde el firewall de GoDaddy. Quien intente entrar directo al hosting recibe `403`.

---

## Replicar este flujo en otro proyecto

1. Crear el repo en `Cauce-Ing-LABS` con las ramas `main`, `develop` y `test`.
2. Copiar `.github/workflows/` y los scripts de `herramientas/` que apliquen (`preparar-test.js`, `fechas-sitemap.js`, `versionar-assets.js`). Ajustar la carpeta publicada si no es `public_html/`.
3. **Settings → Pages → Source:** GitHub Actions. En el environment `github-pages`, permitir la rama `test`.
   El proyecto queda en `test-paginas.cauce-ingenieria.com/<nombre-del-repo>/`.
4. Crear el environment `produccion` con sus secrets (hosting del proyecto).
5. Instalar la App `cauce-labs-sync` en el repo nuevo y crear `SYNC_APP_ID` / `SYNC_APP_PRIVATE_KEY`.
6. Crear los tres rulesets (ver [Reglas de protección](#reglas-de-protección)). El check `validar-origen` aparece después de abrir el primer PR.
7. Agregar la tarjeta del proyecto en `index.html` del repo `Cauce-Ing-LABS.github.io`.

---

## Solución de problemas

| Síntoma | Causa | Qué hacer |
|---|---|---|
| El sitio se ve "dañado" (sin estilos, tipografías raras) después de un deploy | El navegador tiene CSS viejo en caché | `Ctrl + F5`. Desde la huella en CSS/JS no debería pasarles a los visitantes. |
| Deploy PROD: `Timeout (control socket)` | GoDaddy cortó la conexión FTP | El workflow reintenta solo. Si falla dos veces: **Re-run failed jobs**. |
| Sync en rojo con `rule violations` | La App perdió el bypass en una regla | Revisar que `cauce-labs-sync` esté en el bypass de `proteger-test` y `proteger-develop`. |
| Sync en rojo con conflictos | `main` y `develop`/`test` chocan | El bot abre un PR `main → <rama>`: resolver ahí. |
| El check `validar-origen` falla | El PR no sigue el flujo | Leer el mensaje del check. Casi siempre: base y compare invertidos. |
| No deja mergear: "Review required" | Falta la aprobación de otra persona | Pedir revisión a un colaborador. |
| Producción no muestra el cambio | Caché del firewall | Revisar el resumen del Deploy PROD; si no se limpió sola: Website Security → Firewall → Rendimiento → **Clear Cache**. |

---

## Licencia

Todos los derechos reservados · Cauce Ingeniería S.A.S. Ver `LICENSE`.
