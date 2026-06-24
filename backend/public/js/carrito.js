document.addEventListener('DOMContentLoaded', () => {
    const listaCarrito = document.getElementById('lista-carrito');
    const precioTotal = document.getElementById('precio-total');
    const inputCarritoData = document.getElementById('input-carrito-data');
    const btnConfirmarPago = document.getElementById('btn-confirmar-pago');
    const btnFinalizarCompra = document.getElementById('btn-finalizar-compra');
    const totalModal = document.getElementById('total-modal');
    const formCheckout = document.getElementById('form-checkout');
    const modalConfirmacion = new bootstrap.Modal(document.getElementById('modalConfirmacion'));

    let carrito = JSON.parse(localStorage.getItem('carrito_gym')) || [];

    function renderizarCarrito() {
        listaCarrito.innerHTML = '';
        let total = 0;

        if (carrito.length === 0) {
            listaCarrito.innerHTML = `
                <div class="alert alert-secondary text-center fw-bold rounded-3 py-4">
                    🛒 Tu carrito está vacío. ¡Volvé al catálogo para sumar productos!
                </div>`;
            precioTotal.textContent = '0';
            btnConfirmarPago.disabled = true;
            inputCarritoData.value = '';
            return;
        }

        btnConfirmarPago.disabled = false;

        carrito.forEach((producto, index) => {
            const subtotal = producto.precio * producto.cantidad;
            total += subtotal;

            const itemHTML = `
                <div class="card w-100 mb-3 border-0 shadow-sm bg-body-tertiary overflow-hidden">
                    <div class="d-flex align-items-center justify-content-between p-3">
                        <div class="d-flex align-items-center gap-3 flex-grow-1">
                            <div class="d-flex flex-column w-75 py-2 text-start">
                                <span class="fs-5 fw-bold">${producto.nombre}</span>
                                <span class="fst-italic small text-muted">Cantidad: ${producto.cantidad} x $${producto.precio}</span>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-3 pe-3">
                            <span class="fw-bold fs-5 text-primary">$${subtotal}</span>
                            <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar" data-index="${index}">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
            listaCarrito.innerHTML += itemHTML;
        });

        precioTotal.textContent = total.toFixed(2);
        totalModal.textContent = total.toFixed(2);

        inputCarritoData.value = JSON.stringify(carrito);

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('button').getAttribute('data-index');
                carrito.splice(index, 1);
                localStorage.setItem('carrito_gym', JSON.stringify(carrito));
                renderizarCarrito();
            });
        });
    }

    renderizarCarrito();

    btnConfirmarPago.addEventListener('click', () => {
        modalConfirmacion.show();
    });

    btnFinalizarCompra.addEventListener('click', () => {
        formCheckout.submit();
    });
});