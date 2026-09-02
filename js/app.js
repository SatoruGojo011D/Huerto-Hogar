document.addEventListener('DOMContentLoaded', () => {
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
            const qty = parseInt(card.querySelector('.qty-val').textContent);
            const unitPrice = parseInt(card.getAttribute('data-unit-price'));
            const cardSubtotal = qty * unitPrice;

            card.querySelector('.item-total-price').textContent = `$${cardSubtotal.toLocaleString('es-CL')} CLP`;

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
            if (missing > 0) {
                freeShippingLbl.textContent = `Suma $${missing.toLocaleString('es-CL')} CLP más para despacho gratis.`;
            } else {
                freeShippingLbl.textContent = `¡Tu envío es gratis!`;
            }
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
});