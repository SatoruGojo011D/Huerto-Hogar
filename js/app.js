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
        const contenedor = input.closest('.form-group') || input.parentElement;
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
        const contenedor = input.closest('.form-group') || input.parentElement;
        if (!contenedor) return;
        const errorEl = contenedor.querySelector('.mensaje-error');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }
    }

    // Expresiones regulares reutilizadas en varios formularios
    const REGEX_EMAIL_GMAIL_HOTMAIL = /^[^\s@]+@(gmail|hotmail)\.[a-z]{2,}$/i;
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
            if (!REGEX_EMAIL_GMAIL_HOTMAIL.test(valor)) {
                mostrarError(campoEmail, 'El correo debe ser dominio @gmail o @hotmail (ej: usuario@gmail.com).');
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

        campoNombre.addEventListener('blur', validarNombre);
        campoEmail.addEventListener('blur', validarEmail);
        campoPassword.addEventListener('input', validarPassword);
        campoConfirmPassword.addEventListener('input', validarConfirmPassword);
        campoTerminos.addEventListener('change', validarTerminos);

        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombreOk = validarNombre();
            const emailOk = validarEmail();
            const passwordOk = validarPassword();
            const confirmOk = validarConfirmPassword();
            const terminosOk = validarTerminos();

            const formularioValido = nombreOk && emailOk && passwordOk && confirmOk && terminosOk;

            if (!formularioValido) {
                const primerError = formRegistro.querySelector('.campo-invalido');
                if (primerError) primerError.focus();
                return;
            }

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

        const REGEX_PEDIDO = /^HH-\d{4,5}$/i;

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

        formFiltros.addEventListener('submit', (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
        formFiltros.addEventListener('change', aplicarFiltros);
        if (buscadorHeader) buscadorHeader.addEventListener('input', aplicarFiltros);

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
                const direccion = boton.getAttribute('data-direccion');
                mapaTiendas.src = `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

                botonesCiudad.forEach(b => b.classList.remove('activo'));
                boton.classList.add('activo');

                if (textoDireccionActual) {
                    const nombreLocal = boton.getAttribute('data-nombre') || direccion;
                    textoDireccionActual.textContent = `Mostrando: ${nombreLocal}`;
                }
            });
        });
    }


    /* ==================================================================
       7. INICIO DE SESIÓN Y GESTIÓN DE USUARIOS (MÓDULO ADMIN)
       ================================================================== */

  // 7.1 Inicialización de Base de Datos local simulada (Asegurada)
let usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];

// Verificar si existe el administrador piloto
const existeAdmin = usuariosGuardados.some(u => u.correo.toLowerCase() === 'admin@gmail.com');

if (!existeAdmin) {
    const usuariosIniciales = [
        { id: 1, nombre: "Administrador Jefe", correo: "admin@gmail.com", contrasena: "Admin123!", telefono: "987654321", direccion: "Sede Central", rol: "admin" },
        { id: 2, nombre: "Juan Pérez", correo: "cliente@hotmail.com", contrasena: "Cliente123!", telefono: "912345678", direccion: "Av. Las Flores 123", rol: "cliente" }
    ];
    
    // Si la lista estaba vacía, se cargan ambos; si no, se agrega el admin al inicio
    if (usuariosGuardados.length === 0) {
        usuariosGuardados = usuariosIniciales;
    } else {
        usuariosGuardados.unshift(usuariosIniciales[0]);
    }
    
    localStorage.setItem('usuarios_huerto', JSON.stringify(usuariosGuardados));
}
    // 7.2 Lógica de Iniciar Sesión (login.html)
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const mensajeError = document.getElementById('mensaje-error');

            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (mensajeError) {
                mensajeError.textContent = '';
                mensajeError.style.color = 'red';
            }

            // Validar correo Gmail/Hotmail
            if (!REGEX_EMAIL_GMAIL_HOTMAIL.test(email)) {
                if (mensajeError) mensajeError.textContent = 'Ingresa un correo válido (@gmail.com o @hotmail.com).';
                return;
            }

            if (password.length < 8) {
                if (mensajeError) mensajeError.textContent = 'La contraseña debe tener al menos 8 caracteres.';
                return;
            }

            const usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];
            const usuarioValido = usuarios.find(u => u.correo.toLowerCase() === email.toLowerCase() && u.contrasena === password);

            if (usuarioValido) {
                localStorage.setItem('sesion_activa', JSON.stringify(usuarioValido));

                if (mensajeError) {
                    mensajeError.style.color = '#2e7d32';
                    mensajeError.textContent = '¡Ingreso exitoso! Redirigiendo...';
                }

                setTimeout(() => {
                    if (usuarioValido.rol === 'admin') {
                        window.location.href = 'admin-usuarios.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                if (mensajeError) mensajeError.textContent = 'Correo o contraseña incorrectos.';
            }
        });
    }

    // 7.3 Protección de Rutas para Administradores (admin-*.html)
    const esPaginaAdmin = window.location.pathname.includes('admin-');
    if (esPaginaAdmin) {
        const sesionActiva = JSON.parse(localStorage.getItem('sesion_activa'));
        if (!sesionActiva || sesionActiva.rol !== 'admin') {
            alert('Acceso restringido: Se requieren permisos de administrador.');
            window.location.href = 'login.html';
            return;
        }
    }

    // 7.4 Cargar Usuarios en Tabla (admin-usuarios.html)
    const cuerpoTabla = document.getElementById('cuerpo-tabla-usuarios');
    if (cuerpoTabla) {
        const usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];
        cuerpoTabla.innerHTML = '';

        usuarios.forEach(u => {
            const fila = document.createElement('tr');
            fila.style.borderBottom = '1px solid #eee';
            fila.innerHTML = `
                <td style="padding: 0.8rem;">${u.id}</td>
                <td style="padding: 0.8rem; font-weight: 600;">${u.nombre}</td>
                <td style="padding: 0.8rem;">${u.correo}</td>
                <td style="padding: 0.8rem;"><span style="background: #e8f5e9; color: #2e7d32; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${u.rol}</span></td>
                <td style="padding: 0.8rem; text-align: center;">
                    <a href="admin-editar-usuario.html?id=${u.id}" style="color: var(--primary-green); font-weight: 600; text-decoration: none;">Editar</a>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });
    }

    // 7.5 Crear Nuevo Usuario (admin-nuevo-usuario.html)
    const formNuevoUsuario = document.getElementById('form-nuevo-usuario');
    if (formNuevoUsuario) {
        formNuevoUsuario.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nuevo-nombre').value.trim();
            const email = document.getElementById('nuevo-email').value.trim();
            const password = document.getElementById('nuevo-password').value;
            const telefono = document.getElementById('nuevo-telefono').value.trim();
            const direccion = document.getElementById('nuevo-direccion').value.trim();
            const rol = document.getElementById('nuevo-rol').value;
            const mensaje = document.getElementById('mensaje-error-nuevo');

            if (mensaje) {
                mensaje.textContent = '';
                mensaje.style.color = 'red';
            }

            if (!REGEX_EMAIL_GMAIL_HOTMAIL.test(email)) {
                if (mensaje) mensaje.textContent = 'El correo debe terminar en @gmail.com o @hotmail.com';
                return;
            }

            let usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];

            if (usuarios.some(u => u.correo.toLowerCase() === email.toLowerCase())) {
                if (mensaje) mensaje.textContent = 'El correo ya se encuentra registrado.';
                return;
            }

            const nuevoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
            const nuevoUsuario = { id: nuevoId, nombre, correo: email, contrasena: password, telefono, direccion, rol };

            usuarios.push(nuevoUsuario);
            localStorage.setItem('usuarios_huerto', JSON.stringify(usuarios));

            if (mensaje) {
                mensaje.style.color = '#2e7d32';
                mensaje.textContent = '¡Usuario registrado exitosamente!';
            }

            setTimeout(() => {
                window.location.href = 'admin-usuarios.html';
            }, 1000);
        });
    }

    // 7.6 Editar y Eliminar Usuario (admin-editar-usuario.html)
    const formEditarUsuario = document.getElementById('form-editar-usuario');
    if (formEditarUsuario) {
        const urlParams = new URLSearchParams(window.location.search);
        const idUsuario = parseInt(urlParams.get('id'));

        let usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];
        const usuarioActual = usuarios.find(u => u.id === idUsuario);
        const mensaje = document.getElementById('mensaje-error-editar');

        if (usuarioActual) {
            document.getElementById('editar-nombre').value = usuarioActual.nombre;
            document.getElementById('editar-email').value = usuarioActual.correo;
            document.getElementById('editar-telefono').value = usuarioActual.telefono || '';
            document.getElementById('editar-direccion').value = usuarioActual.direccion || '';
            document.getElementById('editar-rol').value = usuarioActual.rol;
        } else {
            if (mensaje) mensaje.textContent = 'Usuario no encontrado.';
        }

        formEditarUsuario.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('editar-nombre').value.trim();
            const email = document.getElementById('editar-email').value.trim();
            const passwordInput = document.getElementById('editar-password').value;
            const telefono = document.getElementById('editar-telefono').value.trim();
            const direccion = document.getElementById('editar-direccion').value.trim();
            const rol = document.getElementById('editar-rol').value;

            if (mensaje) {
                mensaje.textContent = '';
                mensaje.style.color = 'red';
            }

            if (!REGEX_EMAIL_GMAIL_HOTMAIL.test(email)) {
                if (mensaje) mensaje.textContent = 'El correo debe ser un dominio @gmail o @hotmail válido.';
                return;
            }

            if (usuarios.some(u => u.correo.toLowerCase() === email.toLowerCase() && u.id !== idUsuario)) {
                if (mensaje) mensaje.textContent = 'El correo pertenece a otro usuario registrado.';
                return;
            }

            const index = usuarios.findIndex(u => u.id === idUsuario);
            if (index !== -1) {
                usuarios[index].nombre = nombre;
                usuarios[index].correo = email;
                usuarios[index].telefono = telefono;
                usuarios[index].direccion = direccion;
                usuarios[index].rol = rol;

                if (passwordInput !== '') {
                    usuarios[index].contrasena = passwordInput;
                }

                localStorage.setItem('usuarios_huerto', JSON.stringify(usuarios));

                if (mensaje) {
                    mensaje.style.color = '#2e7d32';
                    mensaje.textContent = '¡Usuario actualizado con éxito!';
                }

                setTimeout(() => {
                    window.location.href = 'admin-usuarios.html';
                }, 1000);
            }
        });

        // Evento para Eliminar Usuario
        const btnEliminar = document.getElementById('btn-eliminar-usuario');
        if (btnEliminar) {
            btnEliminar.addEventListener('click', () => {
                if (!usuarioActual) return;

                const confirmacion = confirm(`¿Estás seguro de que deseas eliminar al usuario "${usuarioActual.nombre}"? esta acción no se puede deshacer.`);
                if (confirmacion) {
                    usuarios = usuarios.filter(u => u.id !== idUsuario);
                    localStorage.setItem('usuarios_huerto', JSON.stringify(usuarios));
                    alert('Usuario eliminado correctamente.');
                    window.location.href = 'admin-usuarios.html';
                }
            });
        }
    }

});