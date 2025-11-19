const MENU_API_URL = "http://localhost:3008";
let productos = [];
fetch(MENU_API_URL + "/productos")
  .then(response => response.json())
  .then(data => {
    productos = Array.isArray(data) ? data : [];
    aplicarFiltrosYOrden();
  })
  .catch(error => {
    console.error("Error al cargar los productos desde la API:", error);
  });





let favoritosActuales = [];

function obtenerEmailUsuarioActual() {
  if (window.AppDB && typeof window.AppDB.getCurrentUserEmail === "function") {
    return window.AppDB.getCurrentUserEmail();
  }
  return null;
}

function cargarFavoritosUsuario() {
  const email = obtenerEmailUsuarioActual();
  if (!email || !window.AppDB || typeof window.AppDB.getFavorites !== "function") {
    favoritosActuales = [];
    return;
  }
  try {
    const favs = window.AppDB.getFavorites(email) || [];
    favoritosActuales = Array.isArray(favs) ? favs : [];
  } catch (e) {
    favoritosActuales = [];
  }
}

function esFavorito(id) {
  return favoritosActuales.some(f => f.id === id);
}

function mapProductoAFavorito(producto) {
  if (!producto) return null;
  return {
    id: producto.id,
    nombre: producto.titulo,
    detalle: (producto.categoria && producto.categoria.nombre) || "",
    tag: (producto.categoria && producto.categoria.nombre) || "Favorito",
    precio: producto.precio,
    imagen: producto.imagen
  };
}

function toggleFavorito(productoId) {
  const email = obtenerEmailUsuarioActual();
  if (!email || !window.AppDB || typeof window.AppDB.updateFavorites !== "function") {
    if (typeof Toastify !== "undefined") {
      Toastify({
        text: "Iniciá sesión para guardar tus favoritos",
        duration: 3000,
        gravity: "top",
        position: "right"
      }).showToast();
    } else {
      alert("Iniciá sesión para guardar tus favoritos.");
    }
    return;
  }

  const prod = productos.find(p => p.id === productoId);
  if (!prod) return;

  const estabaEnFav = esFavorito(productoId);

  if (estabaEnFav) {
    
    favoritosActuales = favoritosActuales.filter(f => f.id !== productoId);
  } else {
    
    const fav = mapProductoAFavorito(prod);
    if (fav) favoritosActuales.push(fav);
  }

  window.AppDB.updateFavorites(email, favoritosActuales);
  actualizarHeartsUI();

 
  if (typeof Toastify !== "undefined") {
    Toastify({
      text: estabaEnFav
        ? "Quitado de tus favoritos"
        : "Agregado a tus favoritos",
      duration: 2500,
      gravity: "top",
      position: "right",
      backgroundColor: estabaEnFav ? "#444" : "#b93d52ff",
      style: {
        marginTop: "25px",
        marginRight: "50px",
        borderRadius: "20px",
        fontSize: "14px"
      }
    }).showToast();
  }
}


function attachFavoritosListeners() {
  if (!contenedorProductos) return;
  const botonesFav = contenedorProductos.querySelectorAll(".btn-favorito");
  botonesFav.forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      if (id) toggleFavorito(id);
    });
  });
}

function actualizarHeartsUI() {
  if (!contenedorProductos) return;
  const botonesFav = contenedorProductos.querySelectorAll(".btn-favorito");
  botonesFav.forEach(btn => {
    const id = btn.getAttribute("data-id");
    if (id && esFavorito(id)) {
      btn.classList.add("fav-active");
    } else {
      btn.classList.remove("fav-active");
    }
  });
}


cargarFavoritosUsuario();



const contenedorProductos = document.querySelector("#contenedor-productos");
const tituloPrincipal = document.querySelector("#titulo-principal") || { textContent: "" };
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const numerito = document.querySelector("#numerito");
function activarCategoriaTodos() { try { botonesCategorias.forEach(b => b.classList.remove("active")); const btnTodos = document.querySelector("#todos"); if (btnTodos) btnTodos.classList.add("active"); if (tituloPrincipal) tituloPrincipal.textContent = "Todos los productos"; } catch (e) { } }

const formBusqueda = document.querySelector("#form-busqueda");
const btnBuscar = document.querySelector("#btn-buscar");
const resultadoBox = document.querySelector("#resultado-busqueda");
const resultadoText = document.querySelector("#resultado-busqueda .q");
let ultimaBusqueda = "";


const buscadorInput = document.querySelector("#buscador");
const ordenarSelect = document.querySelector("#ordenar");

function categoriaSeleccionada() {
  const act = document.querySelector(".boton-categoria.active");
  return act ? act.id : "todos";
}

function aplicarFiltrosYOrden(term) {
  let lista = [];
  const q = (typeof term === "string" ? term : (ultimaBusqueda || (buscadorInput?.value || ""))).trim().toLowerCase();
  if (q) {
    lista = [...productos];
  } else {
    const catId = categoriaSeleccionada ? categoriaSeleccionada() : "todos";
    if (catId && catId !== "todos") {
      lista = productos.filter(p => p.categoria && p.categoria.id === catId);
    } else {
      lista = [...productos];
    }
  }
  if (q) {
    lista = lista.filter(p => {
      const titulo = (p.titulo || "").toLowerCase();
      const cn = (p.categoria?.nombre || "").toLowerCase();
      const cid = (p.categoria?.id || "").toLowerCase();
      return titulo.includes(q) || cn.includes(q) || cid.includes(q);
    });
  }

  const ord = (ordenarSelect?.value || "");
  if (ord === "asc" || ord === "desc") {
    lista.sort((a, b) => ord === "desc" ? (b.precio - a.precio) : (a.precio - b.precio));
  }

  cargarProductos(lista);
}

ordenarSelect && ordenarSelect.addEventListener("change", () => {
  aplicarFiltrosYOrden();
});



function formatARS(value) {
  try {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Number(value) || 0);
  } catch (e) {
  
    const n = Math.round(Number(value) || 0).toString();
    return n.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}




let productosEnCarrito;
try {
  productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];
  if (!Array.isArray(productosEnCarrito)) productosEnCarrito = [];
} catch { productosEnCarrito = []; }


function tarjetaProductoHTML(producto) {
  const favClass = esFavorito(producto.id) ? " fav-active" : "";
  return `
    <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
    <div class="producto-detalles">
      <h3 class="producto-titulo">${producto.titulo}</h3>

      <p class="producto-precio">$${formatARS(producto.precio)}</p>

      <div class="qty-control" data-id="${producto.id}">
        <button class="qty-btn minus" data-id="${producto.id}">-</button>
        <input type="number" min="1" class="qty-input" data-id="${producto.id}" value="1">
        <button class="qty-btn plus" data-id="${producto.id}">+</button>

        <button class="btn-favorito ${favClass}" data-id="${producto.id}">
          <i class="bi bi-heart-fill"></i>
        </button>
      </div>


      <button class="producto-agregar" id="${producto.id}" data-id="${producto.id}">Agregar</button>
    </div>`;
}

function cargarProductos(productosElegidos) {
  if (!contenedorProductos) return;
  contenedorProductos.innerHTML = "";
  if (!Array.isArray(productosElegidos) || productosElegidos.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No se encontraron productos.";
    contenedorProductos.appendChild(empty);
    return;
  }
  productosElegidos.forEach(p => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = tarjetaProductoHTML(p);
    contenedorProductos.appendChild(div);
  });
  actualizarBotonesAgregar();
  attachQtyListenersProducts();
  attachFavoritosListeners();
  actualizarHeartsUI();
}


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
    gravity: "top", 
    position: "right", 
    stopOnFocus: true, 
    style: {
      background: "linear-gradient(to right, #dfb950ff, #c0ad57ff)",
      borderRadius: "2rem",
      textTransform: "uppercase",
      fontZize: ".75rem"
    },
    offset: {
      x: "3rem", 
      y: "2rem"
    },


    onClick: function () { } 
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
    if (typeof ordenarSelect !== "undefined" && ordenarSelect) { ordenarSelect.value = ""; }
    ultimaBusqueda = "";
    if (resultadoBox) { resultadoBox.hidden = true; if (resultadoText) resultadoText.textContent = ""; }
    if (typeof ordenarSelect !== "undefined" && ordenarSelect) { ordenarSelect.value = ""; }
    botonesCategorias.forEach(b => b.classList.remove("active"));
    e.currentTarget.classList.add("active");
    const categoriaId = e.currentTarget.id;
    if (categoriaId !== "todos") {
      const filtrados = productos.filter(p => p.categoria.id === categoriaId);
      tituloPrincipal.textContent = e.currentTarget.textContent.trim();
      aplicarFiltrosYOrden();
    } else {
      tituloPrincipal.textContent = "Todos los productos";
      aplicarFiltrosYOrden();
    }
  });
});


function actualizarNumerito() {
  if (!numerito) return;
  numerito.textContent = productosEnCarrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
}

// INIT 
aplicarFiltrosYOrden();
actualizarNumerito();


formBusqueda && formBusqueda.addEventListener("submit", (e) => {
  e.preventDefault();
  const term = (buscadorInput?.value || "").trim();
  ultimaBusqueda = term;
  activarCategoriaTodos(); 
  if (resultadoBox && resultadoText) {
    if (term) { resultadoText.textContent = `'${term}'`; resultadoBox.hidden = false; }
    else { resultadoText.textContent = ""; resultadoBox.hidden = true; }
  }
  aplicarFiltrosYOrden(term);
  if (buscadorInput) buscadorInput.value = "";
});
btnBuscar && btnBuscar.addEventListener("click", (e) => {
  e.preventDefault();
  const term = (buscadorInput?.value || "").trim();
  ultimaBusqueda = term;
  activarCategoriaTodos(); 
  if (resultadoBox && resultadoText) {
    if (term) { resultadoText.textContent = `'${term}'`; resultadoBox.hidden = false; }
    else { resultadoText.textContent = ""; resultadoBox.hidden = true; }
  }
  aplicarFiltrosYOrden(term);
  if (buscadorInput) buscadorInput.value = "";
});
