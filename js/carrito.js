// Cargar carrito desde localStorage
let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];

// Referencias del DOM
const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");

const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");

// Formateador de moneda ARS (puntos para miles) 
function formatARS(value) {
  try {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Number(value) || 0);
  } catch (e) {
    // Fallback manual por si Intl no está disponible
    const n = Math.round(Number(value) || 0).toString();
    return n.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}

// Render inicial
cargarProductosCarrito();

// Dibuja los productos del carrito con controles de cantidad (+/-) e input numErico
function cargarProductosCarrito() {
    if (productosEnCarrito && productosEnCarrito.length > 0) {
        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");

        contenedorCarritoProductos.innerHTML = "";

        productosEnCarrito.forEach((producto) => {
            const subtotal = producto.precio * producto.cantidad;

            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.dataset.id = producto.id;
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <div class="qty">
                        <button class="qty-btn" data-op="minus" aria-label="Restar cantidad">-</button>
                        <input class="qty-input" type="number" min="1" value="${producto.cantidad}" aria-label="Cantidad" />
                        <button class="qty-btn" data-op="plus" aria-label="Sumar cantidad">+</button>
                    </div>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>$${formatARS(producto.precio)}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p class="subtotal">$${formatARS(subtotal)}</p>
                </div>
                <button class="carrito-producto-eliminar" title="Eliminar" aria-label="Eliminar"><i class="bi bi-trash-fill"></i></button>
            `;

            contenedorCarritoProductos.append(div);
        });

        actualizarTotal();
    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }
}

// DelegaciOn de eventos para +/-, input y eliminar
contenedorCarritoProductos.addEventListener("click", (e) => {
    const row = e.target.closest(".carrito-producto");
    if (!row) return;
    const id = row.dataset.id;

    if (e.target.classList.contains("carrito-producto-eliminar") || e.target.closest(".carrito-producto-eliminar")) {
        eliminarProducto(id);
        return;
    }

    if (e.target.classList.contains("qty-btn")) {
        const op = e.target.dataset.op;
        const input = row.querySelector(".qty-input");
        let val = parseInt(input.value) || 1;
        val = op === "plus" ? val + 1 : Math.max(1, val - 1);
        input.value = val;
        actualizarCantidad(id, val);
    }
});

// Cambio manual en el input de cantidad
contenedorCarritoProductos.addEventListener("change", (e) => {
    if (e.target.classList.contains("qty-input")) {
        const row = e.target.closest(".carrito-producto");
        const id = row.dataset.id;
        const nueva = Math.max(1, parseInt(e.target.value) || 1);
        e.target.value = nueva;
        actualizarCantidad(id, nueva);
    }
});

// Eliminar un producto
function eliminarProducto(id) {
    productosEnCarrito = productosEnCarrito.filter(p => String(p.id) !== String(id));
    persistir();
    cargarProductosCarrito();
}

// Vaciar
botonVaciar?.addEventListener("click", () => {
    productosEnCarrito = [];
    persistir();
    cargarProductosCarrito();
});

// Comprar
botonComprar?.addEventListener("click", comprarCarrito);

function comprarCarrito() {
    productosEnCarrito = [];
    persistir();
    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.remove("disabled");
}

// Actualiza cantidad, subtotales y total
function actualizarCantidad(id, nuevaCantidad) {
    const item = productosEnCarrito.find(p => String(p.id) === String(id));
    if (!item) return;
    item.cantidad = nuevaCantidad;

    // Actualizar subtotal de la fila sin re-render completo
    const row = contenedorCarritoProductos.querySelector(`.carrito-producto[data-id="${CSS.escape(String(id))}"]`);
    if (row) {
        const subtotalEl = row.querySelector(".subtotal");
        if (subtotalEl) subtotalEl.textContent = `$${item.precio * item.cantidad}`;
    }

    persistir();
    actualizarTotal();
}

// Total general
function actualizarTotal() {
    const totalCalculado = productosEnCarrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    if (contenedorTotal) contenedorTotal.innerText = `$${formatARS(totalCalculado)}`;
}

// Guardar en storage
function persistir() {
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}
