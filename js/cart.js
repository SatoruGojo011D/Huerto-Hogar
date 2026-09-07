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
        const emptyCart = document.getElementById('empty-cart');
        const totalCount = document.getElementById('total-count');
        const subtotalText = document.getElementById('subtotal-text');
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

        const grandTotal = subtotal > 0 ? subtotal + shippingCost : 0;

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

    // Crea un código, guarda una copia del pedido y muestra la boleta final.
    function confirmOrder() {
        const cart = getCart();
        if (!cart.length) {
            alert('Agrega al menos un producto antes de confirmar el pedido.');
            return;
        }
        const subtotal = cart.reduce((sum, item) => sum + Number(item.precio) * Number(item.qty), 0);
        const shipping = subtotal >= 25000 ? 0 : 2990;
        const order = {
            code: `HH-${Math.floor(10000 + Math.random() * 90000)}`,
            createdAt: new Date().toISOString(),
            delivery: document.querySelector('.date-select')?.value || 'Fecha por confirmar',
            items: cart,
            subtotal,
            shipping,
            total: subtotal + shipping,
            status: 1
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
