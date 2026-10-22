# cauce-landing-pages

Sitio web de **Cauce Ingeniería** · [cauce-ingenieria.com](https://cauce-ingenieria.com) · español, inglés y portugués.

## Estructura

| Carpeta | Qué contiene |
|---|---|
| `public_html/` | El sitio generado. Es lo que se publica. |
| `herramientas/` | Generador del sitio (`build.js`) y pruebas de enlaces y de navegador. |
| `herramientas/fuentes/` | Diseños fuente que el generador transforma en el sitio. |
| `traducciones/` | Textos en inglés y portugués, y las rutas traducidas. |

## Trabajar en el sitio

```bash
cd herramientas
npm install
npm run generar        # reconstruye public_html/
npm run servir         # ver el sitio en http://127.0.0.1:8765
npm run probar         # enlaces + pruebas de navegador
```

Más detalle en `herramientas/LEEME.md` y `herramientas/COMO-ACTUALIZAR-TIENDA.md`.

## Flujo de ramas

1. Crea tu rama desde `develop`: `feature/HU-xxx-descripcion`.
2. Abre un PR hacia `test`. Al mergearse, se publica en el ambiente de pruebas.
3. Si el cambio queda aprobado, se abre un PR `test` → `main` y se publica en producción.
4. Emergencias: rama `hotfix/...` desde `main`, PR directo a `main`.

Todo PR necesita la aprobación de un colaborador distinto a quien hizo el cambio.

## Licencia

Ver `LICENSE`.
