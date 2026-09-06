(function () {
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('hh_carrito') || '[]');
        } catch (error) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem('hh_carrito', JSON.stringify(cart));
    }

    function addToCart(item) {
        const cart = getCart();
        const normalizedItem = {
            id: item.id,
            nombre: item.nombre || 'Producto',
            precio: Number(item.precio) || 0,
            imagen: item.imagen || 'img/producto1.jpg',
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

    function renderCart() {
        const cartItems = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        const totalCount = document.getElementById('total-count');
        const subtotalText = document.getElementById('subtotal-text');
        const totalText = document.getElementById('total-text');
        const shippingText = document.getElementById('shipping-text');
        const freeShippingLbl = document.getElementById('free-shipping-lbl');
        const co2Value = document.getElementById('co2-value');

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
                    imagen: card.querySelector('img')?.src || 'img/producto1.jpg',
                    cantidad: 1
                };

                addToCart(item);
                target.textContent = '✓ Añadido';
                setTimeout(() => { target.textContent = 'Añadir al Carrito'; }, 1000);
            }
        });

        renderCart();
        if (window.HuertoHogar && typeof window.HuertoHogar.utils?.actualizarBadgeCarrito === 'function') {
            window.HuertoHogar.utils.actualizarBadgeCarrito();
        }
    }

    window.HuertoHogar = window.HuertoHogar || {};
    window.HuertoHogar.addToCart = addToCart;
    window.HuertoHogar.renderCart = renderCart;
    window.HuertoHogar.initCart = initCart;
})();
