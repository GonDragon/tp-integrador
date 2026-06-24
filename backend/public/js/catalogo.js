/**
 * catalogo.js
 * Gestiona la carga dinámica del catálogo desde `/api/productos` y el
 * filtrado cliente-side por categoría. Mantiene `productosGlobal` y
 * renderiza tarjetas en `#contenedor-productos`.
 */
document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedor-productos');
    let productosGlobal = [];

    async function cargarProductos() {
        let productos = [];
        try {
            const respuesta = await fetch('/api/productos');
            const data = await respuesta.json();
            productos = data.data || [];
            
            // Si la lista está vacía, forzamos el catch para cargar el dummy
            if (productos.length === 0) {
                throw new Error("La lista de productos está vacía");
            }
        } catch (error) {
            console.warn("Error o lista vacía al cargar desde /api/productos, intentando con /dummy.json:", error.message || error);
            try {
                const respuestaDummy = await fetch('/dummy.json');
                productos = await respuestaDummy.json();
            } catch (dummyError) {
                console.error("Error al cargar productos desde ambos orígenes:", dummyError);
                contenedor.innerHTML = '<div class="col-12 text-center mt-5"><h4 class="text-danger">Error al cargar el catálogo de suplementos.</h4></div>';
                return;
            }
        }

        productosGlobal = productos;
        renderProductos(productosGlobal);

        // Añadir listeners a botones de categoría (si existen)
        const botonesCat = document.querySelectorAll('.btn-categoria');
        botonesCat.forEach(btn => {
            btn.addEventListener('click', () => {
                const categoria = btn.getAttribute('data-category');
                if (!categoria) return;
                const filtrados = productosGlobal.filter(p => String(p.categoria) === String(categoria));
                renderProductos(filtrados);

                // marcar como activo visualmente
                botonesCat.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    function renderProductos(lista) {
        contenedor.innerHTML = '';

        if (!lista || lista.length === 0) {
            contenedor.innerHTML = '<div class="col-12 text-center mt-5"><h4 class="text-muted">No hay productos en esta categoría.</h4></div>';
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

    cargarProductos();

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