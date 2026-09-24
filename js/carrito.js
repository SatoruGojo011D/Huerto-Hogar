/* Carrito: agrega productos, renderiza sus tarjetas y calcula cantidades, envío y total. */
(function () {
    // Recupera el carrito actual; si no existe, comienza con una lista vacía.
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('hh_carrito') || '[]');
        } catch (error) {
            return [];
        }
    }

    // Persiste el carrito para conservarlo al cambiar de página.
    function saveCart(cart) {
        localStorage.setItem('hh_carrito', JSON.stringify(cart));
    }

    // Normaliza un producto y aumenta su cantidad si ya estaba agregado.
    function addToCart(item) {
        const cart = getCart();
        const normalizedItem = {
            id: item.id,
            nombre: item.nombre || 'Producto',
            precio: Number(item.precio) || 0,
            imagen: item.imagen || 'img/manzanas-fuji.png',
            qty: Number(item.cantidad || item.qty || 1)
        };

        const existing = cart.find(product => product.id === normalizedItem.id);
        if (existing) {
            existing.qty += normalizedItem.qty;
        } else {
            cart.push(normalizedItem);
        }

        saveCart(cart);
        if (window.HuertoHogar && typeof window.HuertoHogar.utils?.actualizarBadgeCarrito === 'function') {
            window.HuertoHogar.utils.actualizarBadgeCarrito();
        }

        const cartItems = document.getElementById('cart-items');
        if (cartItems && typeof window.HuertoHogar.renderCart === 'function') {
            window.HuertoHogar.renderCart();
        }
    }

    // Construye las tarjetas del carrito y actualiza el resumen del pedido.
    function renderCart() {
        const cartItems = document.getElementById('cart-items');
        const totalCount = document.getElementById('total-count');
        const subtotalText = document.getElementById('subtotal-text');
        const ivaText = document.getElementById('iva-text');
        const totalText = document.getElementById('total-text');
        const shippingText = document.getElementById('shipping-text');
        const freeShippingLbl = document.getElementById('free-shipping-lbl');
        const co2Value = document.getElementById('co2-value');
        const co2Progress = document.getElementById('co2-progress');
        const progressTrack = co2Progress ? co2Progress.parentElement : null;

        if (!cartItems) return;

        const cart = getCart();

        if (!cart.length) {
            cartItems.innerHTML = `
                <div class="empty-cart" id="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <h3>Tu carrito está vacío</h3>
                    <p>Aún no has agregado productos. Explora el catálogo y añade lo que te guste.</p>
                    <a href="productos.html" class="btn-checkout empty-cart-btn">Ver catálogo</a>
                </div>
            `;
        } else {
            cartItems.innerHTML = cart.map(item => `
                <article class="cart-card" data-id="${item.id}" data-unit-price="${Number(item.precio)}">
                    <img src="${item.imagen}" alt="${item.nombre}">
                    <div class="cart-card-info">
                        <h3 class="serif">${item.nombre}</h3>
                        <p class="unit-price">$${Number(item.precio).toLocaleString('es-CL')} CLP</p>
                        <div class="qty-control">
                            <button class="qty-btn btn-minus" type="button">−</button>
                            <span class="qty-val">${Number(item.qty)}</span>
                            <button class="qty-btn btn-plus" type="button">+</button>
                        </div>
                    </div>
                    <button class="remove-btn" type="button" title="Eliminar">🗑</button>
                    <div class="item-total-price">$${(Number(item.precio) * Number(item.qty)).toLocaleString('es-CL')} CLP</div>
                </article>
            `).join('');
        }

        let itemsQty = 0;
        let subtotal = 0;

        cart.forEach(item => {
            const qty = Number(item.qty) || 0;
            const price = Number(item.precio) || 0;
            itemsQty += qty;
            subtotal += qty * price;
        });

        if (totalCount) totalCount.textContent = itemsQty;
        if (subtotalText) subtotalText.textContent = `$${subtotal.toLocaleString('es-CL')} CLP`;


        const shippingCost = subtotal > 0 && subtotal >= 25000 ? 0 : 2990;
        const iva = subtotal * 0.19;
        const grandTotal = subtotal > 0 ? subtotal + iva + shippingCost : 0;

        if (ivaText) ivaText.textContent = `$${iva.toLocaleString('es-CL')} CLP`;
        if (shippingText) shippingText.textContent = `$${shippingCost.toLocaleString('es-CL')} CLP`;
        if (totalText) totalText.textContent = `$${grandTotal.toLocaleString('es-CL')} CLP`;
        if (co2Value) {
            const co2 = (itemsQty * 0.416).toFixed(1);
            co2Value.textContent = `${co2} kg CO₂e`;
        }
        if (co2Progress) {
            // Cada unidad aumenta la huella representada; el ancho se limita al 100%.
            const progress = itemsQty === 0 ? 0 : Math.min(100, Math.max(12, itemsQty * 16));
            co2Progress.style.width = `${progress}%`;
            if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(progress));
        }
        if (freeShippingLbl) {
            const missing = 25000 - subtotal;
            freeShippingLbl.textContent = missing > 0
                ? `Suma $${missing.toLocaleString('es-CL')} CLP más para despacho gratis.`
                : '¡Tu envío es gratis!';
        }

        if (document.getElementById('cart-counter')) {
            document.getElementById('cart-counter').textContent = itemsQty;
        }

        localStorage.setItem('hh_carrito_cantidad', String(itemsQty));
        if (window.HuertoHogar && typeof window.HuertoHogar.utils?.actualizarBadgeCarrito === 'function') {
            window.HuertoHogar.utils.actualizarBadgeCarrito();
        }
    }

    function normalizeDigits(value) {
        return String(value || '').replace(/\D/g, '');
    }

    function formatCardInput(value) {
        const digits = normalizeDigits(value).slice(0, 16);
        const groups = [];
        for (let i = 0; i < digits.length; i += 4) {
            groups.push(digits.slice(i, i + 4));
        }
        return groups.join(' ');
    }

    function formatExpiryInput(value) {
        const digits = normalizeDigits(value).slice(0, 4);
        if (digits.length <= 2) return digits;
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    function setPaymentMessage(text, valid) {
        const message = document.getElementById('card-message');
        if (!message) return;
        message.textContent = text || '';
        message.classList.remove('payment-message-success', 'payment-message-error');
        if (text) {
            message.classList.add(valid ? 'payment-message-success' : 'payment-message-error');
        }
    }

    function validateCardPayment() {
        const name = document.getElementById('card-name')?.value.trim() || '';
        const number = normalizeDigits(document.getElementById('card-number')?.value || '');
        const expiry = document.getElementById('card-expiry')?.value.trim() || '';
        const cvv = normalizeDigits(document.getElementById('card-cvv')?.value || '');

        if (!name || !number || !expiry || !cvv) {
            setPaymentMessage('Completa todos los datos de la tarjeta para continuar.', false);
            return false;
        }

        if (number.length !== 16) {
            setPaymentMessage('El número de tarjeta debe tener 16 dígitos.', false);
            return false;
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
            setPaymentMessage('La fecha de vencimiento debe tener formato MM/AA.', false);
            return false;
        }

        const [month, year] = expiry.split('/').map(Number);
        const now = new Date();
        const expiryDate = new Date(2000 + year, month, 0, 23, 59, 59);
        if (expiryDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
            setPaymentMessage('La tarjeta está vencida.', false);
            return false;
        }

        if (cvv.length < 3 || cvv.length > 4) {
            setPaymentMessage('El CVV debe tener 3 o 4 dígitos.', false);
            return false;
        }

        setPaymentMessage('Pago con tarjeta válido.', true);
        return true;
    }

    function bindPaymentValidation() {
        const name = document.getElementById('card-name');
        const number = document.getElementById('card-number');
        const expiry = document.getElementById('card-expiry');
        const cvv = document.getElementById('card-cvv');

        if (!name && !number && !expiry && !cvv) return;

        [name, number, expiry, cvv].forEach((field) => {
            if (!field) return;
            field.addEventListener('input', () => {
                if (field === number) field.value = formatCardInput(field.value);
                if (field === expiry) field.value = formatExpiryInput(field.value);
                validateCardPayment();
            });
        });
    }

    // Crea un código, guarda una copia del pedido y muestra la boleta final.
    function confirmOrder() {
        const cart = getCart();
        if (!cart.length) {
            alert('Agrega al menos un producto antes de confirmar el pedido.');
            return;
        }

        if (!validateCardPayment()) {
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + Number(item.precio) * Number(item.qty), 0);
        const shipping = subtotal >= 25000 ? 0 : 2990;
        const iva = subtotal * 0.19;
        const usuarioActivo = (() => {
            try {
                return JSON.parse(localStorage.getItem('sesion_activa') || 'null');
            } catch (error) {
                return null;
            }
        })();
        const order = {
            code: `HH-${Math.floor(10000 + Math.random() * 90000)}`,
            createdAt: new Date().toISOString(),
            delivery: document.querySelector('.date-select')?.value || 'Fecha por confirmar',
            items: cart,
            subtotal,
            iva,
            shipping,
            total: subtotal + iva + shipping,
            status: 1,
            cliente: usuarioActivo ? {
                nombre: usuarioActivo.nombre || 'Cliente',
                correo: usuarioActivo.correo || '',
                telefono: usuarioActivo.telefono || ''
            } : { nombre: 'Cliente', correo: '', telefono: '' }
        };
        localStorage.setItem('hh_ultimo_pedido', JSON.stringify(order));
        localStorage.setItem('hh_pedidos', JSON.stringify([order, ...getStoredOrders()]));
        localStorage.removeItem('hh_carrito');
        renderCart();
        showReceipt(order);
    }

    // Recupera pedidos anteriores sin romper el flujo si localStorage tiene datos inválidos.
    function getStoredOrders() {
        try { return JSON.parse(localStorage.getItem('hh_pedidos') || '[]'); } catch (error) { return []; }
    }

    // Coloca los datos guardados en la boleta y la muestra centrada en la página.
    function showReceipt(order) {
        const overlay = document.getElementById('receipt-overlay');
        if (!overlay) return;
        document.getElementById('receipt-code').textContent = order.code;
        document.getElementById('receipt-delivery').textContent = order.delivery;
        document.getElementById('receipt-total').textContent = `$${order.total.toLocaleString('es-CL')} CLP`;
        document.getElementById('receipt-track').href = `seguimiento.html?codigo=${encodeURIComponent(order.code)}`;
        overlay.hidden = false;
        document.body.classList.add('receipt-open');
    }

    // Conecta confirmar pedido y las acciones secundarias de la boleta.
    function initOrderReceipt() {
        document.getElementById('btn-confirmar-pedido')?.addEventListener('click', confirmOrder);
        const overlay = document.getElementById('receipt-overlay');
        const close = () => { if (overlay) overlay.hidden = true; document.body.classList.remove('receipt-open'); };
        document.getElementById('receipt-close')?.addEventListener('click', close);
        document.getElementById('receipt-continue')?.addEventListener('click', () => { window.location.href = 'productos.html'; });
    }

    // Registra botones dinámicos de aumentar, disminuir, eliminar y añadir productos.
    function initCart() {
        document.addEventListener('click', (e) => {
            const target = e.target;

            if (target.classList.contains('btn-plus')) {
                const card = target.closest('.cart-card');
                if (!card) return;
                const id = card.getAttribute('data-id');
                const cart = getCart();
                const item = cart.find(product => product.id === id);
                if (item) {
                    item.qty = Number(item.qty || 1) + 1;
                    saveCart(cart);
                    renderCart();
                }
                return;
            }

            if (target.classList.contains('btn-minus')) {
                const card = target.closest('.cart-card');
                if (!card) return;
                const id = card.getAttribute('data-id');
                const cart = getCart();
                const item = cart.find(product => product.id === id);
                if (item) {
                    item.qty = Number(item.qty || 1) - 1;
                    if (item.qty <= 0) {
                        const filtered = cart.filter(product => product.id !== id);
                        saveCart(filtered);
                        renderCart();
                    } else {
                        saveCart(cart);
                        renderCart();
                    }
                }
                return;
            }

            if (target.classList.contains('remove-btn')) {
                const card = target.closest('.cart-card');
                if (!card) return;
                const id = card.getAttribute('data-id');
                const filtered = getCart().filter(product => product.id !== id);
                saveCart(filtered);
                renderCart();
                return;
            }

            if (target.closest('.feature-btn')) {
                const card = target.closest('.feature-card');
                if (!card) return;
                const item = {
                    id: card.dataset.id || `home-${Date.now()}`,
                    nombre: card.dataset.name || card.querySelector('h3')?.textContent || 'Producto',
                    precio: Number(card.dataset.price || card.querySelector('.unit-price')?.textContent.replace(/[^\d]/g, '') || 0),
                    imagen: card.querySelector('img')?.src || 'img/manzanas-fuji.png',
                    cantidad: 1
                };

                addToCart(item);
                target.textContent = '✓ Añadido';
                setTimeout(() => { target.textContent = 'Añadir al Carrito'; }, 1000);
            }
        });

        renderCart();
        bindPaymentValidation();
        initOrderReceipt();
        if (window.HuertoHogar && typeof window.HuertoHogar.utils?.actualizarBadgeCarrito === 'function') {
            window.HuertoHogar.utils.actualizarBadgeCarrito();
        }
    }

    window.HuertoHogar = window.HuertoHogar || {};
    window.HuertoHogar.addToCart = addToCart;
    window.HuertoHogar.renderCart = renderCart;
    window.HuertoHogar.initCart = initCart;
})();
