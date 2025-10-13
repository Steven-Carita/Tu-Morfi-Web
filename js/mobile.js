// referencia al boton que abre el menu lateral en mobile
const openMenu = document.querySelector("#open-menu");

// referencia al boton que cierra el menu lateral en mobile
const closeMenu = document.querySelector("#close-menu");

// referencia al contenedor aside que funciona como menu lateral
const aside = document.querySelector("aside");
const botonesCategorias = document.querySelectorAll(".boton-categoria");

// al hacer click en el boton de abrir se muestra el menu lateral
openMenu?.addEventListener("click", () => {
    aside.classList.add("aside-visible");
})

// al hacer click en el boton de cerrar se oculta el menu lateral
closeMenu?.addEventListener("click", () => {
    aside.classList.remove("aside-visible");
})

// al seleccionar una categoria dentro del menu tambien se oculta el lateral
// esto mejora la experiencia en pantallas chicas porque el usuario vuelve al contenido
botonesCategorias.forEach(boton => boton.addEventListener("click", () => {
    aside.classList.remove("aside-visible");
}))
