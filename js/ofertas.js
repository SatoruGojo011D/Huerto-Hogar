(function () {
    const productosOferta = [
        {
            id: 'OFERTA-1',
            nombre: 'Caja de Manzanas Fuji',
            descripcion: 'Paquete fresco con manzanas seleccionadas para el snack diario.',
            precio: 1500,
            precioOriginal: 2100,
            imagen: 'img/manzanas-fuji.png',
            categoria: 'Frutas'
        },
        {
            id: 'OFERTA-2',
            nombre: 'Lechuga Mixta',
            descripcion: 'Mezcla fresca de variedades ideales para ensaladas y batidos verdes.',
            precio: 1200,
            precioOriginal: 1700,
            imagen: 'img/espinaca.png',
            categoria: 'Verduras'
        },
        {
            id: 'OFERTA-3',
            nombre: 'Miel Orgánica',
            descripcion: 'Frasco 500g de miel pura y local, ideal para desayunos saludables.',
            precio: 3800,
            precioOriginal: 5000,
            imagen: 'img/miel-organica.png',
            categoria: 'Orgánicos'
        },
        {
            id: 'OFERTA-4',
            nombre: 'Zanahorias Orgánicas',
            descripcion: 'Zanahorias crocantes de cultivo responsable y envasadas al día.',
            precio: 700,
            precioOriginal: 950,
            imagen: 'img/zanahorias.png',
            categoria: 'Verduras'
        }
    ];

    function renderOfertas() {
        const section = document.getElementById('oferta-grid');
        if (!section) return;

        section.innerHTML = productosOferta.map(producto => {
            const descuento = Math.round(((producto.precioOriginal - producto.precio) / producto.precioOriginal) * 100);
            const precioOriginal = Number(producto.precioOriginal).toLocaleString('es-CL');
            const precioOferta = Number(producto.precio).toLocaleString('es-CL');

            return `
                <article class="oferta-card" data-id="${producto.id}">
                    <div class="oferta-card__top">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                        <span class="oferta-badge">-${descuento}%</span>
                    </div>
                    <div class="oferta-card__body">
                        <span class="eyebrow">${producto.categoria}</span>
                        <h3>${producto.nombre}</h3>
                        <p>${producto.descripcion}</p>
                        <div class="oferta-precios">
                            <span class="precio-normal">$${precioOriginal} CLP</span>
                            <span class="precio-oferta">$${precioOferta} CLP</span>
                        </div>
                        <div class="oferta-actions">
                            <button class="btn-checkout btn-agregar-oferta" type="button" data-id="${producto.id}" data-name="${producto.nombre}" data-price="${producto.precio}" data-image="${producto.imagen}">Añadir</button>
                            <a href="productos.html" class="btn-secondary">Ver más</a>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        section.querySelectorAll('.btn-agregar-oferta').forEach(button => {
            button.addEventListener('click', () => {
                const item = {
                    id: button.dataset.id,
                    nombre: button.dataset.name,
                    precio: Number(button.dataset.price) || 0,
                    imagen: button.dataset.image || 'img/manzanas-fuji.png',
                    cantidad: 1
                };

                if (window.HuertoHogar && typeof window.HuertoHogar.addToCart === 'function') {
                    window.HuertoHogar.addToCart(item);
                }

                const textoOriginal = button.textContent;
                button.textContent = '✓ Añadido';
                button.disabled = true;
                setTimeout(() => {
                    button.textContent = textoOriginal;
                    button.disabled = false;
                }, 1200);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', renderOfertas);
})();
