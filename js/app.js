/* ======================================================================
   HUERTO HOGAR - app.js
   Este archivo se carga en TODAS las páginas del sitio.
   Cada bloque revisa primero si los elementos que necesita existen en
   la página actual (con "if (elemento)") antes de usarlos, así un solo
   archivo JS puede servir para carrito, registro, seguimiento y catálogo
   sin generar errores en las páginas donde esos elementos no existen.
   ====================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==================================================================
       1. CARRITO DE COMPRAS (carrito.html)
       ================================================================== */
    const shippingCost = 2990;
    const freeShippingGoal = 25000;

    const cartCounter = document.getElementById('cart-counter');
    const totalCount = document.getElementById('total-count');
    const subtotalText = document.getElementById('subtotal-text');
    const totalText = document.getElementById('total-text');
    const co2Value = document.getElementById('co2-value');
    const freeShippingLbl = document.getElementById('free-shipping-lbl');

    function calculateCart() {
        let itemsQty = 0;
        let subtotal = 0;

        document.querySelectorAll('.cart-card').forEach(card => {
            const qtyEl = card.querySelector('.qty-val');
            if (!qtyEl) return; // tarjeta de catálogo, no de carrito

            const qty = parseInt(qtyEl.textContent);
            const unitPrice = parseInt(card.getAttribute('data-unit-price'));
            const cardSubtotal = qty * unitPrice;

            const itemTotalEl = card.querySelector('.item-total-price');
            if (itemTotalEl) itemTotalEl.textContent = `$${cardSubtotal.toLocaleString('es-CL')} CLP`;

            itemsQty += qty;
            subtotal += cardSubtotal;
        });

        if (cartCounter) cartCounter.textContent = itemsQty;
        if (totalCount) totalCount.textContent = itemsQty;
        if (subtotalText) subtotalText.textContent = `$${subtotal.toLocaleString('es-CL')} CLP`;

        const grandTotal = subtotal > 0 ? subtotal + shippingCost : 0;
        if (totalText) totalText.textContent = `$${grandTotal.toLocaleString('es-CL')} CLP`;

        if (co2Value) {
            const co2 = (itemsQty * 0.416).toFixed(1);
            co2Value.textContent = `${co2} kg CO₂e`;
        }

        if (freeShippingLbl) {
            const missing = freeShippingGoal - subtotal;
            freeShippingLbl.textContent = missing > 0
                ? `Suma $${missing.toLocaleString('es-CL')} CLP más para despacho gratis.`
                : `¡Tu envío es gratis!`;
        }
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-plus')) {
            const qtyVal = e.target.previousElementSibling;
            qtyVal.textContent = parseInt(qtyVal.textContent) + 1;
            calculateCart();
        }

        if (e.target.classList.contains('btn-minus')) {
            const qtyVal = e.target.nextElementSibling;
            const current = parseInt(qtyVal.textContent);
            if (current > 1) {
                qtyVal.textContent = current - 1;
                calculateCart();
            }
        }

        if (e.target.classList.contains('remove-btn')) {
            const card = e.target.closest('.cart-card');
            card.remove();
            calculateCart();
        }
    });

    calculateCart();

    /* Contador del carrito visible en el header (persistido con localStorage
       para que el número se mantenga al navegar entre páginas). */
    function actualizarBadgeCarrito() {
        const cantidad = parseInt(localStorage.getItem('hh_carrito_cantidad') || '0');
        document.querySelectorAll('#cart-counter').forEach(el => el.textContent = cantidad);
    }
    actualizarBadgeCarrito();


    /* ==================================================================
       2. HELPERS DE VALIDACIÓN
       Funciones reutilizables para mostrar/ocultar errores en cualquier
       formulario del sitio, con mensajes personalizados por campo.
       ================================================================== */

    // Muestra un mensaje de error debajo del campo y lo marca como inválido
    function mostrarError(input, mensaje) {
        input.classList.add('campo-invalido');
        input.classList.remove('campo-valido');
        const contenedor = input.closest('.form-group');
        if (!contenedor) return;
        const errorEl = contenedor.querySelector('.mensaje-error');
        if (errorEl) {
            errorEl.textContent = mensaje;
            errorEl.classList.add('visible');
        }
    }

    // Limpia el error y marca el campo como válido
    function limpiarError(input) {
        input.classList.remove('campo-invalido');
        input.classList.add('campo-valido');
        const contenedor = input.closest('.form-group');
        if (!contenedor) return;
        const errorEl = contenedor.querySelector('.mensaje-error');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }
    }

    // Expresiones regulares reutilizadas en varios formularios
    const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const REGEX_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/;


    /* ==================================================================
       3. VALIDACIÓN DEL FORMULARIO DE REGISTRO (registro.html)
       ================================================================== */
    const formRegistro = document.getElementById('form-registro');

    if (formRegistro) {
        const campoNombre = document.getElementById('nombre');
        const campoEmail = document.getElementById('email');
        const campoPassword = document.getElementById('password');
        const campoConfirmPassword = document.getElementById('confirm-password');
        const campoTerminos = document.getElementById('terminos');
        const avisoExito = document.getElementById('aviso-exito-registro');

        // Valida un campo individual y devuelve true/false.
        // Se usa tanto en submit como en tiempo real (evento "input"/"blur").
        function validarNombre() {
            const valor = campoNombre.value.trim();
            if (valor === '') {
                mostrarError(campoNombre, 'El nombre completo es obligatorio.');
                return false;
            }
            if (!REGEX_SOLO_LETRAS.test(valor)) {
                mostrarError(campoNombre, 'Ingresa solo letras, mínimo 3 caracteres (ej: Juan Pérez).');
                return false;
            }
            limpiarError(campoNombre);
            return true;
        }

        function validarEmail() {
            const valor = campoEmail.value.trim();
            if (valor === '') {
                mostrarError(campoEmail, 'El correo electrónico es obligatorio.');
                return false;
            }
            if (!REGEX_EMAIL.test(valor)) {
                mostrarError(campoEmail, 'Ingresa un correo válido, ej: nombre@correo.com');
                return false;
            }
            limpiarError(campoEmail);
            return true;
        }

        function validarPassword() {
            const valor = campoPassword.value;
            if (valor.length < 8) {
                mostrarError(campoPassword, 'La contraseña debe tener al menos 8 caracteres.');
                return false;
            }
            if (!/[0-9]/.test(valor) || !/[A-Za-z]/.test(valor)) {
                mostrarError(campoPassword, 'Combina letras y números para una contraseña más segura.');
                return false;
            }
            limpiarError(campoPassword);
            return true;
        }

        function validarConfirmPassword() {
            if (campoConfirmPassword.value !== campoPassword.value || campoConfirmPassword.value === '') {
                mostrarError(campoConfirmPassword, 'Las contraseñas no coinciden.');
                return false;
            }
            limpiarError(campoConfirmPassword);
            return true;
        }

        function validarTerminos() {
            const contenedor = campoTerminos.closest('.form-group') || campoTerminos.parentElement;
            const errorEl = contenedor.querySelector('.mensaje-error');
            if (!campoTerminos.checked) {
                if (errorEl) errorEl.classList.add('visible');
                return false;
            }
            if (errorEl) errorEl.classList.remove('visible');
            return true;
        }

        // Validación en tiempo real: apenas el usuario sale del campo (blur)
        // o escribe (input), se revisa y se muestra sugerencia inmediata.
        campoNombre.addEventListener('blur', validarNombre);
        campoEmail.addEventListener('blur', validarEmail);
        campoPassword.addEventListener('input', validarPassword);
        campoConfirmPassword.addEventListener('input', validarConfirmPassword);
        campoTerminos.addEventListener('change', validarTerminos);

        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault(); // evitamos el envío nativo para controlar todo por JS

            // Se ejecutan todas las validaciones (así se marcan todos los
            // campos con error de una vez, no solo el primero que falla).
            const nombreOk = validarNombre();
            const emailOk = validarEmail();
            const passwordOk = validarPassword();
            const confirmOk = validarConfirmPassword();
            const terminosOk = validarTerminos();

            const formularioValido = nombreOk && emailOk && passwordOk && confirmOk && terminosOk;

            if (!formularioValido) {
                // Lleva el scroll al primer campo con error para que el usuario lo vea
                const primerError = formRegistro.querySelector('.campo-invalido');
                if (primerError) primerError.focus();
                return;
            }

            // Si todo es válido: mostramos aviso de éxito y simulamos
            // la creación de cuenta redirigiendo a login.html
            if (avisoExito) avisoExito.classList.add('visible');
            formRegistro.reset();
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }


    /* ==================================================================
       4. VALIDACIÓN Y SIMULACIÓN DE SEGUIMIENTO (seguimiento.html)
       ================================================================== */
    const formFecha = document.getElementById('form-fecha-entrega');
    const formRastreo = document.getElementById('form-rastreo');

    if (formFecha) {
        const campoFecha = document.getElementById('fecha-entrega');
        const avisoFecha = document.getElementById('aviso-fecha');

        // No se permite elegir una fecha anterior a hoy
        const hoy = new Date().toISOString().split('T')[0];
        campoFecha.setAttribute('min', hoy);

        formFecha.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!campoFecha.value) {
                mostrarError(campoFecha, 'Selecciona una fecha de entrega.');
                return;
            }
            if (campoFecha.value < hoy) {
                mostrarError(campoFecha, 'La fecha no puede ser anterior a hoy.');
                return;
            }
            limpiarError(campoFecha);

            if (avisoFecha) {
                avisoFecha.textContent = `Fecha de entrega guardada: ${campoFecha.value}`;
                avisoFecha.classList.add('visible');
            }
        });
    }

    if (formRastreo) {
        const campoPedido = document.getElementById('codigo-pedido');
        const timeline = document.getElementById('linea-tiempo');

        // Formato esperado de código de pedido: HH- seguido de 4 o 5 números
        const REGEX_PEDIDO = /^HH-\d{4,5}$/i;

        // "Base de datos" simulada de pedidos, para que la demo en vivo
        // se sienta real con distintos estados según el código ingresado.
        const pedidosSimulados = {
            'HH-10234': 1, // Confirmado
            'HH-55321': 2, // En Preparación
            'HH-98765': 3, // En Camino
            'HH-40001': 4  // Entregado
        };

        function activarPasosHasta(pasoFinal) {
            for (let i = 1; i <= 4; i++) {
                const paso = document.getElementById(`paso-${i}`);
                if (!paso) continue;
                paso.classList.toggle('activo', i <= pasoFinal);
            }
        }

        formRastreo.addEventListener('submit', (e) => {
            e.preventDefault();
            const codigo = campoPedido.value.trim().toUpperCase();

            if (codigo === '') {
                mostrarError(campoPedido, 'Ingresa tu número de pedido.');
                return;
            }
            if (!REGEX_PEDIDO.test(codigo)) {
                mostrarError(campoPedido, 'Formato inválido. Debe ser como HH-98765.');
                return;
            }

            limpiarError(campoPedido);
            timeline.style.opacity = '1';
            timeline.style.pointerEvents = 'auto';

            // Si el código no está en la simulación, igual mostramos un
            // estado por defecto ("En Camino") para no bloquear la demo.
            const paso = pedidosSimulados[codigo] || 3;
            activarPasosHasta(paso);
        });
    }


    /* ==================================================================
       5. FILTROS DEL CATÁLOGO (productos.html)
       ================================================================== */
    const formFiltros = document.getElementById('form-filtros');
    const gridProductos = document.getElementById('grid-productos');
    const buscadorHeader = document.querySelector('.search-container input, .search-bar input');

    if (formFiltros && gridProductos) {
        const tarjetas = Array.from(gridProductos.querySelectorAll('.producto-card'));

        function aplicarFiltros() {
            const categoriasMarcadas = Array.from(
                formFiltros.querySelectorAll('input[name="categoria"]:checked')
            ).map(chk => chk.value);

            const rangosMarcados = Array.from(
                formFiltros.querySelectorAll('input[name="precio"]:checked')
            ).map(chk => chk.value);

            const textoBusqueda = buscadorHeader ? buscadorHeader.value.trim().toLowerCase() : '';

            let visibles = 0;

            tarjetas.forEach(card => {
                const categoria = card.getAttribute('data-categoria');
                const precio = parseInt(card.getAttribute('data-precio'));
                const nombre = card.getAttribute('data-nombre').toLowerCase();

                const coincideCategoria = categoriasMarcadas.length === 0 || categoriasMarcadas.includes(categoria);

                const coincidePrecio = rangosMarcados.length === 0 || rangosMarcados.some(rango => {
                    if (rango === 'bajo') return precio < 1000;
                    if (rango === 'medio') return precio >= 1000 && precio <= 3000;
                    if (rango === 'alto') return precio > 3000;
                    return true;
                });

                const coincideBusqueda = textoBusqueda === '' || nombre.includes(textoBusqueda);

                const visible = coincideCategoria && coincidePrecio && coincideBusqueda;
                card.style.display = visible ? '' : 'none';
                if (visible) visibles++;
            });

            const mensajeSinResultados = document.getElementById('sin-resultados');
            if (mensajeSinResultados) {
                mensajeSinResultados.style.display = visibles === 0 ? 'block' : 'none';
            }
        }

        // Filtra al enviar el formulario (botón "Filtrar") y también
        // en vivo apenas se marca/desmarca un checkbox.
        formFiltros.addEventListener('submit', (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
        formFiltros.addEventListener('change', aplicarFiltros);
        if (buscadorHeader) buscadorHeader.addEventListener('input', aplicarFiltros);

        // Agregar producto al carrito (simulado con localStorage: suma
        // la cantidad al contador del header en todas las páginas).
        gridProductos.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-agregar')) return;
            const actual = parseInt(localStorage.getItem('hh_carrito_cantidad') || '0');
            localStorage.setItem('hh_carrito_cantidad', actual + 1);
            actualizarBadgeCarrito();

            const boton = e.target;
            const textoOriginal = boton.textContent;
            boton.textContent = '✓ Añadido';
            setTimeout(() => { boton.textContent = textoOriginal; }, 900);
        });
    }


    /* ==================================================================
       6. MAPA DE UBICACIONES (nosotros.html)
       ================================================================== */
    const botonesCiudad = document.querySelectorAll('.btn-ciudad');
    const mapaTiendas = document.getElementById('mapa-tiendas');
    const textoDireccionActual = document.getElementById('direccion-actual');

    if (botonesCiudad.length && mapaTiendas) {
        botonesCiudad.forEach(boton => {
            boton.addEventListener('click', () => {
                // data-direccion trae la calle/número exacta del local (no
                // solo el nombre de la ciudad), así el mapa muestra un pin
                // en un punto concreto en vez de solo centrar la ciudad.
                // z=16 (zoom alto) para que el pin se vea de cerca.
                const direccion = boton.getAttribute('data-direccion');
                mapaTiendas.src = `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

                botonesCiudad.forEach(b => b.classList.remove('activo'));
                boton.classList.add('activo');

                // Actualiza el texto que confirma qué local se está mostrando
                if (textoDireccionActual) {
                    const nombreLocal = boton.getAttribute('data-nombre') || direccion;
                    textoDireccionActual.textContent = `Mostrando: ${nombreLocal}`;
                }
            });
        });
    }

});