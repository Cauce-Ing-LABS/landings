# Cómo actualizar los productos de la tienda

Todos los productos de la tienda (`/tienda/`) salen de un solo archivo:

```
public_html/tienda/productos.csv
```

Para agregar, quitar o cambiar productos **solo se edita ese archivo** y se sube al hosting en la misma ruta. No hay que tocar código. La página lo lee cada vez que alguien entra, así que el cambio se ve de inmediato.

## Editarlo con Excel

1. Abre `productos.csv` con Excel (doble clic).
2. Cada fila es un producto y cada columna un dato (ver la tabla abajo).
3. Guarda con **Archivo → Guardar como → CSV UTF-8 (delimitado por comas)**.
   - Si guardas como "CSV (delimitado por comas)" normal también funciona: la tienda reconoce el separador `;` o `,` y las tildes en ambos formatos.
4. Sube el archivo a GoDaddy en `public_html/tienda/productos.csv`, reemplazando el anterior (cPanel → Administrador de archivos → Cargar).

También se puede editar con Google Sheets (Archivo → Descargar → CSV) o con cualquier editor de texto.

## Columnas

| Columna | Qué poner | Ejemplo |
| --- | --- | --- |
| `id` | Identificador único, sin espacios ni tildes. No lo cambies después de publicar (los pedidos guardados lo usan). | `cpu-core-i5-7ma` |
| `activo` | `si` para mostrarlo, `no` para ocultarlo sin borrarlo (por ejemplo, si se agota). | `si` |
| `orden` | Número para ordenar: los más bajos salen primero. Los destacados siempre van arriba. | `20` |
| `categoria` | Categoría del menú lateral. Si escribes una nueva, aparece sola. | `Computadores de escritorio` |
| `subcategoria` | Subcategoría dentro de la categoría. | `Torre (CPU)` |
| `nombre` | Nombre que ve el cliente. | `CPU Intel Core i5 7.ª generación HP, Dell o Lenovo` |
| `referencia` | Marcas o modelos de referencia. | `HP ProDesk, Dell OptiPlex o Lenovo ThinkCentre, según disponibilidad` |
| `estado` | `Nuevo`, `Reacondicionado` o `Nuevo o reacondicionado` (el cliente elige). | `Reacondicionado` |
| `alquiler` | `si` si se puede alquilar (por ahora solo computadores, solo en Cali). | `si` |
| `destacado` | `si` para mostrar la etiqueta "Más elegido" y subirlo al inicio. | `no` |
| `resumen` | Una frase de para qué sirve. | `La CPU más pedida para oficina.` |
| `etiquetas` | Datos cortos que se ven en la tarjeta, separados por `\|`. | `Core i5 7.ª gen \| 8 a 16 GB \| SSD` |
| `caracteristicas` | Tabla de la ficha: `Nombre: valor`, separados por `\|`. | `Procesador: Intel Core i5 \| Formato: Torre` |
| `opciones` | Lo que el cliente elige: `Grupo: opción1 / opción2`, grupos separados por `\|`. Vacío si no hay opciones. | `RAM: 8 GB / 16 GB \| Disco: 256 GB SSD / 512 GB SSD` |
| `garantia` | Garantía que se muestra en la ficha. | `Garantía escrita de 6 meses` |
| `incluye` | Qué trae el producto. | `Solo CPU (sin monitor, teclado ni mouse)` |
| `imagen` | Opcional. Una o varias fotos separadas por `|` (la primera sale en la tarjeta; todas en la galería de la ficha). Puede ser el nombre de un archivo en `public_html/tienda/img/` o una dirección `https://…`. Vacío = se muestra un dibujo según la categoría. | `cpu-lenovo.jpg | cpu-dell.jpg | cpu-hp.jpg` |

## Reglas para que no se dañe

- **No uses punto y coma (`;`) dentro de los textos.** Es el separador de columnas. Usa comas.
- **Para pulgadas usa `″`** (o la palabra "pulgadas") en lugar de comillas: `22″`.
- Dentro de `etiquetas`, `caracteristicas` y `opciones`, el separador es la barra vertical `|`. Dentro de cada grupo de `opciones`, las alternativas van separadas por `/`.
- **No pongas precios.** La tienda no publica precios; todo se cotiza por WhatsApp.
- No borres la primera fila (los nombres de las columnas) ni cambies sus nombres.

## Fotos de productos

1. Sube la foto a `public_html/tienda/img/` (cPanel → Administrador de archivos → Cargar). La carpeta ya existe.
2. En la columna `imagen` del producto escribe solo el nombre del archivo, por ejemplo `thinkpad-t480.jpg`.
3. Para varias fotos (por ejemplo una por marca: Lenovo, Dell y HP), sepáralas con `|`. La primera sale en la tarjeta y todas aparecen como miniaturas en la ficha.
4. Si el nombre está mal o la foto no existe, la tienda muestra el dibujo de la categoría en lugar de una imagen rota.

Recomendaciones para que se vean bien:

- **Formato:** JPG o WebP, cuadradas (por ejemplo 800 × 800 px) y de menos de 200 KB.
- **Fondo:** blanco o claro, con el equipo centrado.
- **Nombres:** en minúsculas, sin espacios ni tildes (`cpu-core-i5-7ma.jpg`, no `CPU Core i5 7ma.jpg`).
- **De dónde sacarlas:** lo ideal son fotos propias de los equipos que tienes en inventario. También sirven las imágenes oficiales de producto que entregan los fabricantes o distribuidores a sus revendedores. **No copies fotos de otras tiendas** (como las de los mayoristas de referencia): tienen derechos de autor.
- También se puede poner una dirección completa (`https://…`) si la foto está alojada en otro lugar.

## Agregar puntos de venta o licencias más adelante

Basta con agregar filas con una categoría nueva, por ejemplo `Punto de venta` o `Licencias de software`. Aparecen solas en el menú lateral con sus subcategorías. Para licencias, deja `estado` vacío (no aplica nuevo o reacondicionado).

## Si algo sale mal

Si el archivo tiene un error grave, la tienda muestra "No pudimos cargar el catálogo" con un botón de WhatsApp. Vuelve a subir la versión anterior del CSV y revisa los puntos de "Reglas para que no se dañe".
