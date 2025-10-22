let productos = [];
fetch("../js/productos.json")
  .then(response => response.json())
  .then(data => {
    productos = data;
    cargarProductos(productos);
  })
  .catch(error => {
    console.error("Error al cargar los productos:", error);
  });




// SELECTORES CONSTANTES
const contenedorProductos = document.querySelector("#contenedor-productos");
const tituloPrincipal = document.querySelector("#titulo-principal") || { textContent: "" };
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const numerito = document.querySelector("#numerito");

//  Formateador de moneda ARS (puntos para miles)
function formatARS(value) {
  try {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Number(value) || 0);
  } catch (e) {
    // Fallback manual por si Intl no estA disponible
    const n = Math.round(Number(value) || 0).toString();
    return n.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}



// CARRITO 
let productosEnCarrito;
try {
  productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];
  if (!Array.isArray(productosEnCarrito)) productosEnCarrito = [];
} catch { productosEnCarrito = []; }

//RENDER 
function tarjetaProductoHTML(producto) {
  return `
    <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
    <div class="producto-detalles">
      <h3 class="producto-titulo">${producto.titulo}</h3>
      <p class="producto-precio">$${formatARS(producto.precio)}</p>

      <div class="qty-control" data-id="${producto.id}">
        <button class="qty-btn minus" data-id="${producto.id}">-</button>
        <input type="number" min="1" class="qty-input" data-id="${producto.id}" value="1">
        <button class="qty-btn plus" data-id="${producto.id}">+</button>
      </div>

      <button class="producto-agregar" id="${producto.id}" data-id="${producto.id}">Agregar</button>
    </div>`;
}

function cargarProductos(productosElegidos) {
  if (!contenedorProductos) return;
  contenedorProductos.innerHTML = "";
  productosElegidos.forEach(p => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = tarjetaProductoHTML(p);
    contenedorProductos.appendChild(div);
  });
  actualizarBotonesAgregar();
  attachQtyListenersProducts();
}

// QTY CONTROLS 
function attachQtyListenersProducts() {
  document.querySelectorAll(".qty-control").forEach(ctrl => {
    const id = ctrl.getAttribute("data-id");
    const input = ctrl.querySelector('.qty-input[data-id="' + id + '"]');
    const plus = ctrl.querySelector('.qty-btn.plus');
    const minus = ctrl.querySelector('.qty-btn.minus');
    plus?.addEventListener('click', () => { input.value = String((parseInt(input.value) || 1) + 1); });
    minus?.addEventListener('click', () => { const v = (parseInt(input.value) || 1) - 1; input.value = String(Math.max(1, v)); });
    input?.addEventListener('input', () => { const n = parseInt(input.value); if (isNaN(n) || n < 1) input.value = "1"; });
  });
}

//AGREGAR AL CARRITO 
let botonesAgregar = [];
function actualizarBotonesAgregar() {
  botonesAgregar = document.querySelectorAll(".producto-agregar");
  botonesAgregar.forEach(b => b.addEventListener("click", agregarAlCarrito));
}

function agregarAlCarrito(e) {


  Toastify({
  text: "Producto agregado",
  duration: 3000,
  close: true,
  gravity: "top", // `top` or `bottom`
  position: "right", // `left`, `center` or `right`
  stopOnFocus: true, // Prevents dismissing of toast on hover
  style: {
    background: "linear-gradient(to right, #dfb950ff, #c0ad57ff)",
    borderRadius: "2rem",
    textTransform: "uppercase",
    fontZize: ".75rem"
  },
  offset: {
    x: "3rem", // horizontal axis - can be a number or a string indicating unity. eg: '2em'
    y: "2rem" // vertical axis - can be a number or a string indicating unity. eg: '2em'
  },


  onClick: function(){} // Callback after click
}).showToast();





  const id = e.currentTarget.id;
  const input = document.querySelector('.qty-input[data-id="' + id + '"]');
  const cantidad = Math.max(1, parseInt(input?.value || "1"));
  const prod = productos.find(p => p.id === id);
  if (!prod) return;

  const existente = productosEnCarrito.find(p => p.id === id);
  if (existente) existente.cantidad += cantidad;
  else productosEnCarrito.push({ ...prod, cantidad });

  actualizarNumerito();
  localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

// CATEGORIAS 
botonesCategorias.forEach(boton => {
  boton.addEventListener("click", (e) => {
    botonesCategorias.forEach(b => b.classList.remove("active"));
    e.currentTarget.classList.add("active");
    const categoriaId = e.currentTarget.id;
    if (categoriaId !== "todos") {
      const filtrados = productos.filter(p => p.categoria.id === categoriaId);
      tituloPrincipal.textContent = e.currentTarget.textContent.trim();
      cargarProductos(filtrados);
    } else {
      tituloPrincipal.textContent = "Todos los productos";
      cargarProductos(productos);
    }
  });
});

// NUMERIto CANT PRODUCTOS
function actualizarNumerito() {
  if (!numerito) return;
  numerito.textContent = productosEnCarrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
}

// INIT 
cargarProductos(productos);
actualizarNumerito();
