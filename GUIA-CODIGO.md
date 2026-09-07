# Guía de código de HuertoHogar

Esta guía explica la responsabilidad real de cada archivo y de cada bloque importante del proyecto. Además, las páginas HTML, módulos JavaScript y hojas CSS tienen comentarios colocados encima de sus estructuras principales. Se mantiene la documentación por bloques en lugar de repetir una frase en cada línea, porque así el proyecto sigue siendo legible y ejecutable.

## Cómo funciona el proyecto

1. Las páginas HTML definen la estructura visible y conectan hojas CSS y scripts.
2. `css/variables.css` define colores y tipografías globales.
3. `css/reset-.css` normaliza márgenes y tamaños de elementos.
4. Las hojas CSS restantes estilizan cada sección concreta.
5. `js/core.js` inicia la aplicación común y expone utilidades.
6. `js/app.js` conecta las inicializaciones comunes.
7. `js/cart.js` administra el carrito mediante `localStorage`.
8. `js/forms.js` procesa filtros, formularios y productos del catálogo.
9. `js/product-data.js` carga el detalle de productos y reseñas.
10. `js/admin.js` controla autenticación, administración, usuarios y productos.

## Páginas públicas

### `index.html`

- Define la cabecera principal y la navegación del sitio.
- Presenta el héroe de la página de inicio.
- Muestra productos destacados con `data-id`, nombre y precio.
- Sus botones son detectados por `js/forms.js` para añadir productos al carrito.
- Usa imágenes reales de `img/`.
- Se corrigió el cierre faltante del contenedor del héroe.
- Se corrigieron los IDs de naranjas (`FR002`) y plátanos (`FR003`).

### `productos.html`

- Construye el catálogo con tarjetas de productos.
- Cada tarjeta contiene categoría, precio, stock, imagen y `data-id`.
- El formulario de filtros permite combinar categoría y precio.
- El atributo `data-img` es la ruta que `js/forms.js` guarda en el carrito.
- Se corrigió la ruta de la leche para que use `img/leche.jpg`.
- Contiene el modal de detalles y reseñas; su estructura existe, pero la apertura completa requiere conectar listeners en JavaScript.

### `detalle-producto.html`

- Contiene la plantilla para un solo producto.
- `js/product-data.js` toma el parámetro `id` de la URL.
- El script completa nombre, precio, stock, origen, descripción e imagen.
- También conecta el botón de añadir al carrito y las reseñas.

### `carrito.html`

- Muestra las líneas guardadas en `hh_carrito`.
- Permite aumentar, disminuir y eliminar cantidades.
- Presenta subtotal, despacho y total.
- El botón de confirmación todavía funciona como simulación mediante `alert`.

### `login.html`

- Presenta el formulario de inicio de sesión.
- `js/admin.js` valida correo y contraseña.
- La sesión válida se guarda en `sesion_activa`.
- Los administradores son enviados al panel y los clientes al inicio.

### `registro.html`

- Presenta el formulario de creación de usuario.
- Valida los datos antes de guardar la cuenta.
- Los usuarios se almacenan en `usuarios_huerto`.

### `perfil.html`

- Permite ver y actualizar nombre, correo, teléfono, dirección y contraseña.
- `js/admin.js` carga los datos de `sesion_activa`.
- La actualización también sincroniza el usuario almacenado.
- Conviene reforzar la longitud mínima de la nueva contraseña.

### `contacto.html`

- Muestra datos de contacto y un formulario.
- El formulario tiene estructura y estilos, pero actualmente no tiene un controlador JavaScript que procese el envío o muestre confirmación.

### `seguimiento.html`

- Presenta la búsqueda de un pedido y sus estados.
- La lógica de seguimiento es principalmente demostrativa y depende del flujo definido en `js/forms.js`.

### `blog.html`

- Muestra artículos y consejos en tarjetas.
- Los enlaces `Leer consejo` todavía apuntan a `#`; no abren artículos independientes.

### `nosotros.html`

- Presenta la historia, propósito y valores de HuertoHogar.
- Es una página informativa sin lógica de negocio compleja.

## Páginas administrativas

### `admin-dashboard.html`

- Presenta el resumen del panel administrativo.
- Usa la sesión de administrador y los estilos del panel.

### `admin-productos.html`

- Lista los productos guardados en `productos_huerto`.
- Cada fila muestra imagen, nombre, categoría, precio, stock y acciones.
- El enlace Editar abre `admin-editar-producto.html?id=...`.
- El botón Eliminar borra el producto después de confirmación.
- El botón Crear producto abre `admin-nuevo-producto.html`.

### `admin-nuevo-producto.html`

- Contiene el formulario para crear un producto.
- El selector visual permite elegir una imagen real de `img/`.
- El radio seleccionado actualiza el campo oculto que se guarda.
- `js/admin.js` valida nombre, precio y stock antes de persistir.

### `admin-editar-producto.html`

- Carga el producto indicado por el parámetro `id`.
- Rellena sus campos y marca la imagen actual.
- Permite actualizar o eliminar el producto.

### `admin-usuarios.html`

- Lista los usuarios almacenados en `usuarios_huerto`.
- Cada fila enlaza con la edición del usuario correspondiente.

### `admin-nuevo-usuario.html`

- Permite registrar usuarios desde el panel.
- Valida el formato de correo y evita duplicados en el alta.

### `admin-editar-usuario.html`

- Permite modificar nombre, correo, teléfono, dirección y rol.
- El campo de contraseña está presente en HTML, pero la lógica actual no lo lee ni lo guarda; es una integración pendiente.
- También conviene evitar que el correo editado coincida con el de otro usuario.

## JavaScript

### `js/core.js`

- Define utilidades compartidas.
- Escapa HTML cuando corresponde.
- Inicializa funciones generales disponibles para todas las páginas.

### `js/app.js`

- Es el punto de entrada común de la aplicación.
- Llama a inicializadores expuestos por los módulos cargados.

### `js/cart.js`

- Lee y guarda el carrito en `hh_carrito`.
- Normaliza productos antes de agregarlos.
- Calcula cantidades y totales.
- Renderiza las tarjetas del carrito.
- Se corrigió el fallback de imagen para usar `img/manzanas-fuji.png`, que sí existe.

### `js/forms.js`

- Procesa filtros de catálogo.
- Conecta botones Añadir.
- Construye el objeto que pasa al carrito.
- Ejecuta validaciones de formularios públicos.
- Se corrigió el fallback de imagen inexistente.
- El buscador busca selectores que no están presentes actualmente en las páginas; debe añadirse el buscador o eliminarse esa lógica.

### `js/product-data.js`

- Contiene la fuente de datos de productos de detalle.
- Busca productos por ID.
- Renderiza los datos del detalle.
- Guarda y muestra reseñas por producto.
- Conecta el botón de añadir al carrito.
- El modal antiguo de `productos.html` necesita listeners adicionales si se desea usarlo allí.

### `js/admin.js`

- Crea la cuenta inicial de administrador.
- Lee y cierra sesiones.
- Oculta o muestra la interfaz de sesión.
- Protege las páginas cuyo nombre comienza por `admin-`.
- Administra el CRUD de usuarios.
- Administra el CRUD de productos.
- Inicializa productos de ejemplo con rutas existentes.
- Se corrigió la lectura insegura de `sesion_activa` usando `try/catch`.
- Aún conviene validar datos corruptos de usuarios antes de llamar a `toLowerCase()`.
- Los datos de usuarios y productos deben escaparse antes de insertarse con `innerHTML`.

## CSS

### Bases globales

- `css/variables.css`: colores, tipografías y tokens compartidos.
- `css/reset-.css`: reset y normalización global.
- `css/styles.css`: estilos generales antiguos; actualmente está duplicado parcialmente y no es la hoja principal de todas las páginas.

### Componentes y páginas

- `css/header.css`: cabecera, navegación, perfil y carrito.
- `css/footer.css`: pie de página.
- `css/buttons.css`: botones comunes.
- `css/home.css`: héroe y contenido de inicio.
- `css/catalogo.css`: filtros, tarjetas y modal del catálogo.
- `css/carrito.css`: tarjetas, cantidades y resumen del carrito.
- `css/producto-detalle.css`: composición de la página de detalle.
- `css/forms.css`: formularios públicos.
- `css/admin.css`: panel, tarjetas, formularios, tabla y selector de imágenes administrativos.
- `css/blog.css`: tarjetas del blog.
- `css/nosotros.css`: sección informativa de Nosotros.
- `css/perfil.css`: perfil de usuario.
- `css/seguimiento.css`: formulario y estados de seguimiento.

## Imágenes

La carpeta `img/` contiene las imágenes que sí existen:

- `espinaca.png`
- `hero-campo.png`
- `leche.jpg`
- `manzanas-fuji.png`
- `miel-organica.png`
- `naranjas.jpg`
- `pimentones.jpg`
- `platanos.jpg`
- `quinoa.jpg`
- `zanahorias.png`

Las rutas antiguas `img/producto1.jpg`, `img/producto2.jpg` e `img/producto3.jpg` no existen y fueron reemplazadas en los módulos afectados.

## Estado de la revisión

- El diagnóstico del editor no reporta errores en los archivos del proyecto.
- Se corrigió el DOM incompleto de `index.html`.
- Se corrigieron IDs de productos inconsistentes.
- Se corrigió la imagen equivocada de la leche.
- Se corrigieron fallbacks de imágenes inexistentes.
- Se hizo segura la lectura de la sesión administrativa.
- Pendientes funcionales: contacto, modal antiguo del catálogo, contraseña en edición de usuario, validación de duplicados al editar correo, protección contra HTML no escapado y confirmación de pedido persistente.

## Respuestas rápidas para la ronda

### ¿Cómo cambiar el fondo general del sitio?

En `css/variables.css`, cambia el valor de `--bg-main`. Esta variable se reutiliza mediante `var(--bg-main)` en las páginas:

```css
/* Color de fondo general de todas las páginas que usan la variable. */
--bg-main: #FAF8F5;
```

### ¿Cómo cambiar el fondo de la página de inicio?

En `css/home.css`, modifica `background-image` dentro de `.home-hero` para cambiar la imagen principal:

```css
/* Imagen que aparece detrás del texto principal del inicio. */
background-image: url('../img/hero-campo.png');
```

Si se quiere cambiar el color de la capa oscura sobre la imagen, se modifica `background` dentro de `.home-hero::before`.

### ¿Cómo cambiar el color de los botones?

En `css/variables.css`, cambia `--primary-green` para el color principal y `--primary-hover` para el color al pasar el mouse. Los botones usan esas variables desde `css/buttons.css`, `css/home.css` y `css/admin.css`.

### ¿Cómo cambiar el título de una página?

El título visible se encuentra en el elemento `<h1>` o `<h2>` de cada archivo HTML. El título de la pestaña del navegador se cambia en `<title>` dentro de `<head>`.

### ¿Cómo agregar un producto al catálogo?

En `productos.html`, se duplica una tarjeta `.producto-card` y se actualizan `data-id`, `data-nombre`, `data-precio`, `data-img`, descripción, stock e imagen. `js/forms.js` lee esos atributos al pulsar Añadir.

### ¿Cómo cambiar una imagen de producto?

Se cambia el atributo `src` de la imagen HTML o el valor `data-img` de la tarjeta. Las rutas válidas actuales están listadas en la sección Imágenes de esta guía.

### ¿Cómo funciona el carrito?

`js/cart.js` usa `localStorage` con la clave `hh_carrito`. `addToCart()` agrega o incrementa productos; `renderCart()` dibuja las tarjetas, calcula subtotal, despacho, total y huella; `initCart()` conecta los botones +, -, eliminar y confirmar.

### ¿Cómo se confirma un pedido?

El botón `#btn-confirmar-pedido` ejecuta `confirmOrder()` en `js/cart.js`. La función genera un código `HH-xxxxx`, guarda el pedido en `hh_ultimo_pedido` y `hh_pedidos`, limpia el carrito y muestra la boleta.

### ¿Cómo funciona el seguimiento?

`js/forms.js` lee el código de la URL o de `hh_ultimo_pedido`. Al enviar `#form-rastreo`, busca el pedido guardado y activa los pasos de `#linea-tiempo`.

### ¿Cómo cambiar una dirección del mapa?

En `nosotros.html`, cada botón `.btn-ciudad` tiene `data-direccion` para el texto y opcionalmente `data-mapa` para coordenadas exactas. `initLocationsMap()` en `js/forms.js` usa esos datos al pulsar la ciudad.

### ¿Cómo funciona el inicio de sesión?

`js/admin.js` valida `#form-login`. Si las credenciales coinciden, guarda el usuario en `sesion_activa`. Si no existe esa clave, el sitio muestra `Mi cuenta`; no se crea una sesión automática.

## Convención de comentarios

Los comentarios deben usar la sintaxis del lenguaje para no romper el proyecto:

```html
<!-- Explica una estructura HTML. -->
```

```css
/* Explica una regla o declaración CSS. */
```

```javascript
/* Explica una función o bloque JavaScript. */
```

La documentación está colocada encima de cada página, módulo, función y bloque visual importante. Las líneas vacías, llaves de cierre y valores obvios no necesitan una explicación repetida: se entienden por el comentario de la estructura que las contiene.
