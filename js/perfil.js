(function(){
  function getProfile(){
    // Primero intentamos obtener el usuario actual desde AppDB (pago-db.js)
    if (window.AppDB && typeof window.AppDB.getCurrentUser === "function") {
      const u = window.AppDB.getCurrentUser();
      if (u) {
        return {
          nombre: (u.nombre || "") + (u.apellido ? " " + u.apellido : ""),
          email: u.email || "",
          telefono: u.telefono || "",
          direccion: u.direccion || ""
        };
      }
    }
    // Luego, intentamos desde localStorage (fallback)
    try{
      const raw = localStorage.getItem("user-profile");
      if (raw){
        return JSON.parse(raw);
      }
    }catch(e){}
    // Fallback: usuario genérico
    return {
      nombre: "Usuario Tu Morfi Web",
      email: "sin-email@ejemplo.com",
      telefono: "",
      direccion: ""
    };
  }

  function getComprasLocal(){
    try{
      const raw = localStorage.getItem("historial-compras");
      if (raw){
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
      }
    }catch(e){}
    // Datos demo
    return [
      {id:"#A-1023", fecha:"12/11/2025", total:56000, estado:"Entregado"},
      {id:"#A-1018", fecha:"03/11/2025", total:32000, estado:"Entregado"},
      {id:"#A-1002", fecha:"21/10/2025", total:18500, estado:"Retiro en local"}
    ];
  }

  function getFavoritos(){
    // Intentar obtener favoritos desde AppDB para el usuario actual
    if (window.AppDB && typeof window.AppDB.getCurrentUserEmail === "function" && typeof window.AppDB.getFavorites === "function") {
      const email = window.AppDB.getCurrentUserEmail();
      if (email) {
        const favs = window.AppDB.getFavorites(email) || [];
        if (Array.isArray(favs) && favs.length) return favs;
      }
    }
    // Fallback: localStorage o datos demo
    try{
      const raw = localStorage.getItem("favoritos");
      if (raw){
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
      }
    }catch(e){}
    return [
      {nombre:"Burger Doble Clásica", detalle:"Hamburguesa doble con cheddar y panceta", tag:"Hamburguesa"},
      {nombre:"Pizza de Pepperoni", detalle:"Masa a la piedra con extra muzza y pepperoni", tag:"Pizza"},
      {nombre:"Papas con cheddar y verdeo", detalle:"Porción grande para compartir", tag:"Acompañamiento"}
    ];
  }

  function formatoARS(n){
    return "$" + Number(n || 0).toLocaleString("es-AR", {maximumFractionDigits:0});
  }

  const API_URL = "http://localhost:3001";

  function renderPerfil(perfil, compras, favoritos){
    compras = Array.isArray(compras) ? compras : [];
    favoritos = Array.isArray(favoritos) ? favoritos : [];

    // Avatar e info básica
    const inicialEl = document.querySelector("#perfil-avatar-inicial");
    if (inicialEl && perfil.nombre){
      inicialEl.textContent = perfil.nombre.trim().charAt(0).toUpperCase();
    }
    const nombreEls = document.querySelectorAll("#perfil-nombre, #dato-nombre");
    nombreEls.forEach(el => el.textContent = perfil.nombre || "Usuario Tu Morfi Web");
    const emailEls = document.querySelectorAll("#perfil-email, #dato-email");
    emailEls.forEach(el => el.textContent = perfil.email || "sin-email@ejemplo.com");
    const telEl = document.querySelector("#dato-telefono");
    if (telEl) telEl.textContent = perfil.telefono || "Sin teléfono cargado";
    const dirEl = document.querySelector("#dato-direccion");
    if (dirEl) dirEl.textContent = perfil.direccion || "Sin dirección guardada";

    // KPIs
    const kpiPedidos = document.querySelector("#kpi-pedidos");
    const kpiFavs = document.querySelector("#kpi-favoritos");
    const kpiProm = document.querySelector("#kpi-promedio");
    if (kpiPedidos) kpiPedidos.textContent = compras.length.toString();
    if (kpiFavs) kpiFavs.textContent = favoritos.length.toString();
    if (kpiProm){
      if (compras.length){
        const total = compras.reduce((acc,c)=>acc + Number(c.total||0),0);
        kpiProm.textContent = formatoARS(total / compras.length);
      }else{
        kpiProm.textContent = formatoARS(0);
      }
    }

    // Lista compras
    const ulCompras = document.querySelector("#lista-compras");
    if (ulCompras){
      ulCompras.innerHTML = "";
      if (!compras.length){
        const li = document.createElement("li");
        li.textContent = "Todavía no registraste compras.";
        ulCompras.appendChild(li);
      }else{
        compras.forEach(c => {
          const li = document.createElement("li");
          li.innerHTML = `
            <span class="compra-id">${c.id || ""}</span>
            <span class="compra-meta">
              <span>${c.fecha || ""}</span>
              <span class="tag">${c.estado || "En proceso"}</span>
              <strong>${formatoARS(c.total)}</strong>
            </span>
          `;
          ulCompras.appendChild(li);
        });
      }
    }

    // Lista favoritos
    const ulFavs = document.querySelector("#lista-favoritos");
    if (ulFavs){
      ulFavs.innerHTML = "";
      if (!favoritos.length){
        const li = document.createElement("li");
        li.textContent = "Todavía no marcaste productos como favoritos.";
        ulFavs.appendChild(li);
      }else{
        favoritos.forEach(f => {
          const li = document.createElement("li");
          li.innerHTML = `
            <div class="fav-main">
              <strong>${f.nombre}</strong>
              <div class="secondary">${f.detalle || ""}</div>
              <span class="tag">${f.tag || "Favorito"}</span>
            </div>
            <div class="fav-actions">
              <button type="button">Ver</button>
              <button type="button">Quitar</button>
            </div>
          `;
          ulFavs.appendChild(li);
        });
      }
    }

    // Botón "Editar" de datos (solo demo)
    const btnEditar = document.querySelector("#btn-editar-datos");
    if (btnEditar){
      btnEditar.addEventListener("click", function(){
        alert("Esta versión es solo de demostración visual. La edición se puede conectar más adelante al backend o a un formulario.");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function(){
    const perfil = getProfile();
    const favoritos = getFavoritos();

    const email = (window.AppDB && typeof window.AppDB.getCurrentUserEmail === "function")
      ? window.AppDB.getCurrentUserEmail()
      : (perfil.email || "");

    function usarCompras(compras){
      renderPerfil(perfil, compras, favoritos);
    }

    if (email){
      fetch(API_URL + "/compras?usuarioEmail=" + encodeURIComponent(email))
        .then(r => r.ok ? r.json() : Promise.reject(new Error("Respuesta no OK")))
        .then(data => usarCompras(Array.isArray(data) ? data : getComprasLocal()))
        .catch(err => {
          console.warn("No se pudieron cargar compras desde JSON Server", err);
          usarCompras(getComprasLocal());
        });
    }else{
      usarCompras(getComprasLocal());
    }
  });
})();