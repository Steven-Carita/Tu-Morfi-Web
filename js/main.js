// productos que se muestran en el menu y se usan para calcular precios
const productos = [
    // PIZZAS
    {
        id: "pizza-01",
        titulo: "Pizza de Sardina",
        imagen: "../img/pizzas/p1.jpg",
        categoria: { nombre: "Pizzas", id: "pizzas" },
        precio: 15000
    },
    {
        id: "pizza-02",
        titulo: "Pizza de Jamon y Champinones",
        imagen: "../img/pizzas/p2.jpg",
        categoria: { nombre: "Pizzas", id: "pizzas" },
        precio: 20000
    },
    {
        id: "pizza-03",
        titulo: "Pizza Bosque Italiano",
        imagen: "../img/pizzas/p3.jpg",
        categoria: { nombre: "Pizzas", id: "pizzas" },
        precio: 18000
    },
    {
        id: "pizza-04",
        titulo: "Pizza de Pepperoni",
        imagen: "../img/pizzas/p4.jpg",
        categoria: { nombre: "Pizzas", id: "pizzas" },
        precio: 18000
    },
    {
        id: "pizza-05",
        titulo: "Pizza de Calabaza",
        imagen: "../img/pizzas/p5.jpg",
        categoria: { nombre: "Pizzas", id: "pizzas" },
        precio: 15000
    },

    // HAMBURGUESAS
    {
        id: "hamburguesa-01",
        titulo: "Cheeseburger doble con cheddar",
        imagen: "../img/hamburguesas/h1.jpg",
        categoria: { nombre: "Hamburguesas", id: "hamburguesas" },
        precio: 1000
    },
    {
        id: "hamburguesa-02",
        titulo: "Triple burger con bacon y cheddar",
        imagen: "../img/hamburguesas/h2.jpg",
        categoria: { nombre: "Hamburguesas", id: "hamburguesas" },
        precio: 1000
    },
    {
        id: "hamburguesa-03",
        titulo: "Burger con pulled pork y cheddar",
        imagen: "../img/hamburguesas/h3.jpg",
        categoria: { nombre: "Hamburguesas", id: "hamburguesas" },
        precio: 1000
    },
    {
        id: "hamburguesa-04",
        titulo: "Cheeseburger Clasica",
        imagen: "../img/hamburguesas/h4.jpg",
        categoria: { nombre: "Hamburguesas", id: "hamburguesas" },
        precio: 1000
    },
    {
        id: "hamburguesa-05",
        titulo: "Burger con mariscos premium",
        imagen: "../img/hamburguesas/h5.jpg",
        categoria: { nombre: "Hamburguesas", id: "hamburguesas" },
        precio: 1000
    },
    {
        id: "hamburguesa-06",
        titulo: "Brioche Burger con pickles y cebolla",
        imagen: "../img/hamburguesas/h6.jpg",
        categoria: { nombre: "Hamburguesas", id: "hamburguesas" },
        precio: 1000
    },
    {
        id: "hamburguesa-07",
        titulo: "Burger de Palta",
        imagen: "../img/hamburguesas/h7.jpeg",
        categoria: { nombre: "Hamburguesas", id: "hamburguesas" },
        precio: 1000
    },
    {
        id: "hamburguesa-08",
        titulo: "Burguer XL Clasica",
        imagen: "../img/hamburguesas/h8.jpg",
        categoria: { nombre: "Hamburguesas", id: "hamburguesas" },
        precio: 1000
    },

    // MILANESAS
    {
        id: "milanesa-01",
        titulo: "Milanesa Americana",
        imagen: "../img/milanesas/m1.jpg",
        categoria: { nombre: "Milanesas", id: "milanesas" },
        precio: 1000
    },
    {
        id: "milanesa-02",
        titulo: "Milanesa Cuatro Quesos",
        imagen: "../img/milanesas/m2.jpg",
        categoria: { nombre: "Milanesas", id: "milanesas" },
        precio: 1000
    },
    {
        id: "milanesa-03",
        titulo: "Milanesa Fugazzeta",
        imagen: "../img/milanesas/m3.jpg",
        categoria: { nombre: "Milanesas", id: "milanesas" },
        precio: 1000
    },
    {
        id: "milanesa-04",
        titulo: "Milanesa Serrana",
        imagen: "../img/milanesas/m4.jpg",
        categoria: { nombre: "Milanesas", id: "milanesas" },
        precio: 1000
    },
    {
        id: "milanesa-05",
        titulo: "Milanesa Clasica de Pollo",
        imagen: "../img/milanesas/m5.jpg",
        categoria: { nombre: "Milanesas", id: "milanesas" },
        precio: 1000
    }
];

// referencias que usa la pagina para dibujar el grid y actualizar el header
const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
let botonesAgregar = document.querySelectorAll(".producto-agregar");
const numerito = document.querySelector("#numerito");

// genera las tarjetas de producto y las inserta en el grid
function cargarProductos(productosElegidos) {
    contenedorProductos.innerHTML = "";

    productosElegidos.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio}</p>
                <button class="producto-agregar" id="${producto.id}">Agregar</button>
            </div>
        `;
        contenedorProductos.append(div);
    });

    actualizarBotonesAgregar();
}

cargarProductos(productos);

// al hacer click en una categoria se filtran los productos y se actualiza el titulo
botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {

        botonesCategorias.forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");

        if (e.currentTarget.id != "todos") {
            const productoCategoria = productos.find(p => p.categoria.id === e.currentTarget.id);
            tituloPrincipal.innerText = productoCategoria.categoria.nombre;

            const productosBoton = productos.filter(p => p.categoria.id === e.currentTarget.id);
            cargarProductos(productosBoton);
        } else {
            tituloPrincipal.innerText = "Todos los productos";
            cargarProductos(productos);
        }
    });
});

let productosEnCarrito;

// si hay un carrito guardado se restaura y se actualiza el numerito, si no se inicia vacio
let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");
if (productosEnCarritoLS) {
    productosEnCarrito = JSON.parse(productosEnCarritoLS);
    actualizarNumerito();
} else {
    productosEnCarrito = [];
}

// agrega al carrito o incrementa cantidad si ya existe, luego actualiza el numerito y guarda en localStorage
function agregarAlCarrito(e) {
    const idBoton = e.currentTarget.id;
    const productoAgregado = productos.find(p => p.id === idBoton);

    if (productosEnCarrito.some(p => p.id === idBoton)) {
        const index = productosEnCarrito.findIndex(p => p.id === idBoton);
        productosEnCarrito[index].cantidad++;
    } else {
        productoAgregado.cantidad = 1;
        productosEnCarrito.push(productoAgregado);
    }

    actualizarNumerito();
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

// vuelve a capturar los botones Agregar y les asigna el evento para sumar al carrito
function actualizarBotonesAgregar() {
    botonesAgregar = document.querySelectorAll(".producto-agregar");
    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

// muestra en el badge del header la suma de cantidades del carrito
function actualizarNumerito() {
    const nuevoNumerito = productosEnCarrito.reduce((acc, p) => acc + p.cantidad, 0);
    numerito.innerText = nuevoNumerito;
}
