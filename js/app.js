/* Arranque: espera a que exista el HTML y activa los módulos cargados en esa página. */
document.addEventListener('DOMContentLoaded', () => {
    // El orden importa: primero utilidades/datos, después módulos que dependen de ellos.
    if (window.HuertoHogar && typeof window.HuertoHogar.initCore === 'function') {
        window.HuertoHogar.initCore();
    }

    if (window.HuertoHogar && typeof window.HuertoHogar.initProductData === 'function') {
        window.HuertoHogar.initProductData();
    }

    if (window.HuertoHogar && typeof window.HuertoHogar.initCart === 'function') {
        window.HuertoHogar.initCart();
    }

    if (window.HuertoHogar && typeof window.HuertoHogar.initForms === 'function') {
        window.HuertoHogar.initForms();
    }

    if (window.HuertoHogar && typeof window.HuertoHogar.initAdmin === 'function') {
        window.HuertoHogar.initAdmin();
    }
});