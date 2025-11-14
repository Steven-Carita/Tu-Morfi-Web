document.addEventListener("DOMContentLoaded", function(){
  // Marcar el body como cargado para disparar animaciones CSS
  document.body.classList.add("home-loaded");

  // Badge del carrito en el nav
  const badge = document.querySelector("#cart-count");
  if (!badge) return;

  let items;
  try{
    items = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];
  }catch(e){
    items = [];
  }

  const total = items.reduce((acc, item) => {
    const qty = Number(item.cantidad);
    return acc + (isNaN(qty) ? 1 : qty);
  }, 0);

  if (total > 0){
    badge.textContent = total > 9 ? "9+" : String(total);
    badge.hidden = false;
  }else{
    badge.hidden = true;
  }
});
