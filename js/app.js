document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DATOS DE REGIONES Y COMUNAS ---
    const datosRegiones = {
        "Región Metropolitana": ["Santiago", "Providencia", "Maipú", "Recoleta"],
        "Región de Los Lagos": ["Puerto Montt", "Puerto Varas", "Frutillar"],
        "Región de La Araucanía": ["Villarrica", "Temuco", "Pucón"]
    };

    const selectRegion = document.getElementById('region');
    const selectComuna = document.getElementById('comuna');

    // Cargar regiones si los selects existen en la página (Registro)
    if (selectRegion && selectComuna) {
        for (let region in datosRegiones) {
            let option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            selectRegion.appendChild(option);
        }

        // Cambiar comunas al seleccionar una región
        selectRegion.addEventListener('change', function() {
            selectComuna.innerHTML = '<option value="">Seleccione una comuna</option>'; // Limpiar
            const regionSeleccionada = this.value;

            if (regionSeleccionada !== "") {
                selectComuna.disabled = false;
                datosRegiones[regionSeleccionada].forEach(comuna => {
                    let option = document.createElement('option');
                    option.value = comuna;
                    option.textContent = comuna;
                    selectComuna.appendChild(option);
                });
            } else {
                selectComuna.disabled = true;
            }
        });
    }


    // --- 2. VALIDACIONES DE FORMULARIO DE REGISTRO ---
    const formRegistro = document.getElementById('form-registro');
    
    if (formRegistro) {
        formRegistro.addEventListener('submit', function(e) {
            e.preventDefault(); // Evita que la página se recargue por defecto
            let isValid = true;

            // Validar RUT (7 a 9 caracteres, sin puntos ni guion)
            const rut = document.getElementById('rut').value;
            const errorRut = document.getElementById('error-rut');
            const rutRegex = /^[0-9]+[0-9kK]{1}$/; 
            
            if (rut.length < 7 || rut.length > 9 || !rutRegex.test(rut)) {
                errorRut.style.display = 'block';
                isValid = false;
            } else {
                errorRut.style.display = 'none';
            }

            // Validar Correo Electrónico (Dominios permitidos y max 100 caracteres)
            const email = document.getElementById('email').value;
            const errorEmail = document.getElementById('error-email');
            const dominiosPermitidos = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
            const emailValido = dominiosPermitidos.some(dominio => email.endsWith(dominio));

            if (!emailValido || email.length > 100) {
                errorEmail.style.display = 'block';
                isValid = false;
            } else {
                errorEmail.style.display = 'none';
            }

            // Validar Contraseña (4 a 10 caracteres)
            const password = document.getElementById('password').value;
            const errorPassword = document.getElementById('error-password');

            if (password.length < 4 || password.length > 10) {
                errorPassword.style.display = 'block';
                isValid = false;
            } else {
                errorPassword.style.display = 'none';
            }

            if (isValid) {
                alert("¡Registro exitoso! Ya puedes iniciar sesión.");
                window.location.href = "login.html";
            }
        });
    }


    // --- 3. LÓGICA DEL CARRITO DE COMPRAS (LOCALSTORAGE) ---
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contadorCarrito = document.getElementById('cart-counter');

    // Actualizar el número del carrito en el header
    function actualizarContador() {
        if (contadorCarrito) {
            const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
            contadorCarrito.textContent = totalItems;
        }
    }
    actualizarContador();

    // Evento para los botones de "Añadir al Carrito"
    const botonesAñadir = document.querySelectorAll('.card-producto .btn, .info-producto .btn');
    
    botonesAñadir.forEach(boton => {
        boton.addEventListener('click', (e) => {
            // Buscamos los datos básicos del producto en el HTML (Card o Detalle)
            const contenedorProducto = e.target.closest('.card-producto') || e.target.closest('.info-producto');
            const nombre = contenedorProducto.querySelector('h2, h3').textContent;
            
            // Extraer solo los números del precio
            const precioTexto = contenedorProducto.querySelector('.precio, .precio-detalle').textContent;
            const precio = parseInt(precioTexto.replace(/[^0-9]/g, '')); 
            
            // Buscar si ya existe en el carrito
            const index = carrito.findIndex(item => item.nombre === nombre);
            
            if (index !== -1) {
                carrito[index].cantidad++;
            } else {
                carrito.push({ nombre: nombre, precio: precio, cantidad: 1 });
            }

            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarContador();
            alert(`${nombre} añadido al carrito.`);
        });
    });

    // --- 4. RENDERIZAR LA PÁGINA DEL CARRITO ---
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total-carrito');

    if (listaCarrito && totalCarrito) {
        if (carrito.length === 0) {
            listaCarrito.innerHTML = '<tr><td colspan="5" style="padding: 2rem;">Tu carrito está vacío. <a href="productos.html">Ir a comprar</a></td></tr>';
            totalCarrito.textContent = '$0';
        } else {
            listaCarrito.innerHTML = ''; // Limpiar tabla
            let total = 0;

            carrito.forEach((producto, index) => {
                const subtotal = producto.precio * producto.cantidad;
                total += subtotal;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>$${producto.precio.toLocaleString('es-CL')}</td>
                    <td>${producto.cantidad}</td>
                    <td>$${subtotal.toLocaleString('es-CL')}</td>
                    <td><button class="btn-eliminar" data-index="${index}" style="background: red; color: white; border: none; padding: 5px 10px; cursor: pointer;">Eliminar</button></td>
                `;
                listaCarrito.appendChild(tr);
            });

            totalCarrito.textContent = `$${total.toLocaleString('es-CL')}`;

            // Botones para eliminar productos
            document.querySelectorAll('.btn-eliminar').forEach(boton => {
                boton.addEventListener('click', function() {
                    const idx = this.getAttribute('data-index');
                    carrito.splice(idx, 1);
                    localStorage.setItem('carrito', JSON.stringify(carrito));
                    window.location.reload(); // Recargar para actualizar tabla
                });
            });
        }
    }
});

// --- 5. VALIDACIONES FORMULARIO DE PRODUCTOS (ADMIN) ---
    const formProducto = document.getElementById('form-producto');

    if (formProducto) {
        formProducto.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;

            // Validar Código (mínimo 3 caracteres)
            const codigo = document.getElementById('codigo-prod').value;
            const errorCodigo = document.getElementById('error-codigo');
            if (codigo.trim().length < 3) {
                errorCodigo.style.display = 'block';
                isValid = false;
            } else {
                errorCodigo.style.display = 'none';
            }

            // Validar Precio (mínimo 0)
            const precio = parseFloat(document.getElementById('precio-prod').value);
            const errorPrecio = document.getElementById('error-precio');
            if (isNaN(precio) || precio < 0) {
                errorPrecio.style.display = 'block';
                isValid = false;
            } else {
                errorPrecio.style.display = 'none';
            }

            // Validar Stock (mínimo 0) y alerta de stock crítico
            const stock = parseInt(document.getElementById('stock-prod').value);
            const errorStock = document.getElementById('error-stock');
            if (isNaN(stock) || stock < 0) {
                errorStock.style.display = 'block';
                isValid = false;
            } else {
                errorStock.style.display = 'none';
                if (stock >= 0 && stock <= 5 && isValid) {
                    alert("Advertencia: El producto será registrado, pero el stock es crítico (5 o menos unidades).");
                }
            }

            if (isValid) {
                alert("Producto guardado correctamente en el inventario.");
                window.location.href = "admin-productos.html";
            }
        });
    }