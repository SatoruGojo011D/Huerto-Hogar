# Guía de código de HuertoHogar

Esta guía explica la responsabilidad real de cada archivo y de cada bloque importante del proyecto. Además, las páginas HTML, módulos JavaScript y hojas CSS tienen comentarios colocados encima de sus estructuras principales. Se mantiene la documentación por bloques en lugar de repetir una frase en cada línea, porque así el proyecto sigue siendo legible y ejecutable.

## Cómo funciona el proyecto

1. Las páginas HTML definen la estructura visible y conectan hojas CSS y scripts.
2. `css/variables.css` define colores y tipografías globales.
3. `css/reset.css` normaliza márgenes y tamaños de elementos.
4. Las hojas CSS restantes estilizan cada sección concreta.
5. `js/inicializacion.js` inicia la aplicación común y expone utilidades.
6. `js/app.js` conecta las inicializaciones comunes.
7. `js/carrito.js` administra el carrito mediante `localStorage`.
8. `js/formularios.js` procesa filtros, formularios y productos del catálogo.
9. `js/datos-productos.js` carga el detalle de productos y reseñas.
10. `js/administracion.js` controla autenticación, administración, usuarios y productos.

## Páginas públicas

### `index.html`

- Define la cabecera principal y la navegación del sitio.
- Presenta el héroe de la página de inicio.
- Muestra productos destacados con `data-id`, nombre y precio.
- Sus botones son detectados por `js/formularios.js` para añadir productos al carrito.
- Usa imágenes reales de `img/`.
- Se corrigió el cierre faltante del contenedor del héroe.
- Se corrigieron los IDs de naranjas (`FR002`) y plátanos (`FR003`).

### `productos.html`

- Construye el catálogo con tarjetas de productos.
- Cada tarjeta contiene categoría, precio, stock, imagen y `data-id`.
- El formulario de filtros permite combinar categoría y precio.
- El atributo `data-img` es la ruta que `js/formularios.js` guarda en el carrito.
- Se corrigió la ruta de la leche para que use `img/leche.jpg`.
- Contiene el modal de detalles y reseñas; su estructura existe, pero la apertura completa requiere conectar listeners en JavaScript.

### `detalle-producto.html`

- Contiene la plantilla para un solo producto.
- `js/datos-productos.js` toma el parámetro `id` de la URL.
- El script completa nombre, precio, stock, origen, descripción e imagen.
- También conecta el botón de añadir al carrito y las reseñas.

### `carrito.html`

- Muestra las líneas guardadas en `hh_carrito`.
- Permite aumentar, disminuir y eliminar cantidades.
- Presenta subtotal, despacho y total.
- El botón de confirmación todavía funciona como simulación mediante `alert`.

### `login.html`

- Presenta el formulario de inicio de sesión.
- `js/administracion.js` valida correo y contraseña.
- La sesión válida se guarda en `sesion_activa`.
- Los administradores son enviados al panel y los clientes al inicio.

### `registro.html`

- Presenta el formulario de creación de usuario.
- Valida los datos antes de guardar la cuenta.
- Los usuarios se almacenan en `usuarios_huerto`.

### `perfil.html`

- Permite ver y actualizar nombre, correo, teléfono, dirección y contraseña.
- `js/administracion.js` carga los datos de `sesion_activa`.
- La actualización también sincroniza el usuario almacenado.
- Conviene reforzar la longitud mínima de la nueva contraseña.

### `contacto.html`

- Muestra datos de contacto y un formulario.
- El formulario tiene estructura y estilos, pero actualmente no tiene un controlador JavaScript que procese el envío o muestre confirmación.

### `seguimiento.html`

- Presenta la búsqueda de un pedido y sus estados.
- La lógica de seguimiento es principalmente demostrativa y depende del flujo definido en `js/formularios.js`.

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
- `js/administracion.js` valida nombre, precio y stock antes de persistir.

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

### `js/inicializacion.js`

- Define utilidades compartidas.
- Escapa HTML cuando corresponde.
- Inicializa funciones generales disponibles para todas las páginas.

### `js/app.js`

- Es el punto de entrada común de la aplicación.
- Llama a inicializadores expuestos por los módulos cargados.

### `js/carrito.js`

- Lee y guarda el carrito en `hh_carrito`.
- Normaliza productos antes de agregarlos.
- Calcula cantidades y totales.
- Renderiza las tarjetas del carrito.
- Se corrigió el fallback de imagen para usar `img/manzanas-fuji.png`, que sí existe.

### `js/formularios.js`

- Procesa filtros de catálogo.
- Conecta botones Añadir.
- Construye el objeto que pasa al carrito.
- Ejecuta validaciones de formularios públicos.
- Se corrigió el fallback de imagen inexistente.
- El buscador busca selectores que no están presentes actualmente en las páginas; debe añadirse el buscador o eliminarse esa lógica.

### `js/datos-productos.js`

- Contiene la fuente de datos de productos de detalle.
- Busca productos por ID.
- Renderiza los datos del detalle.
- Guarda y muestra reseñas por producto.
- Conecta el botón de añadir al carrito.
- El modal antiguo de `productos.html` necesita listeners adicionales si se desea usarlo allí.

### `js/administracion.js`

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
- `css/reset.css`: reset y normalización global.

### Componentes y páginas

- `css/header.css`: cabecera, navegación, perfil y carrito.
- `css/footer.css`: pie de página.
- `css/buttons.css`: botones comunes.
- `css/home.css`: héroe y contenido de inicio.
- `css/catalogo.css`: filtros y tarjetas del catálogo.
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

En `productos.html`, se duplica una tarjeta `.producto-card` y se actualizan `data-id`, `data-nombre`, `data-precio`, `data-img`, descripción, stock e imagen. `js/formularios.js` lee esos atributos al pulsar Añadir.

### ¿Cómo cambiar una imagen de producto?

Se cambia el atributo `src` de la imagen HTML o el valor `data-img` de la tarjeta. Las rutas válidas actuales están listadas en la sección Imágenes de esta guía.

### ¿Cómo funciona el carrito?

`js/carrito.js` usa `localStorage` con la clave `hh_carrito`. `addToCart()` agrega o incrementa productos; `renderCart()` dibuja las tarjetas, calcula subtotal, despacho, total y huella; `initCart()` conecta los botones +, -, eliminar y confirmar.

### ¿Cómo se confirma un pedido?

El botón `#btn-confirmar-pedido` ejecuta `confirmOrder()` en `js/carrito.js`. La función genera un código `HH-xxxxx`, guarda el pedido en `hh_ultimo_pedido` y `hh_pedidos`, limpia el carrito y muestra la boleta.

### ¿Cómo funciona el seguimiento?

`js/formularios.js` lee el código de la URL o de `hh_ultimo_pedido`. Al enviar `#form-rastreo`, busca el pedido guardado y activa los pasos de `#linea-tiempo`.

### ¿Cómo cambiar una dirección del mapa?

En `nosotros.html`, cada botón `.btn-ciudad` tiene `data-direccion` para el texto y opcionalmente `data-mapa` para coordenadas exactas. `initLocationsMap()` en `js/formularios.js` usa esos datos al pulsar la ciudad.

### ¿Cómo funciona el inicio de sesión?

`js/administracion.js` valida `#form-login`. Si las credenciales coinciden, guarda el usuario en `sesion_activa`. Si no existe esa clave, el sitio muestra `Mi cuenta`; no se crea una sesión automática.

## Respuestas para las preguntas del profesor

### ¿Cómo hago una validación de contraseña entre 18 y 100 caracteres?

Se combinan dos niveles de validación. En el HTML se puede indicar el rango para que el navegador lo conozca:

```html
<input type="password" id="password" minlength="18" maxlength="100" required>
```

En JavaScript se valida el valor antes de guardar o enviar el formulario:

```javascript
const password = campoPassword.value;
if (password.length < 18 || password.length > 100) {
	mostrarError(campoPassword, 'La contraseña debe tener entre 18 y 100 caracteres.');
	return false;
}
```

`minlength` y `maxlength` ayudan al navegador, pero la comprobación de JavaScript es necesaria porque permite mostrar un mensaje propio y detener el registro. Para un nombre se aplica la misma idea, pero normalmente se permiten solo letras y se define un rango, por ejemplo: `^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,50}$`.

### ¿Cómo cambio la contraseña para que acepte entre 3 y 12 caracteres?

Se reemplaza la condición actual de `js/formularios.js`, que exige mínimo 8 caracteres, por una comprobación de mínimo y máximo:

```javascript
if (valor.length < 3 || valor.length > 12) {
	mostrarError(campoPassword, 'La contraseña debe tener entre 3 y 12 caracteres.');
	return false;
}
```

También se actualiza el campo de `registro.html` para mantener la validación del navegador:

```html
<input type="password" id="password" minlength="3" maxlength="12">
```

Si se mantiene la regla de seguridad del proyecto, además se comprueba que contenga al menos una letra y un número. La misma regla debe revisarse en `js/administracion.js` para que el inicio de sesión no use un límite diferente al registro.

### ¿Cómo valido el correo para que también sea posible usar `@simio`?

La regla se encuentra en `REGEX_EMAIL_GMAIL_HOTMAIL`, definida en `js/formularios.js` y `js/administracion.js`. Se cambia para incluir el dominio solicitado:

```javascript
const REGEX_EMAIL = /^[^\s@]+@(gmail|hotmail|simio)\.[a-z]{2,}$/i;
```

Después se usa `REGEX_EMAIL.test(correo)` en la validación. Si la intención es aceptar exactamente correos terminados en `@simio` sin extensión, la expresión sería diferente:

```javascript
const REGEX_EMAIL_SIMIO = /^[^\s@]+@simio$/i;
```

El cambio debe hacerse en los dos módulos y también en los mensajes de error para que no sigan diciendo que solo se aceptan Gmail y Hotmail. Para un dominio de correo real normalmente se conserva una extensión, como `.com`.

### ¿Cómo agrego un cuarto producto si antes había tres?

Se copia una tarjeta `.producto-card` en `productos.html` y se cambian todos sus datos: `data-id`, nombre, precio, categoría, stock, `data-img`, descripción y la imagen. El nuevo `data-id` debe ser único para que el carrito no lo confunda con otro producto.

```html
<article class="cart-card producto-card" data-categoria="frutas"
	data-precio="1100" data-nombre="Peras"
	data-img="img/peras.jpg">
	<img src="img/peras.jpg" alt="Peras frescas">
	<h3 class="serif">Peras frescas</h3>
	<p class="unit-price">$1.100 CLP / kg</p>
	<button class="btn-checkout btn-agregar" data-id="FR004">Añadir</button>
</article>
```

También se agrega la imagen a `img/` y se verifica que la ruta exista. `js/formularios.js` detecta la tarjeta y `js/carrito.js` usa el ID para agregarla al carrito. Actualmente el catálogo principal tiene más de cuatro tarjetas; si la pregunta se refiere a los productos destacados de `index.html`, se agrega una cuarta tarjeta con un `data-id` distinto.

### ¿Cómo agrego un código de Copilot a VS Code?

Si la pregunta se refiere a GitHub Copilot, en VS Code se abre la vista de extensiones, se busca `GitHub Copilot`, se instala la extensión oficial y se inicia sesión con una cuenta de GitHub que tenga acceso a Copilot. Luego se puede abrir el archivo del proyecto y aceptar las sugerencias del editor.

Si se refiere a agregar código propio al proyecto, se crea o abre el archivo correspondiente, se escribe el código dentro del bloque adecuado y se conecta desde HTML con `script src`, desde CSS con `link rel="stylesheet"` o desde JavaScript con la función de inicialización correspondiente. No se debe pegar código sin comprobar que usa los mismos IDs y clases que el HTML.

### ¿Cómo muevo un texto al centro?

Para centrar horizontalmente el texto se usa `text-align: center` en el selector del elemento:

```css
.titulo-seccion {
	text-align: center;
}
```

Si se quiere centrar un bloque completo, se puede usar un ancho y márgenes automáticos:

```css
.bloque {
	max-width: 1100px;
	margin-left: auto;
	margin-right: auto;
}
```

Para centrar elementos en ambos ejes dentro de un contenedor se usa Flexbox:

```css
.contenedor {
	display: flex;
	justify-content: center;
	align-items: center;
}
```

La propiedad se coloca en el elemento que controla la posición, no necesariamente en el texto que se desea mover.

### ¿Cómo cambio el color de un botón?

Los botones comunes usan variables definidas en `css/variables.css` y aplicadas desde `css/buttons.css`. Para cambiar el color normal y el color al pasar el mouse:

```css
:root {
	--primary-green: #2B7A4B;
	--primary-hover: #215E39;
}
```

También se puede cambiar un botón específico mediante una clase propia:

```css
.btn-agregar {
	background: #D97706;
}

.btn-agregar:hover {
	background: #B45309;
}
```

Es preferible modificar las variables cuando el cambio debe aplicarse a todo el sitio y usar una clase cuando solo debe cambiar un botón.

### ¿Cómo cambio el color de una letra?

Se usa la propiedad `color` en el selector del texto. Los colores generales del proyecto están en `css/variables.css`:

```css
.subtitulo {
	color: #2F4F3A;
}
```

Si el color se repite en varias páginas, se crea una variable, por ejemplo `--text-accent`, y se aplica con `color: var(--text-accent)`. Esto permite cambiarlo una sola vez y mantener consistencia visual.

### ¿Cómo separo botones que están muy juntos?

Si los botones están dentro de un contenedor Flexbox, se agrega `gap`, que crea separación uniforme sin agregar márgenes manuales a cada botón:

```css
.grupo-botones {
	display: flex;
	gap: 0.75rem;
	flex-wrap: wrap;
}
```

En el catálogo, `.producto-grid` ya usa `gap: 1.2rem` para separar las tarjetas. Si se necesita separar los botones dentro de una tarjeta, se crea un contenedor para ellos y se aplica la misma regla. `margin` sirve para una separación puntual, mientras que `gap` es más claro cuando se distribuyen varios elementos.

## Preguntas adicionales para la presentación

### ¿Qué ocurre si recargo la página o cierro el navegador?

Los datos principales se guardan en `localStorage`, por lo que permanecen después de recargar o cerrar el navegador en el mismo dispositivo. El carrito usa `hh_carrito`, la sesión usa `sesion_activa`, los usuarios usan `usuarios_huerto` y los productos administrados usan `productos_huerto`. No es una base de datos real ni sincroniza información entre dispositivos.

### ¿Por qué se usa `localStorage` y no variables normales?

Una variable normal se pierde al recargar la página. `localStorage` permite conservar datos como el carrito, la sesión y los usuarios entre páginas. Como solo guarda texto, los objetos y arreglos se convierten con `JSON.stringify()` y se recuperan con `JSON.parse()`.

### ¿Cómo se protege una página de administración?

`js/administracion.js` revisa `sesion_activa` en `initAdminGuard()`. Si no existe una sesión o el valor de `rol` no es `admin`, muestra un mensaje y devuelve al usuario a `login.html`. Esta protección es del lado del cliente y sirve para la demostración; en una aplicación real también debe existir autorización en el servidor.

### ¿Cómo se diferencia un cliente de un administrador?

Cada usuario guardado tiene una propiedad `rol`, cuyo valor puede ser `cliente` o `admin`. Después del inicio de sesión, el código redirige al administrador a `admin-usuarios.html` y al cliente a `index.html`. Además, cuando el rol es `admin`, la navegación muestra solo Dashboard, Usuarios y Productos.

### ¿Cómo funciona el botón Ver detalles?

Cada tarjeta del catálogo tiene un `data-id`, por ejemplo `FR001`. `js/datos-productos.js` lee ese valor y navega a `detalle-producto.html?id=FR001`. En la página de detalle, `URLSearchParams` obtiene el ID y busca el producto correspondiente para rellenar nombre, precio, imagen, stock y descripción.

### ¿Qué pasa si entro a `detalle-producto.html` sin un ID válido?

La función `getProduct()` busca el ID recibido y, si no encuentra coincidencia, usa el primer producto como respaldo. Así la plantilla no queda vacía, aunque lo correcto es acceder desde una tarjeta válida del catálogo.

### ¿Por qué algunos módulos se cargan antes que otros?

El orden de los scripts es importante. Primero se carga `inicializacion.js`, que crea `window.HuertoHogar`; después se cargan los módulos de productos, carrito, formularios y administración; finalmente `app.js` espera a `DOMContentLoaded` y ejecuta las funciones disponibles. Si se cambia el orden, una función podría ejecutarse antes de que exista.

### ¿Cómo se agrega una funcionalidad sin romper las otras páginas?

Se crea una función de inicialización y se comprueba si el elemento existe antes de agregar listeners. Por ejemplo, `initRegisterForm()` termina si no encuentra `#form-registro`. Esto permite que `formularios.js` esté conectado en varias páginas sin intentar manipular elementos que pertenecen a otra.

### ¿Cómo se actualiza un producto desde el panel admin?

La tabla de `admin-productos.html` se construye desde `productos_huerto`. El botón Editar envía el ID en la URL a `admin-editar-producto.html?id=...`; el formulario carga ese producto, actualiza nombre, categoría, precio, stock o imagen y vuelve a guardar el arreglo en `localStorage`.

### ¿Qué diferencia hay entre `id`, `class` y `data-*`?

`id` identifica un elemento único, como `grid-productos`. `class` agrupa elementos que comparten estilos o comportamiento, como `.producto-card`. Los atributos `data-*` almacenan información propia de cada elemento, como `data-id`, `data-precio` y `data-img`, que JavaScript lee mediante `element.dataset`.

### ¿Cómo se evita que un dato del usuario se interprete como HTML?

Cuando se inserta texto controlado por el usuario, se debe usar `textContent` o la función `escaparHTML()` de `js/inicializacion.js`. Insertar directamente datos externos con `innerHTML` puede permitir que se interpreten etiquetas o scripts. En una aplicación real también se deben validar y escapar los datos en el servidor.

### ¿Qué reviso si una página aparece sin estilos o sin funcionalidad?

Primero se revisa que las rutas de `<link rel="stylesheet">` y `<script src="...">` existan. Después se confirma que los IDs y clases usados por JavaScript coincidan con los del HTML y se abre la consola del navegador para buscar errores. En este proyecto los nombres activos son `reset.css`, `inicializacion.js`, `carrito.js`, `formularios.js`, `datos-productos.js` y `administracion.js`.

### ¿Qué diferencia hay entre un error de HTML, CSS y JavaScript?

Un error de HTML suele ser una etiqueta mal cerrada o un ID incorrecto. Un error de CSS aparece cuando una regla está mal escrita o apunta a un selector que no existe. Un error de JavaScript ocurre cuando una función, variable o elemento no existe. Se revisa la consola del navegador y los diagnósticos de VS Code para localizar el archivo responsable.

### ¿Cómo se comprueba que el formulario no se envíe con datos inválidos?

El evento `submit` usa `event.preventDefault()` para detener el envío automático. Luego ejecuta las validaciones de nombre, correo, contraseña, confirmación y términos. Solo si todas devuelven `true` se guarda el usuario en `usuarios_huerto` y se redirige al login.

### ¿Qué se puede mejorar en una versión real?

Se debería usar un backend con base de datos, almacenar contraseñas cifradas, validar permisos en el servidor, conectar un medio de pago real, procesar el formulario de contacto y agregar pruebas automatizadas. El proyecto actual es una demostración frontend y por eso usa `localStorage` y datos simulados.

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
