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
                    window.location.href = usuarioValido.rol === 'admin' ? 'admin-usuarios.html' : 'index.html';
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
        const cuerpoTabla = document.getElementById('cuerpo-tabla-usuarios');
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
                    <a href="admin-editar-usuario.html?id=${u.id}" style="color: var(--primary-green, #2e7d32); font-weight: 600; text-decoration: none;">Editar</a>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });
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
        return imagenesAntiguas[imagen] || imagen || 'img/manzanas-fuji.png';
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
        const cuerpoTablaProductos = document.getElementById('cuerpo-tabla-productos') || document.querySelector('.admin-container .table tbody');
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
                    <a href="admin-editar-producto.html?id=${p.id}" class="btn-action btn-edit" title="Editar"><i class="fas fa-edit"></i></a>
                    <button class="btn-action btn-delete" data-id="${p.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div></td>
            `;
            cuerpoTablaProductos.appendChild(tr);
        });

        if (cuerpoTablaProductos.dataset.actionsReady === 'true') return;
        cuerpoTablaProductos.dataset.actionsReady = 'true';
        cuerpoTablaProductos.addEventListener('click', (e) => {
            const btnDelete = e.target.closest('.btn-delete');
            if (!btnDelete) return;
            const idProducto = parseInt(btnDelete.getAttribute('data-id'), 10);
            if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                let productosActuales = JSON.parse(localStorage.getItem('productos_huerto')) || [];
                productosActuales = productosActuales.filter(p => p.id !== idProducto);
                localStorage.setItem('productos_huerto', JSON.stringify(productosActuales));
                renderProductsTable();
            }
        });
    }

    // Valida y guarda un producto creado desde el panel admin.
    function initCreateProduct() {
        const form = document.getElementById('formNuevoProducto') || document.getElementById('form-nuevo-producto');
        if (!form) return;

        const imageInput = document.getElementById('nuevo-prod-imagen') || document.getElementById('imagen');
        form.querySelectorAll('input[name="imagen-producto"]').forEach(option => {
            option.addEventListener('change', () => { imageInput.value = option.value; });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = (document.getElementById('nuevo-prod-nombre') || document.getElementById('nombre')).value.trim();
            const categoria = (document.getElementById('nuevo-prod-categoria') || document.getElementById('categoria')).value;
            const precio = parseInt((document.getElementById('nuevo-prod-precio') || document.getElementById('precio')).value, 10);
            const stock = (document.getElementById('nuevo-prod-stock') || document.getElementById('stock')).value.trim();
            const imagen = (document.getElementById('nuevo-prod-imagen') || document.getElementById('imagen')).value.trim() || 'img/manzanas-fuji.png';
            const mensaje = document.getElementById('mensaje-error-nuevo-prod');

            if (!nombre || isNaN(precio) || !stock) {
                if (mensaje) {
                    mensaje.textContent = 'Por favor, rellena todos los campos correctamente.';
                    mensaje.style.color = '#d32f2f';
                }
                return;
            }

            let productos = JSON.parse(localStorage.getItem('productos_huerto')) || [];
            const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
            productos.push({ id: nuevoId, nombre, categoria, precio, stock, imagen });
            localStorage.setItem('productos_huerto', JSON.stringify(productos));

            if (mensaje) {
                mensaje.style.color = '#2e7d32';
                mensaje.textContent = '¡Producto agregado exitosamente!';
            }

            setTimeout(() => window.location.href = 'admin-productos.html', 1000);
        });
    }

    // Carga, actualiza o elimina el producto indicado en la URL.
    function initEditProduct() {
        const form = document.getElementById('formEditarProducto') || document.getElementById('form-editar-producto');
        if (!form) return;

        const urlParams = new URLSearchParams(window.location.search);
        const idProducto = parseInt(urlParams.get('id'), 10);
        let productos = JSON.parse(localStorage.getItem('productos_huerto')) || [];
        const productoActual = productos.find(p => p.id === idProducto);
        const mensaje = document.getElementById('mensaje-error-editar-prod');
        const btnEliminarProd = document.getElementById('btn-eliminar-producto');

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

            const index = productos.findIndex(p => p.id === idProducto);
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
                    productos = productos.filter(p => p.id !== idProducto);
                    localStorage.setItem('productos_huerto', JSON.stringify(productos));
                    window.location.href = 'admin-productos.html';
                }
            });
        }
    }

    function initProductsSeed() {
        let productosGuardados = JSON.parse(localStorage.getItem('productos_huerto')) || [];
        if (productosGuardados.length === 0) {
            productosGuardados = [
                { id: 1, nombre: 'Manzanas Fuji', categoria: 'Frutas', precio: 1200, stock: '150 kg', imagen: 'img/manzanas-fuji.png' },
                { id: 2, nombre: 'Naranjas Valencia', categoria: 'Frutas', precio: 1000, stock: '200 kg', imagen: 'img/naranjas.jpg' },
                { id: 3, nombre: 'Zanahorias Frescas', categoria: 'Verduras', precio: 900, stock: '100 kg', imagen: 'img/zanahorias.png' }
            ];
            localStorage.setItem('productos_huerto', JSON.stringify(productosGuardados));
        }
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
        initEditUser();
        initProductsSeed();
        renderProductsTable();
        initCreateProduct();
        initEditProduct();
    }

    window.HuertoHogar = window.HuertoHogar || {};
    window.HuertoHogar.initAdmin = init;
})();
