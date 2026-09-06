(function () {
    window.HuertoHogar = window.HuertoHogar || {};

    if (window.HuertoHogar._coreInitialized) return;
    window.HuertoHogar._coreInitialized = true;

    const utils = {
        escaparHTML(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },

        getStorageItem(key, fallback = null) {
            try {
                const value = localStorage.getItem(key);
                return value === null ? fallback : JSON.parse(value);
            } catch (error) {
                return fallback;
            }
        },

        setStorageItem(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.warn('No se pudo guardar en localStorage:', error);
            }
        },

        actualizarBadgeCarrito() {
            let cantidad = 0;
            try {
                const cart = JSON.parse(localStorage.getItem('hh_carrito') || '[]');
                cantidad = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
            } catch (error) {
                cantidad = parseInt(localStorage.getItem('hh_carrito_cantidad') || '0', 10);
            }

            localStorage.setItem('hh_carrito_cantidad', String(cantidad));
            document.querySelectorAll('#cart-counter').forEach(el => {
                el.textContent = cantidad;
            });
        }
    };

    window.HuertoHogar.utils = utils;

    window.HuertoHogar.initCore = function () {
        utils.actualizarBadgeCarrito();
    };
})();
