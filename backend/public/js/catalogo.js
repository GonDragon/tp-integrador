/**
 * catalogo.js
 * Gestiona la carga dinámica del catálogo desde `/api/productos` con paginación
 * y filtrado por categoría enviados al servidor.
 */
document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedor-productos');
    const contenedorPaginacion = document.getElementById('paginacion-contenedor');
    
    let currentPage = 1;
    let currentCategory = '';

    async function cargarProductos() {
        let productos = [];
        let pagination = null;
        
        try {
            // Construir URL con paginación y categoría
            let url = `/api/productos?page=${currentPage}&limit=4`;
            if (currentCategory) {
                url += `&categoria=${encodeURIComponent(currentCategory)}`;
            }

            const respuesta = await fetch(url);
            const data = await respuesta.json();
            productos = data.data || [];
            pagination = data.pagination;
            
        } catch (error) {
            console.error("Error al cargar productos:", error);
            contenedor.innerHTML = '<div class="col-12 text-center mt-5"><h4 class="text-danger">Error al cargar el catálogo de suplementos.</h4></div>';
            return;
        }

        renderProductos(productos);
        if (pagination) {
            renderPaginacion(pagination);
        }
    }

    function renderProductos(lista) {
        contenedor.innerHTML = '';

        if (!lista || lista.length === 0) {
            contenedor.innerHTML = '<div class="col-12 text-center mt-5"><h4 class="text-muted">No hay productos disponibles en esta vista.</h4></div>';
            return;
        }

        lista.forEach(producto => {
            const cardHtml = `
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="card h-100 border-0 shadow-sm bg-body-tertiary text-start">
                        <img src="/img/productos/${producto.imagen}" class="card-img-top p-3" alt="${producto.nombre}" style="height: 200px; object-fit: contain;">
                        
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title fw-bold mb-2">${producto.nombre}</h5>
                            <p class="card-text flex-grow-1 mb-3 small text-muted">${producto.detalles}</p>
                            
                            <div class="mb-3">
                                <span class="fs-5 fw-bold">$${producto.precio}</span>
                            </div>
                            
                            <div class="mt-auto">
                                <button class="btn btn-primary fw-bold w-100 rounded-2 text-uppercase btn-agregar" 
                                        data-id="${producto.id}" 
                                        data-nombre="${producto.nombre}" 
                                        data-precio="${producto.precio}">
                                    Agregar al carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            contenedor.innerHTML += cardHtml;
        });
    }

    function renderPaginacion(pag) {
        contenedorPaginacion.innerHTML = '';
        if (pag.totalPages <= 1) return; // No mostrar si solo hay 1 página

        const prevDisabled = pag.hasPrevPage ? '' : 'disabled';
        const nextDisabled = pag.hasNextPage ? '' : 'disabled';

        contenedorPaginacion.innerHTML = `
            <button class="btn btn-outline-primary fw-bold px-4 rounded-pill" id="btn-prev" ${prevDisabled}>
                ⬅️ Anterior
            </button>
            <span class="fw-bold text-muted mx-3">Página ${pag.page} de ${pag.totalPages}</span>
            <button class="btn btn-outline-primary fw-bold px-4 rounded-pill" id="btn-next" ${nextDisabled}>
                Siguiente ➡️
            </button>
        `;

        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');

        if (btnPrev) btnPrev.addEventListener('click', () => {
            if (pag.hasPrevPage) {
                currentPage--;
                cargarProductos();
            }
        });

        if (btnNext) btnNext.addEventListener('click', () => {
            if (pag.hasNextPage) {
                currentPage++;
                cargarProductos();
            }
        });
    }

    // Configurar listeners para filtros de categoría
    const botonesCat = document.querySelectorAll('.btn-categoria');
    botonesCat.forEach(btn => {
        btn.addEventListener('click', () => {
            const categoria = btn.getAttribute('data-category');
            
            // Si ya está activa, la desmarcamos (mostrar todos)
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                currentCategory = '';
            } else {
                botonesCat.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = categoria;
            }
            
            currentPage = 1; // Volver a la página 1 al filtrar
            cargarProductos();
        });
    });

    // Carga inicial
    cargarProductos();

    // Lógica del carrito (delegación de eventos)
    contenedor.addEventListener('click', (evento) => {
        const btnClickeado = evento.target.closest('.btn-agregar');
        
        if (btnClickeado) {
            const id = btnClickeado.getAttribute('data-id');
            const nombre = btnClickeado.getAttribute('data-nombre');
            const precio = parseFloat(btnClickeado.getAttribute('data-precio'));

            let carrito = JSON.parse(localStorage.getItem('carrito_gym')) || [];
            const productoExistente = carrito.find(item => item.id === id);

            if (productoExistente) {
                productoExistente.cantidad += 1;
            } else {
                carrito.push({ id, nombre, precio, cantidad: 1 });
            }

            localStorage.setItem('carrito_gym', JSON.stringify(carrito));
            alert(`¡Sumaste 1x ${nombre} al carrito!`);
        }
    });
});