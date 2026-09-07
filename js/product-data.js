/* Productos: fuente de datos del catálogo, detalle dinámico y reseñas por producto. */
(function () {
    // Cada objeto contiene la información propia que se muestra en su página de detalle.
    const productos = [
        {
            id: 'FR001', nombre: 'Manzanas Fuji', categoria: 'Frutas Frescas', precio: 1200, unidad: 'kg', stock: '150 kg',
            origen: 'Valle del Maule', imagen: 'img/manzanas-fuji.png',
            descripcion: 'Manzanas crocantes y jugosas, recien cosechadas. Ideales para colaciones sanas.',
            practicas: 'Cultivo local con manejo responsable del suelo y cosecha de temporada.',
            impacto: 'Huella de carbono baja gracias a su produccion y distribucion local.'
        },
        {
            id: 'FR002', nombre: 'Naranjas Valencia', categoria: 'Frutas Frescas', precio: 1000, unidad: 'kg', stock: '200 kg',
            origen: 'Valle de Azapa', imagen: 'img/naranjas.jpg',
            descripcion: 'Naranjas dulces con alto contenido de jugo y vitamina C natural.',
            practicas: 'Produccion de temporada con seleccion manual de cada fruto.',
            impacto: 'Producto de temporada que reduce el uso de almacenamiento prolongado.'
        },
        {
            id: 'FR003', nombre: 'Platanos Cavendish', categoria: 'Frutas Frescas', precio: 800, unidad: 'kg', stock: '250 kg',
            origen: 'Importacion Directa', imagen: 'img/platanos.jpg',
            descripcion: 'Platanos de textura suave y maduracion perfecta para batidos y reposteria.',
            practicas: 'Seleccionados por madurez para evitar desperdicios en el hogar.',
            impacto: 'Distribucion planificada para conservar la frescura y reducir mermas.'
        },
        {
            id: 'VR001', nombre: 'Zanahorias Organicas', categoria: 'Verduras Organicas', precio: 900, unidad: 'kg', stock: '100 kg',
            origen: "Region de O'Higgins", imagen: 'img/zanahorias.png',
            descripcion: 'Cultivadas sin pesticidas en suelos ricos en nutrientes. Sabor intenso y textura firme.',
            practicas: 'Manejo organico y cuidado del suelo durante todo el cultivo.',
            impacto: 'Cultivo cercano que favorece recorridos de entrega mas cortos.'
        },
        {
            id: 'VR002', nombre: 'Espinacas Frescas', categoria: 'Verduras Organicas', precio: 700, unidad: 'bolsa 500 g', stock: '80 bolsas',
            origen: 'Melipilla', imagen: 'img/espinaca.png',
            descripcion: 'Hojas verdes lavadas, listas para ensaladas o salteados llenos de hierro.',
            practicas: 'Cosecha cuidadosa y empaque practico para conservar sus hojas.',
            impacto: 'Se entrega fresca para reducir el desperdicio por perdida de calidad.'
        },
        {
            id: 'VR003', nombre: 'Pimientos Tricolores', categoria: 'Verduras Organicas', precio: 1500, unidad: 'kg', stock: '120 kg',
            origen: 'Limache', imagen: 'img/pimentones.jpg',
            descripcion: 'Surtido de pimientos rojo, verde y amarillo de cultivo bajo invernadero.',
            practicas: 'Cultivo protegido con uso eficiente del agua y cosecha manual.',
            impacto: 'Produccion local que disminuye la distancia entre huerto y hogar.'
        },
        {
            id: 'PO001', nombre: 'Miel Organica', categoria: 'Productos Organicos', precio: 5000, unidad: 'frasco 500 g', stock: '50 frascos',
            origen: 'Apicultores locales', imagen: 'img/miel-organica.png',
            descripcion: 'Miel multifloral 100% pura y no procesada de apicultores locales.',
            practicas: 'Apicultura responsable que protege las colmenas y la biodiversidad.',
            impacto: 'Apoya la polinizacion y el trabajo de productores de la zona.'
        },
        {
            id: 'PO003', nombre: 'Quinua Organica', categoria: 'Productos Organicos', precio: 3200, unidad: 'kg', stock: '60 kg',
            origen: 'Altiplano Chileno', imagen: 'img/quinoa.jpg',
            descripcion: 'Superalimento andino rico en proteinas, fibra y libre de gluten.',
            practicas: 'Cultivo tradicional con seleccion y limpieza cuidadosa del grano.',
            impacto: 'Producto seco de larga duracion que ayuda a evitar desperdicios.'
        },
        {
            id: 'PL001', nombre: 'Leche Entera', categoria: 'Productos Lacteos', precio: 1800, unidad: 'botella 1 L', stock: '90 botellas',
            origen: 'Granjas de Osorno', imagen: 'img/leche.jpg',
            descripcion: 'Leche de libre pastoreo, pasteurizada y fresca del dia.',
            practicas: 'Producida por granjas familiares con cuidado del ganado y envases retornables.',
            impacto: 'Envase retornable y abastecimiento directo desde granjas locales.'
        }
    ];

    // Busca el producto solicitado mediante el parámetro id de la URL.
    function getProduct(id) {
        return productos.find(producto => producto.id === id) || productos[0];
    }

    function escapeHtml(value) {
        return window.HuertoHogar?.utils?.escaparHTML
            ? window.HuertoHogar.utils.escaparHTML(value)
            : String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
    }

    // Recupera únicamente las reseñas asociadas al producto indicado.
    function getReviews(productId) {
        try {
            return JSON.parse(localStorage.getItem(`hh_resenas_${productId}`) || '[]');
        } catch (error) {
            return [];
        }
    }

    // Guarda una reseña nueva sin mezclarla con las de otros productos.
    function saveReview(productId, review) {
        const reviews = getReviews(productId);
        reviews.unshift(review);
        localStorage.setItem(`hh_resenas_${productId}`, JSON.stringify(reviews));
        return reviews;
    }

    // Calcula el promedio y dibuja la lista de comentarios del producto.
    function renderReviews(productId, summaryElement, listElement) {
        const reviews = getReviews(productId);
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        const average = reviews.length ? (total / reviews.length).toFixed(1) : 'Sin calificaciones';

        if (summaryElement) {
            summaryElement.textContent = reviews.length
                ? `${'★'.repeat(Math.round(total / reviews.length))} ${average}/5 (${reviews.length} reseña${reviews.length === 1 ? '' : 's'})`
                : 'Este producto todavía no tiene reseñas.';
        }

        if (!listElement) return;
        listElement.innerHTML = reviews.length
            ? reviews.map(review => `
                <article class="item-resena">
                    <strong>${escapeHtml(review.author)}</strong>
                    <span class="estrellas-val">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                    <p>${escapeHtml(review.comment)}</p>
                </article>
            `).join('')
            : '<p class="sin-resenas">Sé la primera persona en opinar sobre este producto.</p>';
    }

    // Conecta las estrellas, el textarea y el botón que publica la reseña.
    function setupReviewForm(product) {
        const form = document.getElementById('form-resena');
        const selector = document.getElementById('selector-estrellas');
        const textarea = document.getElementById('texto-resena');
        const summary = document.getElementById('resumen-calificacion');
        const list = document.getElementById('lista-resenas-contenedor');
        const message = document.getElementById('mensaje-resena');
        let selectedRating = 0;

        if (!form || !selector || !textarea) return;

        const updateStars = () => selector.querySelectorAll('span').forEach(star => {
            star.classList.toggle('activa', Number(star.dataset.value) <= selectedRating);
        });

        selector.addEventListener('click', event => {
            const star = event.target.closest('span');
            if (!star) return;
            selectedRating = Number(star.dataset.value);
            updateStars();
        });

        selector.addEventListener('keydown', event => {
            const star = event.target.closest('span');
            if (!star || (event.key !== 'Enter' && event.key !== ' ')) return;
            event.preventDefault();
            selectedRating = Number(star.dataset.value);
            updateStars();
        });

        form.addEventListener('submit', event => {
            event.preventDefault();
            const comment = textarea.value.trim();
            if (!selectedRating || !comment) {
                if (message) message.textContent = 'Selecciona una calificación y escribe una reseña.';
                return;
            }

            let activeUser = null;
            try { activeUser = JSON.parse(localStorage.getItem('sesion_activa') || 'null'); } catch (error) { activeUser = null; }
            saveReview(product.id, {
                rating: selectedRating,
                comment,
                author: activeUser?.nombre || 'Cliente de HuertoHogar',
                date: new Date().toLocaleDateString('es-CL')
            });
            textarea.value = '';
            selectedRating = 0;
            updateStars();
            if (message) message.textContent = 'Tu reseña fue publicada.';
            renderReviews(product.id, summary, list);
        });

        renderReviews(product.id, summary, list);
    }

    // Rellena la página de detalle con los datos del producto seleccionado.
    function renderDetailPage() {
        const detail = document.getElementById('detalle-producto');
        if (!detail) return;

        const product = getProduct(new URLSearchParams(window.location.search).get('id'));
        document.title = `HuertoHogar | ${product.nombre}`;
        const setText = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        const image = document.getElementById('detalle-imagen');
        if (image) {
            image.src = product.imagen;
            image.alt = product.nombre;
        }
        setText('detalle-codigo', `CODIGO: ${product.id}`);
        setText('detalle-categoria', product.categoria);
        setText('detalle-nombre', product.nombre);
        setText('detalle-precio', `$${product.precio.toLocaleString('es-CL')} CLP / ${product.unidad}`);
        setText('detalle-stock', `Stock disponible: ${product.stock}`);
        setText('detalle-descripcion', product.descripcion);
        setText('detalle-origen', product.origen);
        setText('detalle-practicas', product.practicas);
        setText('detalle-impacto', product.impacto);

        const quantity = document.getElementById('cantidad');
        if (quantity) quantity.max = parseInt(product.stock, 10) || 999;
        const addButton = document.getElementById('btn-agregar-detalle');
        if (addButton) addButton.addEventListener('click', () => {
            const amount = Math.max(1, Number(quantity?.value) || 1);
            window.HuertoHogar.addToCart({ ...product, cantidad: amount });
            addButton.textContent = 'Añadido al carrito';
            setTimeout(() => { addButton.textContent = 'Añadir al Carrito'; }, 1000);
        });

        setupReviewForm(product);
    }

    // Convierte el overlay Ver detalles en un enlace con el ID correcto.
    function initCatalogDetails() {
        const grid = document.getElementById('grid-productos');
        if (!grid) return;
        grid.addEventListener('click', event => {
            const details = event.target.closest('.overlay-detalles');
            if (!details) return;
            const card = details.closest('.producto-card');
            const id = card?.querySelector('.btn-agregar')?.dataset.id;
            if (id) window.location.href = `detalle-producto.html?id=${encodeURIComponent(id)}`;
        });
    }

    window.HuertoHogar = window.HuertoHogar || {};
    window.HuertoHogar.initProductData = function () {
        initCatalogDetails();
        renderDetailPage();
    };
})();
