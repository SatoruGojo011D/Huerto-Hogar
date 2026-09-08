/* Núcleo compartido: crea el espacio global, maneja localStorage y actualiza el contador del carrito. */
(function () {
    window.HuertoHogar = window.HuertoHogar || {};

    if (window.HuertoHogar._coreInitialized) return;
    window.HuertoHogar._coreInitialized = true;

    // Utilidades reutilizables por carrito, autenticación, formularios y administración.
    const utils = {
        // Evita insertar texto del usuario como HTML cuando se renderizan datos dinámicos.
        escaparHTML(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },

        // Lee un valor JSON guardado y devuelve un respaldo si no existe o está corrupto.
        getStorageItem(key, fallback = null) {
            try {
                const value = localStorage.getItem(key);
                return value === null ? fallback : JSON.parse(value);
            } catch (error) {
                return fallback;
            }
        },

        // Guarda objetos y arreglos en localStorage usando formato JSON.
        setStorageItem(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.warn('No se pudo guardar en localStorage:', error);
            }
        },

        // Calcula las unidades del carrito y actualiza todos los contadores visibles.
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
