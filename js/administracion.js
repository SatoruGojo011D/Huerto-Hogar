/* Administración y sesión: autenticación, perfil, protección admin y CRUD de usuarios/productos. */
(function () {
    const REGEX_EMAIL_GMAIL_HOTMAIL = /^[^\s@]+@(gmail|hotmail)\.[a-z]{2,}$/i;

    // Crea las cuentas iniciales de administrador y cliente si aún no existen.
    function ensureAdminSeed() {
        let usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];
        const existeAdmin = usuariosGuardados.some(u => u.correo.toLowerCase() === 'admin@gmail.com');

        if (!existeAdmin) {
            const usuariosIniciales = [
                { id: 1, nombre: 'Administrador Jefe', correo: 'admin@gmail.com', contrasena: 'Admin123!', telefono: '987654321', direccion: 'Sede Central', rol: 'admin' },
                { id: 2, nombre: 'Juan Pérez', correo: 'cliente@hotmail.com', contrasena: 'Cliente123!', telefono: '912345678', direccion: 'Av. Las Flores 123', rol: 'cliente' }
            ];

            if (usuariosGuardados.length === 0) {
                usuariosGuardados = usuariosIniciales;
            } else {
                usuariosGuardados.unshift(usuariosIniciales[0]);
            }

            localStorage.setItem('usuarios_huerto', JSON.stringify(usuariosGuardados));
        }
    }

    // Lee la sesión actual guardada después del inicio de sesión.
    function getUsuarioActivo() {
        try {
            const data = localStorage.getItem('sesion_activa');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            return null;
        }
    }

    // Elimina la sesión y devuelve al usuario a la pantalla de login.
    function cerrarSesion() {
        localStorage.removeItem('sesion_activa');
        window.location.href = 'login.html';
    }

    // Oculta Mi cuenta y muestra el nombre, datos, editar perfil y cerrar sesión.
    function initAuthUI() {
        const usuario = getUsuarioActivo();

        if (usuario && usuario.rol === 'admin') {
            document.querySelectorAll('header').forEach(header => {
                const navList = header.querySelector('nav ul');
                if (navList) {
                    navList.innerHTML = `
                        <li><a href="admin-dashboard.html">Dashboard</a></li>
                        <li><a href="admin-usuarios.html">Usuarios</a></li>
                        <li><a href="admin-productos.html">Productos</a></li>
                    `;
                }

                const brandLink = header.querySelector('.brand-logo');
                if (brandLink) brandLink.href = 'admin-dashboard.html';

                const cartLink = header.querySelector('.cart-icon-wrapper');
                if (cartLink) cartLink.remove();
            });
        }

        document.querySelectorAll('a[href="login.html"]').forEach(link => {
            if (usuario) {
                link.style.display = 'none';
            }
        });

        // El perfil solo debe aparecer cuando existe una sesión autenticada.
        document.querySelectorAll('a[href="perfil.html"]').forEach(link => {
            if (!usuario) link.style.display = 'none';
        });

        const headers = document.querySelectorAll('header');
        headers.forEach(header => {
            if (header.querySelector('[data-session-ui="true"]')) return;

            const wrapper = document.createElement('div');
            wrapper.setAttribute('data-session-ui', 'true');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.gap = '0.75rem';

            if (usuario) {
                const profileMenu = document.createElement('div');
                profileMenu.className = 'profile-menu';

                const profileButton = document.createElement('button');
                profileButton.type = 'button';
                profileButton.className = 'profile-menu__button';
                profileButton.textContent = usuario.nombre || 'Mi perfil';
                profileButton.setAttribute('aria-expanded', 'false');

                const profilePanel = document.createElement('div');
                profilePanel.className = 'profile-menu__panel';
                profilePanel.hidden = true;

                const title = document.createElement('strong');
                title.textContent = usuario.nombre || 'Usuario';
                const details = document.createElement('div');
                details.className = 'profile-menu__details';
                details.innerHTML = '<span class="profile-label">Correo</span><span class="profile-email"></span><span class="profile-label">Teléfono</span><span class="profile-phone"></span><span class="profile-label">Dirección</span><span class="profile-address"></span><span class="profile-label">Rol</span><span class="profile-role"></span>';
                details.querySelector('.profile-email').textContent = usuario.correo || 'No registrado';
                details.querySelector('.profile-phone').textContent = usuario.telefono || 'No registrado';
                details.querySelector('.profile-address').textContent = usuario.direccion || 'No registrada';
                details.querySelector('.profile-role').textContent = usuario.rol || 'cliente';

                const profileLink = document.createElement('a');
                profileLink.href = 'perfil.html';
                profileLink.textContent = 'Editar mi perfil';
                profileLink.className = 'profile-menu__link';

                const logoutBtn = document.createElement('button');
                logoutBtn.type = 'button';
                logoutBtn.textContent = 'Cerrar sesión';
                logoutBtn.className = 'profile-menu__logout';
                logoutBtn.addEventListener('click', cerrarSesion);

                profilePanel.append(title, details, profileLink, logoutBtn);
                profileButton.addEventListener('click', () => {
                    const isOpen = !profilePanel.hidden;
                    profilePanel.hidden = isOpen;
                    profileButton.setAttribute('aria-expanded', String(!isOpen));
                });

                profileMenu.append(profileButton, profilePanel);
                wrapper.appendChild(profileMenu);

                const cartLink = header.querySelector('.cart-icon-wrapper');
                const cartParent = cartLink ? cartLink.parentElement : null;
                if (cartLink && cartParent) {
                    cartParent.insertBefore(wrapper, cartLink);
                } else {
                    header.appendChild(wrapper);
                }
            }
        });

        document.addEventListener('click', (event) => {
            document.querySelectorAll('.profile-menu').forEach(menu => {
                if (!menu.contains(event.target)) {
                    const panel = menu.querySelector('.profile-menu__panel');
                    const button = menu.querySelector('.profile-menu__button');
                    if (panel) panel.hidden = true;
                    if (button) button.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Valida credenciales, guarda la sesión y redirige según el rol.
    function initLogin() {
        const formLogin = document.getElementById('form-login');
        if (!formLogin) return;

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
                    window.location.href = usuarioValido.rol === 'admin' ? 'admin-dashboard.html' : 'index.html';
                }, 1000);
            } else {
                if (mensajeError) mensajeError.textContent = 'Correo o contraseña incorrectos.';
            }
        });
    }

    // Impide que un cliente entre directamente a páginas administrativas.
    function initAdminGuard() {
        const esPaginaAdmin = window.location.pathname.includes('admin-');
        if (!esPaginaAdmin) return;

        let sesionActiva = null;
        try {
            sesionActiva = JSON.parse(localStorage.getItem('sesion_activa') || 'null');
        } catch (error) {
            localStorage.removeItem('sesion_activa');
        }
        if (!sesionActiva || sesionActiva.rol !== 'admin') {
            alert('Acceso restringido: Se requieren permisos de administrador.');
            window.location.href = 'login.html';
            return;
        }
    }

    // Dibuja la tabla de usuarios a partir de localStorage.
    function renderUsuariosTable() {
        const cuerpoTabla = document.getElementById('cuerpo-tabla-usuarios') || document.getElementById('cuerpo-tabla-usuarios-dashboard');
        if (!cuerpoTabla) return;

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
                    <div class="product-actions">
                        <button type="button" class="btn-action btn-edit" data-action="select-user" data-user-id="${u.id}" title="Ver y editar"><i class="fas fa-edit"></i></button>
                        <a href="admin-editar-usuario.html?id=${u.id}" class="btn-action btn-edit" title="Abrir edición completa" style="display: inline-flex; text-decoration: none; color: var(--primary-green);"><i class="fas fa-external-link-alt"></i></a>
                    </div>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });

        cuerpoTabla.querySelectorAll('[data-action="select-user"]').forEach((button) => {
            button.addEventListener('click', () => {
                const id = Number(button.getAttribute('data-user-id'));
                cargarUsuarioDetalle(id);
            });
        });

        const primerUsuario = usuarios[0];
        if (primerUsuario && document.getElementById('dashboard-user-detail-form')) {
            cargarUsuarioDetalle(primerUsuario.id);
        }
    }

    function obtenerHistorialComprasUsuario(idUsuario) {
        const pedidos = JSON.parse(localStorage.getItem('hh_pedidos') || '[]');
        return pedidos.filter((pedido) => {
            const cliente = pedido.cliente || pedido.usuario || {};
            const nombre = typeof cliente === 'object' ? cliente.nombre || '' : '';
            const correo = typeof cliente === 'object' ? cliente.correo || '' : '';
            const matchId = Number(pedido.usuarioId || pedido.userId || 0) === Number(idUsuario);
            const matchEmail = Boolean(correo) && correo.toLowerCase() === (document.getElementById('dashboard-user-email')?.value || '').toLowerCase();
            const matchName = Boolean(nombre) && nombre.toLowerCase() === (document.getElementById('dashboard-user-name')?.value || '').toLowerCase();
            return matchId || matchEmail || matchName;
        });
    }

    function cargarUsuarioDetalle(idUsuario) {
        const usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];
        const usuario = usuarios.find(u => Number(u.id) === Number(idUsuario));
        const form = document.getElementById('dashboard-user-detail-form');
        if (!form || !usuario) return;

        document.getElementById('dashboard-user-id').value = usuario.id;
        document.getElementById('dashboard-user-name').value = usuario.nombre || '';
        document.getElementById('dashboard-user-email').value = usuario.correo || '';
        document.getElementById('dashboard-user-phone').value = usuario.telefono || '';
        document.getElementById('dashboard-user-address').value = usuario.direccion || '';
        document.getElementById('dashboard-user-role').value = usuario.rol || 'cliente';

        const historial = obtenerHistorialComprasUsuario(usuario.id);
        const body = document.getElementById('dashboard-user-history-body');
        if (!body) return;

        body.innerHTML = '';
        if (!historial.length) {
            body.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem;">Este usuario aún no tiene compras registradas.</td></tr>';
            return;
        }

        historial.forEach((pedido) => {
            const row = document.createElement('tr');
            const estado = pedido.status === 3 ? 'Completado' : pedido.status === 2 ? 'Enviado' : 'Pendiente';
            const claseEstado = pedido.status === 3 ? 'completed' : pedido.status === 2 ? 'sent' : 'pending';
            row.innerHTML = `
                <td>${pedido.code || 'HH-0000'}</td>
                <td>${pedido.createdAt ? new Date(pedido.createdAt).toLocaleDateString('es-CL') : 'Sin fecha'}</td>
                <td>$${Number(pedido.total || 0).toLocaleString('es-CL')}</td>
                <td><span class="status-badge ${claseEstado}">${estado}</span></td>
            `;
            body.appendChild(row);
        });
    }

    function initCreateUserDashboard() {
        const form = document.getElementById('dashboard-user-create-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('dashboard-new-user-name').value.trim();
            const correo = document.getElementById('dashboard-new-user-email').value.trim();
            const telefono = document.getElementById('dashboard-new-user-phone').value.trim();
            const direccion = document.getElementById('dashboard-new-user-address').value.trim();
            const rol = document.getElementById('dashboard-new-user-role').value;
            const password = document.getElementById('dashboard-new-user-password').value;
            const message = document.getElementById('dashboard-new-user-message');

            if (!nombre || !correo || !password) {
                if (message) {
                    message.textContent = 'Nombre, correo y contraseña son obligatorios.';
                    message.style.color = '#d32f2f';
                }
                return;
            }

            if (!REGEX_EMAIL_GMAIL_HOTMAIL.test(correo)) {
                if (message) {
                    message.textContent = 'El correo debe terminar en @gmail.com o @hotmail.com.';
                    message.style.color = '#d32f2f';
                }
                return;
            }

            const usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];
            if (usuarios.some(u => u.correo.toLowerCase() === correo.toLowerCase())) {
                if (message) {
                    message.textContent = 'El correo ya está registrado.';
                    message.style.color = '#d32f2f';
                }
                return;
            }

            const nuevoId = usuarios.length ? Math.max(...usuarios.map(u => Number(u.id || 0))) + 1 : 1;
            usuarios.push({ id: nuevoId, nombre, correo, telefono, direccion, rol, contrasena: password });
            localStorage.setItem('usuarios_huerto', JSON.stringify(usuarios));
            renderUsuariosTable();
            form.reset();
            if (message) {
                message.textContent = 'Usuario creado correctamente.';
                message.style.color = '#2e7d32';
            }
        });
    }

    function initEditUserDashboard() {
        const form = document.getElementById('dashboard-user-detail-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = Number(document.getElementById('dashboard-user-id').value);
            const nombre = document.getElementById('dashboard-user-name').value.trim();
            const correo = document.getElementById('dashboard-user-email').value.trim();
            const telefono = document.getElementById('dashboard-user-phone').value.trim();
            const direccion = document.getElementById('dashboard-user-address').value.trim();
            const rol = document.getElementById('dashboard-user-role').value;
            const message = document.getElementById('dashboard-user-detail-message');

            if (!nombre || !correo) {
                if (message) {
                    message.textContent = 'Nombre y correo son obligatorios.';
                    message.style.color = '#d32f2f';
                }
                return;
            }

            if (!REGEX_EMAIL_GMAIL_HOTMAIL.test(correo)) {
                if (message) {
                    message.textContent = 'El correo debe terminar en @gmail.com o @hotmail.com.';
                    message.style.color = '#d32f2f';
                }
                return;
            }

            const usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];
            const index = usuarios.findIndex(u => Number(u.id) === Number(id));
            if (index === -1) {
                if (message) {
                    message.textContent = 'No se encontró el usuario.';
                    message.style.color = '#d32f2f';
                }
                return;
            }

            usuarios[index] = { ...usuarios[index], nombre, correo, telefono, direccion, rol };
            localStorage.setItem('usuarios_huerto', JSON.stringify(usuarios));
            renderUsuariosTable();
            if (message) {
                message.textContent = 'Usuario actualizado correctamente.';
                message.style.color = '#2e7d32';
            }
        });

        const deleteButton = document.getElementById('dashboard-user-delete');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                const id = Number(document.getElementById('dashboard-user-id').value);
                if (!id || !confirm('¿Deseas eliminar este usuario?')) return;
                const usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];
                const filtrados = usuarios.filter(u => Number(u.id) !== Number(id));
                localStorage.setItem('usuarios_huerto', JSON.stringify(filtrados));
                renderUsuariosTable();
                form.reset();
                const body = document.getElementById('dashboard-user-history-body');
                if (body) body.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem;">Seleccione un usuario para revisar su historial.</td></tr>';
            });
        }
    }

    function initCreateUser() {
        const form = document.getElementById('form-nuevo-usuario');
        if (!form) return;

        form.addEventListener('submit', (e) => {
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
            usuarios.push({ id: nuevoId, nombre, correo: email, contrasena: password, telefono, direccion, rol });
            localStorage.setItem('usuarios_huerto', JSON.stringify(usuarios));

            if (mensaje) {
                mensaje.style.color = '#2e7d32';
                mensaje.textContent = '¡Usuario registrado exitosamente!';
            }

            setTimeout(() => window.location.href = 'admin-usuarios.html', 1000);
        });
    }

    function initEditUser() {
        const form = document.getElementById('form-editar-usuario');
        if (!form) return;

        const urlParams = new URLSearchParams(window.location.search);
        const idUsuario = parseInt(urlParams.get('id'), 10);
        let usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];
        const usuarioActual = usuarios.find(u => u.id === idUsuario);
        const mensaje = document.getElementById('mensaje-error-editar');
        const btnEliminar = document.getElementById('btn-eliminar-usuario');

        if (usuarioActual) {
            const nombre = document.getElementById('editar-nombre');
            const email = document.getElementById('editar-email');
            const telefono = document.getElementById('editar-telefono');
            const direccion = document.getElementById('editar-direccion');
            const rol = document.getElementById('editar-rol');
            if (nombre) nombre.value = usuarioActual.nombre;
            if (email) email.value = usuarioActual.correo;
            if (telefono) telefono.value = usuarioActual.telefono || '';
            if (direccion) direccion.value = usuarioActual.direccion || '';
            if (rol) rol.value = usuarioActual.rol;
        } else if (mensaje) {
            mensaje.textContent = 'Usuario no encontrado.';
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('editar-nombre').value.trim();
            const email = document.getElementById('editar-email').value.trim();
            const telefono = document.getElementById('editar-telefono').value.trim();
            const direccion = document.getElementById('editar-direccion').value.trim();
            const rol = document.getElementById('editar-rol').value;

            if (mensaje) {
                mensaje.textContent = '';
                mensaje.style.color = 'red';
            }

            if (!REGEX_EMAIL_GMAIL_HOTMAIL.test(email)) {
                if (mensaje) mensaje.textContent = 'El correo debe ser @gmail.com o @hotmail.com';
                return;
            }

            const index = usuarios.findIndex(u => u.id === idUsuario);
            if (index !== -1) {
                usuarios[index] = { ...usuarios[index], nombre, correo: email, telefono, direccion, rol };
                localStorage.setItem('usuarios_huerto', JSON.stringify(usuarios));
                if (mensaje) {
                    mensaje.style.color = '#2e7d32';
                    mensaje.textContent = '¡Usuario actualizado correctamente!';
                }
                setTimeout(() => window.location.href = 'admin-usuarios.html', 1000);
            }
        });

        if (btnEliminar) {
            btnEliminar.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                    usuarios = usuarios.filter(u => u.id !== idUsuario);
                    localStorage.setItem('usuarios_huerto', JSON.stringify(usuarios));
                    window.location.href = 'admin-usuarios.html';
                }
            });
        }
    }

    // Sustituye rutas antiguas por imágenes que sí existen actualmente en la carpeta img.
    function getProductImage(imagen) {
        const imagenesAntiguas = {
            'img/producto1.jpg': 'img/manzanas-fuji.png',
            'img/producto2.jpg': 'img/naranjas.jpg',
            'img/producto3.jpg': 'img/zanahorias.png'
        };
        return imagenesAntiguas[imagen] || (typeof imagen === 'string' ? imagen.trim() : '');
    }

    function initProfileForm() {
        const form = document.getElementById('profile-form');
        if (!form) return;

        const usuario = getUsuarioActivo();
        if (!usuario) {
            window.location.href = 'login.html';
            return;
        }

        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        const phoneInput = document.getElementById('profile-phone');
        const addressInput = document.getElementById('profile-address');
        const currPassword = document.getElementById('current-password');
        const newPassword = document.getElementById('new-password');
        const mensaje = document.getElementById('perfil-mensaje');

        if (nameInput) nameInput.value = usuario.nombre || '';
        if (emailInput) emailInput.value = usuario.correo || '';
        if (phoneInput) phoneInput.value = usuario.telefono || '';
        if (addressInput) addressInput.value = usuario.direccion || '';

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = (nameInput ? nameInput.value.trim() : '');
            const email = (emailInput ? emailInput.value.trim() : '');
            const telefono = (phoneInput ? phoneInput.value.trim() : '');
            const direccion = (addressInput ? addressInput.value.trim() : '');
            const actual = currPassword ? currPassword.value : '';
            const nueva = newPassword ? newPassword.value : '';

            if (!nombre || !email) {
                if (mensaje) {
                    mensaje.style.display = 'block';
                    mensaje.style.background = '#fdecea';
                    mensaje.style.color = '#b42318';
                    mensaje.textContent = 'Nombre y correo son obligatorios.';
                }
                return;
            }

            if (!REGEX_EMAIL_GMAIL_HOTMAIL.test(email)) {
                if (mensaje) {
                    mensaje.style.display = 'block';
                    mensaje.style.background = '#fdecea';
                    mensaje.style.color = '#b42318';
                    mensaje.textContent = 'Usa un correo válido con @gmail.com o @hotmail.com';
                }
                return;
            }

            const usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];
            const index = usuarios.findIndex(u => u.id === usuario.id);

            if (index === -1) {
                if (mensaje) {
                    mensaje.style.display = 'block';
                    mensaje.style.background = '#fdecea';
                    mensaje.style.color = '#b42318';
                    mensaje.textContent = 'No se encontró el usuario activo.';
                }
                return;
            }

            if (actual && usuario.contrasena !== actual) {
                if (mensaje) {
                    mensaje.style.display = 'block';
                    mensaje.style.background = '#fdecea';
                    mensaje.style.color = '#b42318';
                    mensaje.textContent = 'La contraseña actual no coincide.';
                }
                return;
            }

            const nuevaContrasena = nueva ? nueva : usuario.contrasena;
            const actualizado = {
                ...usuarios[index],
                nombre,
                correo: email,
                telefono,
                direccion,
                contrasena: nuevaContrasena
            };

            usuarios[index] = actualizado;
            localStorage.setItem('usuarios_huerto', JSON.stringify(usuarios));
            localStorage.setItem('sesion_activa', JSON.stringify(actualizado));

            if (mensaje) {
                mensaje.style.display = 'block';
                mensaje.style.background = '#e8f5e9';
                mensaje.style.color = '#2e7d32';
                mensaje.textContent = 'Tus datos se guardaron correctamente.';
            }

            if (currPassword) currPassword.value = '';
            if (newPassword) newPassword.value = '';
        });

        const cerrarBtn = document.getElementById('btn-cerrar-sesion');
        if (cerrarBtn) {
            cerrarBtn.addEventListener('click', cerrarSesion);
        }
    }

    // Dibuja la tabla de productos y conecta las acciones de eliminar/editar.
    function renderProductsTable() {
        const cuerpoTablaProductos = document.getElementById('cuerpo-tabla-productos') || document.getElementById('cuerpo-tabla-productos-dashboard') || document.querySelector('.admin-container .table tbody');
        if (!cuerpoTablaProductos) return;

        const productos = JSON.parse(localStorage.getItem('productos_huerto')) || [];
        cuerpoTablaProductos.innerHTML = '';

        if (productos.length === 0) {
            cuerpoTablaProductos.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 1.5rem;">No hay productos registrados en el sistema.</td></tr>';
            return;
        }

        productos.forEach((p) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img class="product-thumb" src="${getProductImage(p.imagen)}" alt="${p.nombre}"></td>
                <td class="product-name">${p.nombre}</td>
                <td class="product-category">${p.categoria}</td>
                <td class="product-price">$${Number(p.precio).toLocaleString('es-CL')}</td>
                <td>${p.stock}</td>
                <td><div class="product-actions">
                    <button class="btn-action btn-edit" data-id="${p.id}" data-action="edit-product" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" data-id="${p.id}" data-action="delete-product" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div></td>
            `;
            cuerpoTablaProductos.appendChild(tr);
        });

        if (cuerpoTablaProductos.dataset.actionsReady === 'true') return;
        cuerpoTablaProductos.dataset.actionsReady = 'true';
        cuerpoTablaProductos.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            const idProducto = target.getAttribute('data-id');
            if (target.dataset.action === 'delete-product') {
                if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                    let productosActuales = JSON.parse(localStorage.getItem('productos_huerto')) || [];
                    productosActuales = productosActuales.filter(p => String(p.id) !== String(idProducto));
                    localStorage.setItem('productos_huerto', JSON.stringify(productosActuales));
                    renderProductsTable();
                    renderProductReports();
                    renderDashboardOverview();
                }
                return;
            }

            if (target.dataset.action === 'edit-product') {
                const productosActuales = JSON.parse(localStorage.getItem('productos_huerto')) || [];
                const producto = productosActuales.find(p => String(p.id) === String(idProducto));
                if (!producto) return;
                const form = document.getElementById('dashboard-product-form');
                if (!form) {
                    window.location.href = `admin-editar-producto.html?id=${idProducto}`;
                    return;
                }

                document.getElementById('dashboard-product-id').value = producto.id;
                document.getElementById('dashboard-product-name').value = producto.nombre || '';
                document.getElementById('dashboard-product-category').value = producto.categoria || 'Verduras';
                document.getElementById('dashboard-product-price').value = producto.precio || 0;
                document.getElementById('dashboard-product-stock').value = producto.stock || '';
                document.getElementById('dashboard-product-image').value = producto.imagen || '';
                const preview = document.getElementById('dashboard-product-preview');
                if (preview) {
                    preview.src = getProductImage(producto.imagen) || 'img/manzanas-fuji.png';
                    preview.hidden = false;
                }
                document.getElementById('dashboard-product-submit').textContent = 'Actualizar producto';
                document.getElementById('dashboard-product-cancel').classList.remove('hidden');
                document.getElementById('dashboard-product-message').textContent = 'Editando producto';
                document.getElementById('dashboard-product-message').style.color = '#2e7d32';
                document.getElementById('dashboard-product-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Valida y guarda un producto creado desde el panel admin.
    function clearDashboardProductImage() {
        const hidden = document.getElementById('dashboard-product-image');
        const fileInput = document.getElementById('dashboard-product-image-file');
        const preview = document.getElementById('dashboard-product-preview');
        const clearBtn = document.getElementById('dashboard-product-image-clear');

        if (hidden) hidden.value = '';
        if (fileInput) fileInput.value = '';
        if (preview) {
            preview.src = '';
            preview.hidden = true;
        }
        if (clearBtn) clearBtn.classList.add('hidden');
    }

    function initCreateProduct() {
        const form = document.getElementById('formNuevoProducto') || document.getElementById('form-nuevo-producto') || document.getElementById('dashboard-product-form');
        if (!form) return;

        const imageInput = document.getElementById('nuevo-prod-imagen') || document.getElementById('imagen');
        const fileInput = document.getElementById('nuevo-prod-file');
        const dashboardImageInput = document.getElementById('dashboard-product-image');
        const dashboardFileInput = document.getElementById('dashboard-product-image-file');
        const dashboardClearBtn = document.getElementById('dashboard-product-image-clear');

        if (fileInput) {
            fileInput.addEventListener('change', async () => {
                const file = fileInput.files?.[0];
                if (!file) return;
                const url = await readFileAsDataUrl(file).catch(() => '');
                if (url) {
                    if (imageInput) imageInput.value = url;
                    if (dashboardImageInput) dashboardImageInput.value = url;
                }
            });
        }

        if (dashboardClearBtn) {
            dashboardClearBtn.addEventListener('click', clearDashboardProductImage);
        }

        if (dashboardFileInput) {
            dashboardFileInput.addEventListener('change', async () => {
                const file = dashboardFileInput.files?.[0];
                if (!file) return;
                const url = await readFileAsDataUrl(file).catch(() => '');
                if (url) {
                    const preview = document.getElementById('dashboard-product-preview');
                    if (preview) {
                        preview.src = url;
                        preview.hidden = false;
                    }
                    const hidden = document.getElementById('dashboard-product-image');
                    if (hidden) hidden.value = url;
                    if (dashboardClearBtn) dashboardClearBtn.classList.remove('hidden');
                }
            });
        }

        form.querySelectorAll('input[name="imagen-producto"]').forEach(option => {
            option.addEventListener('change', () => {
                if (imageInput) imageInput.value = option.value;
                if (dashboardImageInput) dashboardImageInput.value = option.value;
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = (document.getElementById('nuevo-prod-nombre') || document.getElementById('nombre') || document.getElementById('dashboard-product-name')).value.trim();
            const categoria = (document.getElementById('nuevo-prod-categoria') || document.getElementById('categoria') || document.getElementById('dashboard-product-category')).value;
            const precio = parseInt((document.getElementById('nuevo-prod-precio') || document.getElementById('precio') || document.getElementById('dashboard-product-price')).value, 10);
            const stock = (document.getElementById('nuevo-prod-stock') || document.getElementById('stock') || document.getElementById('dashboard-product-stock')).value.trim();
            const imagen = (document.getElementById('nuevo-prod-imagen') || document.getElementById('imagen') || document.getElementById('dashboard-product-image')).value.trim() || 'img/manzanas-fuji.png';
            const mensaje = document.getElementById('mensaje-error-nuevo-prod') || document.getElementById('dashboard-product-message');

            if (!nombre || isNaN(precio) || !stock) {
                if (mensaje) {
                    mensaje.textContent = 'Por favor, rellena todos los campos correctamente.';
                    mensaje.style.color = '#d32f2f';
                }
                return;
            }

            let productos = JSON.parse(localStorage.getItem('productos_huerto')) || [];
            const productoId = document.getElementById('dashboard-product-id')?.value;
            if (productoId) {
                const index = productos.findIndex(p => String(p.id) === String(productoId));
                if (index !== -1) {
                    productos[index] = { ...productos[index], nombre, categoria, precio, stock, imagen };
                    localStorage.setItem('productos_huerto', JSON.stringify(productos));
                    if (mensaje) {
                        mensaje.style.color = '#2e7d32';
                        mensaje.textContent = '¡Producto actualizado correctamente!';
                    }
                    resetDashboardProductForm();
                    renderProductsTable();
                    renderProductReports();
                    renderDashboardOverview();
                    return;
                }
            }

            const idsNumericos = productos
                .map(producto => Number(producto.id))
                .filter(id => Number.isFinite(id));
            const nuevoId = idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1;
            productos.push({ id: nuevoId, nombre, categoria, precio, stock, imagen });
            localStorage.setItem('productos_huerto', JSON.stringify(productos));

            if (mensaje) {
                mensaje.style.color = '#2e7d32';
                mensaje.textContent = '¡Producto agregado exitosamente!';
            }

            if (form.id === 'dashboard-product-form') {
                resetDashboardProductForm();
                renderProductsTable();
                renderProductReports();
                renderDashboardOverview();
                return;
            }

            setTimeout(() => window.location.href = 'admin-productos.html', 1000);
        });
    }

    // Carga, actualiza o elimina el producto indicado en la URL.
    function resetDashboardProductForm() {
        const form = document.getElementById('dashboard-product-form');
        if (!form) return;
        form.reset();
        document.getElementById('dashboard-product-id').value = '';
        document.getElementById('dashboard-product-image').value = '';
        const fileInput = document.getElementById('dashboard-product-image-file');
        if (fileInput) fileInput.value = '';
        const clearBtn = document.getElementById('dashboard-product-image-clear');
        if (clearBtn) clearBtn.classList.add('hidden');
        const preview = document.getElementById('dashboard-product-preview');
        if (preview) {
            preview.hidden = true;
            preview.src = '';
        }
        const submitBtn = document.getElementById('dashboard-product-submit');
        if (submitBtn) submitBtn.textContent = 'Guardar producto';
        const cancelBtn = document.getElementById('dashboard-product-cancel');
        if (cancelBtn) cancelBtn.classList.add('hidden');
        const message = document.getElementById('dashboard-product-message');
        if (message) {
            message.textContent = '';
            message.style.color = '';
        }
    }

    function initEditProduct() {
        const form = document.getElementById('formEditarProducto') || document.getElementById('form-editar-producto');
        if (!form) return;

        const urlParams = new URLSearchParams(window.location.search);
        const idProducto = urlParams.get('id');
        let productos = JSON.parse(localStorage.getItem('productos_huerto')) || [];
        const productoActual = productos.find(p => String(p.id) === idProducto);
        const mensaje = document.getElementById('mensaje-error-editar-prod');
        const btnEliminarProd = document.getElementById('btn-eliminar-producto');
        const fileInput = document.getElementById('editar-prod-file');
        const hiddenInput = document.getElementById('editar-prod-imagen');

        if (fileInput) {
            fileInput.addEventListener('change', async () => {
                const file = fileInput.files?.[0];
                if (!file) return;
                const url = await readFileAsDataUrl(file).catch(() => '');
                if (url && hiddenInput) {
                    hiddenInput.value = url;
                }
            });
        }

        if (productoActual) {
            const elNombre = document.getElementById('editar-prod-nombre') || document.getElementById('nombre');
            const elCategoria = document.getElementById('editar-prod-categoria') || document.getElementById('categoria');
            const elPrecio = document.getElementById('editar-prod-precio') || document.getElementById('precio');
            const elStock = document.getElementById('editar-prod-stock') || document.getElementById('stock');
            const elImagen = document.getElementById('editar-prod-imagen') || document.getElementById('imagen');
            if (elNombre) elNombre.value = productoActual.nombre;
            if (elCategoria) elCategoria.value = productoActual.categoria;
            if (elPrecio) elPrecio.value = productoActual.precio;
            if (elStock) elStock.value = productoActual.stock;
            const imagenActual = getProductImage(productoActual.imagen);
            if (elImagen) elImagen.value = imagenActual;
            form.querySelectorAll('input[name="imagen-producto"]').forEach(option => {
                option.checked = option.value === imagenActual;
                option.addEventListener('change', () => { elImagen.value = option.value; });
            });
        } else if (mensaje) {
            mensaje.textContent = 'Producto no encontrado.';
            mensaje.style.color = '#d32f2f';
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = (document.getElementById('editar-prod-nombre') || document.getElementById('nombre')).value.trim();
            const categoria = (document.getElementById('editar-prod-categoria') || document.getElementById('categoria')).value;
            const precio = parseInt((document.getElementById('editar-prod-precio') || document.getElementById('precio')).value, 10);
            const stock = (document.getElementById('editar-prod-stock') || document.getElementById('stock')).value.trim();
            const imagen = (document.getElementById('editar-prod-imagen') || document.getElementById('imagen')).value.trim() || 'img/manzanas-fuji.png';

            if (!nombre || isNaN(precio) || !stock) {
                if (mensaje) {
                    mensaje.textContent = 'Por favor, completa todos los campos requeridos correctamente.';
                    mensaje.style.color = '#d32f2f';
                }
                return;
            }

            const index = productos.findIndex(p => String(p.id) === idProducto);
            if (index !== -1) {
                productos[index] = { ...productos[index], nombre, categoria, precio, stock, imagen };
                localStorage.setItem('productos_huerto', JSON.stringify(productos));
                if (mensaje) {
                    mensaje.style.color = '#2e7d32';
                    mensaje.textContent = '¡Producto actualizado correctamente!';
                }
                setTimeout(() => window.location.href = 'admin-productos.html', 1000);
            }
        });

        if (btnEliminarProd) {
            btnEliminarProd.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                    productos = productos.filter(p => String(p.id) !== idProducto);
                    localStorage.setItem('productos_huerto', JSON.stringify(productos));
                    window.location.href = 'admin-productos.html';
                }
            });
        }
    }

    function initProductsSeed() {
        let productosGuardados = JSON.parse(localStorage.getItem('productos_huerto')) || [];
        const productosCatalogo = [
            { id: 'FR001', nombre: 'Manzanas Fuji', categoria: 'Frutas', precio: 1200, stock: '150 kg', imagen: 'img/manzanas-fuji.png' },
            { id: 'FR002', nombre: 'Naranjas Valencia', categoria: 'Frutas', precio: 1000, stock: '200 kg', imagen: 'img/naranjas.jpg' },
            { id: 'FR003', nombre: 'Platanos Cavendish', categoria: 'Frutas', precio: 800, stock: '250 kg', imagen: 'img/platanos.jpg' },
            { id: 'VR001', nombre: 'Zanahorias Organicas', categoria: 'Verduras', precio: 900, stock: '100 kg', imagen: 'img/zanahorias.png' },
            { id: 'VR002', nombre: 'Espinacas Frescas', categoria: 'Verduras', precio: 700, stock: '80 bolsas', imagen: 'img/espinaca.png' },
            { id: 'VR003', nombre: 'Pimientos Tricolores', categoria: 'Verduras', precio: 1500, stock: '120 kg', imagen: 'img/pimentones.jpg' },
            { id: 'PO001', nombre: 'Miel Organica', categoria: 'Organicos', precio: 5000, stock: '50 frascos', imagen: 'img/miel-organica.png' },
            { id: 'PO003', nombre: 'Quinua Organica', categoria: 'Organicos', precio: 3200, stock: '60 kg', imagen: 'img/quinoa.jpg' },
            { id: 'PL001', nombre: 'Leche Entera', categoria: 'Lacteos', precio: 1800, stock: '90 botellas', imagen: 'img/leche.jpg' }
        ];

        const idsAntiguos = { 1: 'FR001', 2: 'FR002', 3: 'VR001' };
        productosGuardados = productosGuardados.map(producto => ({
            ...producto,
            id: idsAntiguos[producto.id] || producto.id
        })).filter(producto => getProductImage(producto.imagen));

        const productosUnicos = new Map();
        productosGuardados.forEach(producto => {
            const id = String(producto.id || '').trim();
            if (id && !productosUnicos.has(id)) productosUnicos.set(id, producto);
        });
        productosGuardados = Array.from(productosUnicos.values());

        productosCatalogo.forEach(productoCatalogo => {
            if (!productosGuardados.some(producto => String(producto.id) === productoCatalogo.id)) {
                productosGuardados.push(productoCatalogo);
            }
        });

        if (productosGuardados.length > 0) {
            localStorage.setItem('productos_huerto', JSON.stringify(productosGuardados));
        }
    }

    function parseStockNumber(stockValue) {
        if (typeof stockValue === 'number') return stockValue;
        if (!stockValue && stockValue !== 0) return 0;
        const cleaned = String(stockValue).replace(/[^0-9.]/g, '');
        const parsed = Number(cleaned || 0);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function normalizeCategoryKey(value) {
        return String(value || 'otros')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'otros';
    }

    function getCategorias() {
        try {
            const categoriasGuardadas = JSON.parse(localStorage.getItem('hh_categorias') || '[]');
            if (Array.isArray(categoriasGuardadas) && categoriasGuardadas.length) {
                return categoriasGuardadas.map(item => String(item).trim()).filter(Boolean);
            }
        } catch (error) {
            // Ignora datos corruptos y usa la semilla por defecto.
        }

        const categoriasDefault = ['Frutas Frescas', 'Verduras Organicas', 'Productos Organicos', 'Productos Lacteos'];
        localStorage.setItem('hh_categorias', JSON.stringify(categoriasDefault));
        return categoriasDefault;
    }

    function ensureCategoriesSeed() {
        const categorias = getCategorias();
        const categoriasLimitadas = categorias.filter((categoria, index, array) => array.indexOf(categoria) === index);
        if (categoriasLimitadas.length !== categorias.length) {
            localStorage.setItem('hh_categorias', JSON.stringify(categoriasLimitadas));
        }
    }

    function populateCategorySelects() {
        const categorias = getCategorias();
        const selects = document.querySelectorAll('select[id$="-categoria"], select[id$="-category"], select[name$="-categoria"], select[name$="-category"], select[data-role="categoria"]');

        selects.forEach((select) => {
            const selectedValue = select.value || select.getAttribute('data-selected') || '';
            const opciones = categorias.map(categoria => `<option value="${categoria}">${categoria}</option>`).join('');
            select.innerHTML = `<option value="">Seleccione una categoría</option>${opciones}`;

            const hasExactMatch = categorias.includes(selectedValue);
            const hasNormalizedMatch = categorias.some(categoria => normalizeCategoryKey(categoria) === normalizeCategoryKey(selectedValue));

            if (hasExactMatch) {
                select.value = selectedValue;
            } else if (hasNormalizedMatch) {
                select.value = categorias.find(categoria => normalizeCategoryKey(categoria) === normalizeCategoryKey(selectedValue)) || '';
            } else if (select.dataset.default) {
                select.value = select.dataset.default;
            }
        });
    }

    function renderCategoriasTable() {
        const tabla = document.getElementById('cuerpo-tabla-categorias');
        if (!tabla) return;

        const categorias = getCategorias();
        tabla.innerHTML = '';

        if (!categorias.length) {
            tabla.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 1.5rem;">No hay categorías registradas.</td></tr>';
            return;
        }

        categorias.forEach((categoria) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td style="padding: 0.8rem; font-weight: 700;">${categoria}</td>
                <td style="padding: 0.8rem; color: var(--text-muted);">${normalizeCategoryKey(categoria)}</td>
                <td style="padding: 0.8rem; text-align: center;">
                    <div class="product-actions">
                        <a href="admin-editar-categoria.html?id=${encodeURIComponent(categoria)}" class="btn-action btn-edit" title="Editar"><i class="fas fa-edit"></i></a>
                        <button type="button" class="btn-action btn-delete" data-action="delete-category" data-category="${categoria}" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tabla.appendChild(fila);
        });

        tabla.querySelectorAll('[data-action="delete-category"]').forEach((boton) => {
            boton.addEventListener('click', () => {
                const categoria = boton.getAttribute('data-category');
                if (!categoria) return;
                if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${categoria}"?`)) return;

                const categoriasActuales = getCategorias().filter(item => item !== categoria);
                localStorage.setItem('hh_categorias', JSON.stringify(categoriasActuales));
                populateCategorySelects();
                renderCategoriasTable();
            });
        });
    }

    function initCategoryForm() {
        const form = document.getElementById('form-categoria');
        if (!form) return;

        const inputNombre = document.getElementById('categoria-nombre');
        const inputSlug = document.getElementById('categoria-slug');
        const mensaje = document.getElementById('mensaje-categoria');
        const query = new URLSearchParams(window.location.search);
        const categoriaEditando = query.get('id');

        if (categoriaEditando) {
            const categorias = getCategorias();
            const categoriaActual = categorias.find(categoria => categoria === categoriaEditando);
            if (categoriaActual && inputNombre) {
                inputNombre.value = categoriaActual;
                if (inputSlug) inputSlug.value = normalizeCategoryKey(categoriaActual);
            }
        }

        if (inputNombre) {
            inputNombre.addEventListener('input', () => {
                if (inputSlug) inputSlug.value = normalizeCategoryKey(inputNombre.value);
            });
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const nombre = inputNombre ? inputNombre.value.trim() : '';
            if (!nombre) {
                if (mensaje) {
                    mensaje.textContent = 'El nombre de la categoría es obligatorio.';
                    mensaje.style.color = '#d32f2f';
                }
                return;
            }

            const categorias = getCategorias();
            const nombreNormalizado = nombre;
            const yaExiste = categorias.some(categoria => categoria.toLowerCase() === nombreNormalizado.toLowerCase());

            if (!categoriaEditando && yaExiste) {
                if (mensaje) {
                    mensaje.textContent = 'La categoría ya existe en el sistema.';
                    mensaje.style.color = '#d32f2f';
                }
                return;
            }

            let nextCategories = categoriaEditando
                ? categorias.map(categoria => categoria === categoriaEditando ? nombreNormalizado : categoria)
                : [...categorias, nombreNormalizado];

            nextCategories = nextCategories.filter((categoria, index, array) => categoria && array.indexOf(categoria) === index);
            localStorage.setItem('hh_categorias', JSON.stringify(nextCategories));
            populateCategorySelects();
            if (mensaje) {
                mensaje.textContent = categoriaEditando ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.';
                mensaje.style.color = '#2e7d32';
            }
            setTimeout(() => {
                window.location.href = 'admin-categorias.html';
            }, 700);
        });
    }

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
            reader.readAsDataURL(file);
        });
    }

    function renderReportesDashboard() {
        const usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];
        const pedidos = JSON.parse(localStorage.getItem('hh_pedidos') || '[]');

        const totalIngresos = pedidos.reduce((sum, pedido) => sum + Number(pedido.total || 0), 0);
        const promedio = pedidos.length ? totalIngresos / pedidos.length : 0;

        const totalElement = document.getElementById('reporte-usuarios-total');
        const boletasElement = document.getElementById('reporte-boletas-total');
        const promedioElement = document.getElementById('reporte-ticket-promedio');
        const ingresosElement = document.getElementById('reporte-ingresos-total');

        if (totalElement) totalElement.textContent = String(usuarios.length || 0);
        if (boletasElement) boletasElement.textContent = String(pedidos.length || 0);
        if (promedioElement) promedioElement.textContent = `$${promedio.toLocaleString('es-CL')}`;
        if (ingresosElement) ingresosElement.textContent = `$${totalIngresos.toLocaleString('es-CL')}`;

        const tbodyUsuarios = document.getElementById('dashboard-reporte-usuarios');
        if (tbodyUsuarios) {
            tbodyUsuarios.innerHTML = usuarios.length
                ? usuarios.map(usuario => `
                    <tr>
                        <td>${usuario.nombre || 'Sin nombre'}</td>
                        <td>${usuario.correo || '—'}</td>
                        <td>${usuario.rol || 'cliente'}</td>
                    </tr>
                `).join('')
                : '<tr><td colspan="3" style="text-align: center; padding: 1rem;">No hay usuarios registrados.</td></tr>';
        }

        const tbodyBoletas = document.getElementById('dashboard-reporte-boletas');
        if (tbodyBoletas) {
            tbodyBoletas.innerHTML = pedidos.length
                ? pedidos.slice(0, 5).map(pedido => {
                    const cliente = pedido.cliente && typeof pedido.cliente === 'object' ? pedido.cliente.nombre || 'Cliente' : 'Cliente';
                    const estado = pedido.status === 3 ? 'Completado' : pedido.status === 2 ? 'Enviado' : 'Pendiente';
                    const claseEstado = pedido.status === 3 ? 'completed' : pedido.status === 2 ? 'sent' : 'pending';
                    return `
                        <tr>
                            <td>${pedido.code || 'HH-0000'}</td>
                            <td>${cliente}</td>
                            <td>$${Number(pedido.total || 0).toLocaleString('es-CL')}</td>
                            <td><span class="status-badge ${claseEstado}">${estado}</span></td>
                        </tr>
                    `;
                }).join('')
                : '<tr><td colspan="4" style="text-align: center; padding: 1rem;">No hay boletas registradas.</td></tr>';
        }
    }

    function renderDashboardOverview() {
        const productosTable = document.getElementById('dashboard-productos-table');
        const usuariosTable = document.getElementById('dashboard-usuarios-table');
        if (!productosTable && !usuariosTable) return;

        const productos = JSON.parse(localStorage.getItem('productos_huerto')) || [];
        const usuarios = JSON.parse(localStorage.getItem('usuarios_huerto')) || [];

        if (productosTable) {
            const filas = productos.slice(0, 4).map(producto => `
                <tr>
                    <td>${producto.nombre || 'Producto'}</td>
                    <td>$${Number(producto.precio || 0).toLocaleString('es-CL')}</td>
                    <td>${producto.stock || '—'}</td>
                </tr>
            `).join('');
            productosTable.querySelector('tbody').innerHTML = filas || '<tr><td colspan="3">Sin productos</td></tr>';
        }

        if (usuariosTable) {
            const filas = usuarios.slice(0, 4).map(usuario => `
                <tr>
                    <td>${usuario.nombre || 'Usuario'}</td>
                    <td>${usuario.correo || '—'}</td>
                    <td><span class="role-badge">${usuario.rol || 'cliente'}</span></td>
                </tr>
            `).join('');
            usuariosTable.querySelector('tbody').innerHTML = filas || '<tr><td colspan="3">Sin usuarios</td></tr>';
        }
    }

    function renderProductReports() {
        const productos = JSON.parse(localStorage.getItem('productos_huerto')) || [];
        const criticos = productos.filter(producto => parseStockNumber(producto.stock) <= 20);
        const resumen = document.getElementById('reporte-productos-criticos');
        const valor = document.getElementById('reporte-valor-inventario');
        const stock = document.getElementById('reporte-stock-total');

        if (resumen) resumen.textContent = String(criticos.length);
        if (valor) {
            const total = productos.reduce((sum, producto) => sum + (Number(producto.precio || 0) * parseStockNumber(producto.stock)), 0);
            valor.textContent = `$${total.toLocaleString('es-CL')}`;
        }
        if (stock) {
            const totalStock = productos.reduce((sum, producto) => sum + parseStockNumber(producto.stock), 0);
            stock.textContent = String(totalStock);
        }

        const criticosTable = document.getElementById('cuerpo-tabla-productos-criticos');
        if (!criticosTable) return;

        criticosTable.innerHTML = '';
        if (!criticos.length) {
            criticosTable.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem;">No hay productos críticos.</td></tr>';
            return;
        }

        criticos.slice(0, 5).forEach(producto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${producto.nombre || 'Producto'}</td>
                <td>${producto.categoria || 'Sin categoría'}</td>
                <td>${producto.stock || '0'}</td>
                <td><span class='status-badge pending'>Crítico</span></td>
            `;
            criticosTable.appendChild(tr);
        });
    }

    function getOrderCustomerName(order) {
        if (!order) return 'Cliente';
        if (order.cliente && typeof order.cliente === 'object') {
            return order.cliente.nombre || order.cliente.correo || 'Cliente';
        }
        if (order.usuario && typeof order.usuario === 'object') {
            return order.usuario.nombre || order.usuario.correo || 'Cliente';
        }
        return 'Cliente';
    }

    function renderBoletasTable() {
        const tabla = document.getElementById('cuerpo-tabla-boletas-dashboard');
        if (!tabla) return;

        const pedidos = JSON.parse(localStorage.getItem('hh_pedidos') || '[]');
        tabla.innerHTML = '';

        if (!pedidos.length) {
            tabla.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 1.5rem;">Aún no hay boletas registradas.</td></tr>';
            return;
        }

        pedidos.forEach((pedido) => {
            const fila = document.createElement('tr');
            const estado = pedido.status === 3 ? 'Completado' : pedido.status === 2 ? 'Enviado' : 'Pendiente';
            const claseEstado = pedido.status === 3 ? 'completed' : pedido.status === 2 ? 'sent' : 'pending';
            const detalleItems = (pedido.items || []).map(item => `${item.nombre || 'Producto'} x${item.qty || item.cantidad || 1}`).join(', ');

            fila.innerHTML = `
                <td>${pedido.code || 'HH-0000'}</td>
                <td>${getOrderCustomerName(pedido)}</td>
                <td>${pedido.createdAt ? new Date(pedido.createdAt).toLocaleDateString('es-CL') : 'Sin fecha'}</td>
                <td>$${Number(pedido.total || 0).toLocaleString('es-CL')}</td>
                <td><span class="status-badge ${claseEstado}">${estado}</span></td>
                <td><a href="#" class="boleta-detail">${detalleItems || 'Sin detalle'}</a></td>
            `;
            tabla.appendChild(fila);
        });
    }

    function initDashboardNavigation() {
        const navButtons = document.querySelectorAll('.nav-item[data-section]');
        const sectionButtons = document.querySelectorAll('[data-section]');
        const views = document.querySelectorAll('.admin-view');
        const title = document.getElementById('admin-section-title');
        const labels = {
            dashboard: 'Resumen General',
            productos: 'Productos',
            usuarios: 'Usuarios',
            reportes: 'Reportes',
            boletas: 'Boletas'
        };

        const activateSection = (section) => {
            const validSection = labels[section] ? section : 'dashboard';

            navButtons.forEach(button => {
                button.classList.toggle('active', button.dataset.section === validSection);
            });

            views.forEach(view => {
                view.classList.toggle('active', view.dataset.view === validSection);
            });

            if (title) title.textContent = labels[validSection] || 'Resumen General';
            const hash = validSection === 'dashboard' ? '' : `#${validSection}`;
            if (history && history.replaceState) {
                history.replaceState(null, '', `${window.location.pathname}${hash}`);
            }
        };

        navButtons.forEach(button => {
            button.addEventListener('click', () => activateSection(button.dataset.section));
        });

        sectionButtons.forEach(button => {
            if (button.classList.contains('header-link')) {
                button.addEventListener('click', () => activateSection(button.dataset.section));
            }
        });

        const initialSection = window.location.hash.replace('#', '') || 'dashboard';
        activateSection(initialSection);
    }

    // Inicializa todas las funciones disponibles en la página actual.
    function init() {
        ensureAdminSeed();
        initAuthUI();
        initLogin();
        initAdminGuard();
        initProfileForm();
        renderUsuariosTable();
        initCreateUser();
        initCreateUserDashboard();
        initEditUser();
        initEditUserDashboard();
        ensureCategoriesSeed();
        populateCategorySelects();
        initCategoryForm();
        renderCategoriasTable();
        initProductsSeed();
        renderProductsTable();
        renderProductReports();
        initCreateProduct();
        initEditProduct();
        renderDashboardOverview();
        renderReportesDashboard();
        renderBoletasTable();
        initDashboardNavigation();

        const cancelBtn = document.getElementById('dashboard-product-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', resetDashboardProductForm);
        }
    }

    window.HuertoHogar = window.HuertoHogar || {};
    window.HuertoHogar.initAdmin = init;
})();
