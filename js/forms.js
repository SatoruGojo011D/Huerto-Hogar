/* Formularios: valida registro, seguimiento, filtros del catálogo y acciones de añadir. */
(function () {
    const REGEX_EMAIL_GMAIL_HOTMAIL = /^[^\s@]+@(gmail|hotmail)\.[a-z]{2,}$/i;
    const REGEX_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/;

    // Marca un campo inválido y muestra el mensaje asociado a su grupo.
    function mostrarError(input, mensaje) {
        if (!input) return;
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

    // Quita el error y marca el campo como válido.
    function limpiarError(input) {
        if (!input) return;
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

    // Controla registro, reglas de contraseña, términos y creación del usuario.
    function initRegisterForm() {
        const form = document.getElementById('form-registro');
        if (!form) return;

        const campoNombre = document.getElementById('nombre');
        const campoEmail = document.getElementById('email');
        const campoPassword = document.getElementById('password');
        const campoConfirmPassword = document.getElementById('confirm-password');
        const campoTerminos = document.getElementById('terminos');
        const avisoExito = document.getElementById('aviso-exito-registro');

        function validarNombre() {
            const valor = campoNombre.value.trim();
            if (!valor) {
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
            if (!valor) {
                mostrarError(campoEmail, 'El correo electrónico es obligatorio.');
                return false;
            }
            if (!REGEX_EMAIL_GMAIL_HOTMAIL.test(valor)) {
                mostrarError(campoEmail, 'El correo debe ser dominio @gmail o @hotmail.');
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
            if (!campoConfirmPassword.value || campoConfirmPassword.value !== campoPassword.value) {
                mostrarError(campoConfirmPassword, 'Las contraseñas no coinciden.');
                return false;
            }
            limpiarError(campoConfirmPassword);
            return true;
        }

        function validarTerminos() {
            const contenedor = campoTerminos.closest('.form-group') || campoTerminos.parentElement;
            const errorEl = contenedor ? contenedor.querySelector('.mensaje-error') : null;
            if (!campoTerminos.checked) {
                if (errorEl) errorEl.classList.add('visible');
                return false;
            }
            if (errorEl) errorEl.classList.remove('visible');
            return true;
        }

        if (campoNombre) campoNombre.addEventListener('blur', validarNombre);
        if (campoEmail) campoEmail.addEventListener('blur', validarEmail);
        if (campoPassword) campoPassword.addEventListener('input', validarPassword);
        if (campoConfirmPassword) campoConfirmPassword.addEventListener('input', validarConfirmPassword);
        if (campoTerminos) campoTerminos.addEventListener('change', validarTerminos);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombreOk = validarNombre();
            const emailOk = validarEmail();
            const passwordOk = validarPassword();
            const confirmOk = validarConfirmPassword();
            const terminosOk = validarTerminos();

            if (!(nombreOk && emailOk && passwordOk && confirmOk && terminosOk)) {
                const primerError = form.querySelector('.campo-invalido');
                if (primerError) primerError.focus();
                return;
            }

            let usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];
            const correoIngresado = campoEmail.value.trim().toLowerCase();
            const yaExiste = usuarios.some(u => u.correo.toLowerCase() === correoIngresado);

            if (yaExiste) {
                mostrarError(campoEmail, 'Este correo ya se encuentra registrado.');
                campoEmail.focus();
                return;
            }

            const nuevoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
            usuarios.push({
                id: nuevoId,
                nombre: campoNombre.value.trim(),
                correo: correoIngresado,
                contrasena: campoPassword.value,
                telefono: '',
                direccion: '',
                rol: 'cliente'
            });

            localStorage.setItem('usuarios_huerto', JSON.stringify(usuarios));
            if (avisoExito) avisoExito.classList.add('visible');
            form.reset();
            setTimeout(() => window.location.href = 'login.html', 1500);
        });
    }

    // Valida la fecha de entrega y simula la búsqueda del estado de un pedido.
    function initTrackingForms() {
        const formFecha = document.getElementById('form-fecha-entrega');
        const formRastreo = document.getElementById('form-rastreo');

        // Prefija el último pedido confirmado o el código recibido desde la boleta.
        if (formRastreo) {
            try {
                const ultimoPedido = JSON.parse(localStorage.getItem('hh_ultimo_pedido') || 'null');
                const codigoUrl = new URLSearchParams(window.location.search).get('codigo');
                const campoPedido = document.getElementById('codigo-pedido');
                if (campoPedido) campoPedido.value = codigoUrl || ultimoPedido?.code || '';
            } catch (error) {
                // Si el almacenamiento está dañado, el cliente aún puede escribir el código manualmente.
            }
        }

        if (formFecha) {
            const campoFecha = document.getElementById('fecha-entrega');
            const avisoFecha = document.getElementById('aviso-fecha');
            const hoy = new Date().toISOString().split('T')[0];
            if (campoFecha) campoFecha.setAttribute('min', hoy);

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
                'HH-10234': 1,
                'HH-55321': 2,
                'HH-98765': 3,
                'HH-40001': 4
            };

            function activarPasosHasta(pasoFinal) {
                for (let i = 1; i <= 4; i++) {
                    const paso = document.getElementById(`paso-${i}`);
                    if (paso) paso.classList.toggle('activo', i <= pasoFinal);
                }
            }

            formRastreo.addEventListener('submit', (e) => {
                e.preventDefault();
                const codigo = campoPedido.value.trim().toUpperCase();

                if (!codigo) {
                    mostrarError(campoPedido, 'Ingresa tu número de pedido.');
                    return;
                }
                if (!REGEX_PEDIDO.test(codigo)) {
                    mostrarError(campoPedido, 'Formato inválido. Debe ser como HH-98765.');
                    return;
                }

                limpiarError(campoPedido);
                if (timeline) {
                    timeline.style.opacity = '1';
                    timeline.style.pointerEvents = 'auto';
                }

                // Los pedidos reales guardados tienen prioridad sobre los ejemplos de demostración.
                let paso = pedidosSimulados[codigo] || 3;
                try {
                    const pedidos = JSON.parse(localStorage.getItem('hh_pedidos') || '[]');
                    const pedidoGuardado = pedidos.find(pedido => pedido.code === codigo);
                    if (pedidoGuardado) paso = pedidoGuardado.status || 1;
                } catch (error) {
                    // Se conserva el estado simulado si los pedidos guardados no son válidos.
                }
                activarPasosHasta(paso);
            });
        }
    }

    // Filtra las tarjetas por categoría/precio y conecta el botón Añadir.
    function initCatalogFilters() {
        const formFiltros = document.getElementById('form-filtros');
        const gridProductos = document.getElementById('grid-productos');
        const buscadorHeader = document.querySelector('.search-container input, .search-bar input');

        if (!gridProductos) return;

        const tarjetas = Array.from(gridProductos.querySelectorAll('.producto-card'));

        function aplicarFiltros() {
            const categoriasMarcadas = formFiltros
                ? Array.from(formFiltros.querySelectorAll('input[name="categoria"]:checked')).map(chk => chk.value)
                : [];
            const rangosMarcados = formFiltros
                ? Array.from(formFiltros.querySelectorAll('input[name="precio"]:checked')).map(chk => chk.value)
                : [];
            const textoBusqueda = buscadorHeader ? buscadorHeader.value.trim().toLowerCase() : '';

            let visibles = 0;

            tarjetas.forEach(card => {
                const categoria = card.getAttribute('data-categoria');
                const precio = parseInt(card.getAttribute('data-precio'), 10) || 0;
                const nombre = (card.getAttribute('data-nombre') || '').toLowerCase();

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

        if (formFiltros) {
            formFiltros.addEventListener('submit', (e) => {
                e.preventDefault();
                aplicarFiltros();
            });
        }

        if (buscadorHeader) buscadorHeader.addEventListener('input', aplicarFiltros);

        gridProductos.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-agregar')) return;

            const card = e.target.closest('.producto-card');
            if (!card) return;

            const item = {
                id: card.getAttribute('data-id') || card.getAttribute('data-nombre') || `prod-${Date.now()}`,
                nombre: card.getAttribute('data-nombre') || 'Producto',
                precio: Number(card.getAttribute('data-precio')) || 0,
                imagen: card.getAttribute('data-img') || 'img/manzanas-fuji.png',
                cantidad: 1
            };

            if (window.HuertoHogar && typeof window.HuertoHogar.addToCart === 'function') {
                window.HuertoHogar.addToCart(item);
            }

            const boton = e.target;
            const textoOriginal = boton.textContent;
            boton.textContent = '✓ Añadido';
            setTimeout(() => { boton.textContent = textoOriginal; }, 900);
        });

        document.querySelectorAll('.feature-btn').forEach(button => {
            button.classList.add('btn-agregar');
            const card = button.closest('.feature-card');
            if (card) {
                card.dataset.id = card.dataset.id || `home-${Math.random().toString(16).slice(2)}`;
                card.dataset.name = card.dataset.name || card.querySelector('h3')?.textContent || 'Producto';
                card.dataset.price = card.dataset.price || String((card.querySelector('.unit-price')?.textContent || '').replace(/[^\d]/g, '') || 0);
            }
        });
    }

    function initLocationsMap() {
        const botonesCiudad = document.querySelectorAll('.btn-ciudad');
        const mapaTiendas = document.getElementById('mapa-tiendas');
        const mapaGeneral = document.getElementById('mapa-general');
        const textoDireccionActual = document.getElementById('direccion-actual');

        if (botonesCiudad.length && mapaTiendas) {
            mapaTiendas.hidden = true;
            if (mapaGeneral) mapaGeneral.hidden = false;
            botonesCiudad.forEach(boton => {
                boton.addEventListener('click', () => {
                    const direccion = boton.getAttribute('data-direccion');
                    const consultaMapa = boton.getAttribute('data-mapa') || direccion;
                    mapaTiendas.src = `https://maps.google.com/maps?q=${encodeURIComponent(consultaMapa)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
                    mapaTiendas.hidden = false;
                    if (mapaGeneral) mapaGeneral.hidden = true;

                    botonesCiudad.forEach(b => b.classList.remove('activo'));
                    boton.classList.add('activo');

                    if (textoDireccionActual) {
                        const nombreLocal = boton.getAttribute('data-nombre') || direccion;
                        textoDireccionActual.textContent = `Mostrando: ${nombreLocal}`;
                    }
                });
            });
        }
    }

    window.HuertoHogar = window.HuertoHogar || {};
    window.HuertoHogar.initForms = function () {
        initRegisterForm();
        initTrackingForms();
        initCatalogFilters();
        initLocationsMap();
    };
})();
