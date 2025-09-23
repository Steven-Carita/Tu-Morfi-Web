// se carga del localStorage el carrito guardado de la sesion anterior
let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito);

// referencias a los contenedores y botones que se usan en la pagina del carrito
const contenedorCarritoVacio = document.querySelector("#carrito-vacio");

const contenedorCarritoProductos = document.querySelector("#carrito-productos");

const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");

const contenedorCarritoComprado = document.querySelector("#carrito-comprado");

let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

const botonVaciar = document.querySelector("#carrito-acciones-vaciar");

const contenedorTotal = document.querySelector("#total");

const botonComprar = document.querySelector("#carrito-acciones-comprar");


// esta funcion dibuja en pantalla los productos que estan en el carrito
// si hay productos muestra la lista con cantidad precio subtotal y botones para eliminar
// si no hay productos muestra el mensaje de carrito vacio

function cargarProductosCarrito() {
    if (productosEnCarrito && productosEnCarrito.length > 0) {

        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");

        contenedorCarritoProductos.innerHTML = "";

        productosEnCarrito.forEach(producto => {

            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <p>${producto.cantidad}</p>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>$${producto.precio}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>$${producto.precio * producto.cantidad}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
            `;

            // Nota: los botones + y - permiten cambiar cantidad, luego se recalcula total y se persiste

            contenedorCarritoProductos.append(div);
        })

        actualizarBotonesEliminar();
        actualizarTotal();

    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }

}

cargarProductosCarrito();

// esta funcion vuelve a tomar todos los botones eliminar y les asigna el evento de borrar producto

function actualizarBotonesEliminar() {


    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

    botonesEliminar.forEach(boton => {

        boton.addEventListener("click", eliminarDelCarrito);
    });
}

// esta funcion elimina un producto del carrito cuando se presiona el boton de la papelera
// actualiza la interfaz y vuelve a guardar el estado en localStorage
function eliminarDelCarrito(e) {
    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);

    productosEnCarrito.splice(index, 1);
    cargarProductosCarrito();

   
    // guarda el carrito actualizado para no perderlo al recargar
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

}

// al hacer click en el boton Vaciar se borra todo el carrito y se actualiza la vista
botonVaciar.addEventListener("click", vaciarCarrito);


// elimina todos los productos borra storage y muestra estado vacio
function vaciarCarrito() {
    productosEnCarrito.length = 0;
    // Almacenamiento local: uso de localStorage
    // guarda el carrito actualizado para no perderlo al recargar
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    cargarProductosCarrito();
}


// esta funcion calcula la suma total de todos los productos y la muestra en pantalla
function actualizarTotal() {
    const totalCalculado = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    total.innerText = `$${totalCalculado}`;
}

// al hacer click en Comprar se simula la compra, se vacia el carrito y se muestra mensaje de confirmacion
botonComprar.addEventListener("click", comprarCarrito);

// simula compra exitosa vacia storage y muestra mensaje
function comprarCarrito() {

    productosEnCarrito.length = 0;
 
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.remove("disabled");

}