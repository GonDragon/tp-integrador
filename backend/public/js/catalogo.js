document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedor-productos');

    async function cargarProductos() {
        try {
            const respuesta = await fetch('/api/productos');
            const productos = await respuesta.json();

            contenedor.innerHTML = '';

            if (productos.length === 0) {
                contenedor.innerHTML = '<div class="col-12 text-center mt-5"><h4 class="text-muted">Todavía no hay productos cargados en el catálogo.</h4></div>';
                return;
            }

            productos.forEach(producto => {
                const cardHtml = `
                    <div class="col-12 col-md-6 col-lg-3">
                        <div class="card h-100 border-0 shadow-sm bg-body-tertiary text-start">
                            <img src="/img/${producto.imagen}" class="card-img-top p-3" alt="${producto.nombre}" style="height: 200px; object-fit: contain;">
                            
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

        } catch (error) {
            console.error("Error al cargar productos:", error);
            contenedor.innerHTML = '<div class="col-12 text-center mt-5"><h4 class="text-danger">Error al cargar el catálogo de suplementos.</h4></div>';
        }
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