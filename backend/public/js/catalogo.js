document.addEventListener('DOMContentLoaded', () => {

    const botones = document.querySelectorAll('.btn-agregar');

    botones.forEach(boton => {
        boton.addEventListener('click', (evento) => {
            const btnClickeado = evento.target;
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
        });
    });
});