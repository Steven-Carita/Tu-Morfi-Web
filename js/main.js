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

//PRODUCTOS 
const productos = [
  // PIZZAS
  { id: "pizza-01", titulo: "Pizza de Sardina", imagen: "../img/pizzas/p1.jpg", categoria: { nombre: "Pizzas", id: "pizzas" }, precio: 15000 },
  { id: "pizza-02", titulo: "Pizza de Jamon y Champinones", imagen: "../img/pizzas/p2.jpg", categoria: { nombre: "Pizzas", id: "pizzas" }, precio: 20000 },
  { id: "pizza-03", titulo: "Pizza Bosque Italiano", imagen: "../img/pizzas/p3.jpg", categoria: { nombre: "Pizzas", id: "pizzas" }, precio: 18000 },
  { id: "pizza-04", titulo: "Pizza de Pepperoni", imagen: "../img/pizzas/p4.jpg", categoria: { nombre: "Pizzas", id: "pizzas" }, precio: 18000 },
  { id: "pizza-05", titulo: "Pizza de Calabaza", imagen: "../img/pizzas/p5.jpg", categoria: { nombre: "Pizzas", id: "pizzas" }, precio: 15000 },
  // HAMBURGUESAS
  { id: "burg-01", titulo: "Cheeseburger doble con cheddar", imagen: "../img/hamburguesas/h1.jpg", categoria: { nombre: "Hamburguesas", id: "hamburguesas" }, precio: 10000 },
  { id: "burg-02", titulo: "Triple burger con bacon y cheddar", imagen: "../img/hamburguesas/h2.jpg", categoria: { nombre: "Hamburguesas", id: "hamburguesas" }, precio: 17000 },
  { id: "burg-03", titulo: "Burger con pulled pork y cheddar", imagen: "../img/hamburguesas/h3.jpg", categoria: { nombre: "Hamburguesas", id: "hamburguesas" }, precio: 15000 },
  { id: "burg-04", titulo: "Burger con huevo frito y cheddar", imagen: "../img/hamburguesas/h4.jpg", categoria: { nombre: "Hamburguesas", id: "hamburguesas" }, precio: 12000 },
  { id: "burg-05", titulo: "Burger con aros de cebolla y cheddar", imagen: "../img/hamburguesas/h5.jpg", categoria: { nombre: "Hamburguesas", id: "hamburguesas" }, precio: 14000 },
  { id: "burg-06", titulo: "Burger con champinones y cheddar", imagen: "../img/hamburguesas/h6.jpg", categoria: { nombre: "Hamburguesas", id: "hamburguesas" }, precio: 14000 },
  { id: "burg-07", titulo: "Burger con guacamole y cheddar", imagen: "../img/hamburguesas/h7.jpeg", categoria: { nombre: "Hamburguesas", id: "hamburguesas" }, precio: 14000 },
  { id: "burg-08", titulo: "Burger BBQ con cheddar", imagen: "../img/hamburguesas/h8.jpg", categoria: { nombre: "Hamburguesas", id: "hamburguesas" }, precio: 14000 },

  // MILANESAS
  { id: "mila-01", titulo: "Milanesa Napolitana", imagen: "../img/milanesas/m1.jpg", categoria: { nombre: "Milanesas", id: "milanesas" }, precio: 12000 },
  { id: "mila-02", titulo: "Milanesa con Jamon y Queso", imagen: "../img/milanesas/m2.jpg", categoria: { nombre: "Milanesas", id: "milanesas" }, precio: 12000 }, 
  { id: "mila-03", titulo: "Milanesa con Huevo Frito", imagen: "../img/milanesas/m3.jpg", categoria: { nombre: "Milanesas", id: "milanesas" }, precio: 12000 },
  { id: "mila-04", titulo: "Milanesa con Cebolla Caramelizada", imagen: "../img/milanesas/m4.jpg", categoria: { nombre: "Milanesas", id: "milanesas" }, precio: 12000 },
  { id: "mila-05", titulo: "Milanesa con Guarnicion", imagen: "../img/milanesas/m5.jpg", categoria: { nombre: "Milanesas", id: "milanesas" }, precio: 11000 },

  // EMPANADAS
  { id: "emp-01", titulo: "Empanada de Carne", imagen: "../img/empanadas/e1.jpg", categoria: { nombre: "Empanadas", id: "empanadas" }, precio: 3000 },
  { id: "emp-02", titulo: "Empanada de Pollo", imagen: "../img/empanadas/e2.jpg", categoria: { nombre: "Empanadas", id: "empanadas" }, precio: 3000 },
  { id: "emp-03", titulo: "Empanada de Jamon y Queso", imagen: "../img/empanadas/e3.jpg", categoria: { nombre: "Empanadas", id: "empanadas" }, precio: 3000 },
  { id: "emp-04", titulo: "Empanada de Humita", imagen: "../img/empanadas/e4.jpg", categoria: { nombre: "Empanadas", id: "empanadas" }, precio: 3000 },
  { id: "emp-05", titulo: "Empanada Capresse", imagen: "../img/empanadas/e5.jpg", categoria: { nombre: "Empanadas", id: "empanadas" }, precio: 3000 },

  // ACOMPAÑAMIENTOS
  { id: "acom-01", titulo: "Papas Fritas", imagen: "../img/acompañamientos/a1.jpg", categoria: { nombre: "Acompañamientos", id: "acompañamientos" }, precio: 5000 },
  { id: "acom-02", titulo: "Papas con Cheddar y Bacon", imagen: "../img/acompañamientos/a2.jpg", categoria: { nombre: "Acompañamientos", id: "acompañamientos" }, precio: 6000 },
  { id: "acom-03", titulo: "Aros de Cebolla", imagen: "../img/acompañamientos/a3.jpg", categoria: { nombre: "Acompañamientos", id: "acompañamientos" }, precio: 8000 },
  { id: "acom-04", titulo: "Bastones de Mozzarella", imagen: "../img/acompañamientos/a4.jpg", categoria: { nombre: "Acompañamientos", id: "acompañamientos" }, precio: 8000 },

  // BEBIDAS
  { id: "beb-01", titulo: "Coca Cola 500ml", imagen: "../img/bebidas/b1.jpg", categoria: { nombre: "Bebidas", id: "bebidas" }, precio: 3000 },
  { id: "beb-02", titulo: "Sprite Zero 500ml", imagen: "../img/bebidas/b2.jpg", categoria: { nombre: "Bebidas", id: "bebidas" }, precio: 3000 },
  { id: "beb-03", titulo: "Brahma 473ml", imagen: "../img/bebidas/b3.jpg", categoria: { nombre: "Bebidas", id: "bebidas" }, precio: 3000 },
  { id: "beb-04", titulo: "Stella 473ml", imagen: "../img/bebidas/b4.jpg", categoria: { nombre: "Bebidas", id: "bebidas" }, precio: 3500 },
  { id: "beb-05", titulo: "Aquarius Naranja 500ml", imagen: "../img/bebidas/b5.jpg", categoria: { nombre: "Bebidas", id: "bebidas" }, precio: 3000 },
  { id: "beb-06", titulo: "Aquarius Pera 500ml", imagen: "../img/bebidas/b6.jpg", categoria: { nombre: "Bebidas", id: "bebidas" }, precio: 3000 },
  { id: "beb-07", titulo: "Aquarius Manzana 500ml", imagen: "../img/bebidas/b7.jpg", categoria: { nombre: "Bebidas", id: "bebidas" }, precio: 3000 },
  { id: "beb-08", titulo: "Agua Villavicencio 500ml", imagen: "../img/bebidas/b8.jpg", categoria: { nombre: "Bebidas", id: "bebidas" }, precio: 2500 },
  
];

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
