(function () {
  function getProfile() {
   
    if (window.AppDB && typeof window.AppDB.getCurrentUser === "function") {
      const u = window.AppDB.getCurrentUser();
      if (u) {
        return {
         
          nombre: ((u.nombre || "") + (u.apellido ? " " + u.apellido : "")).trim(),
       
          nombreSolo: u.nombre || "",
          apellido: u.apellido || "",
          email: u.email || "",
          telefono: u.telefono || "",
          direccion: u.direccion || ""
        };
      }
    }
    
    return {
      nombre: "",
      nombreSolo: "",
      apellido: "",
      email: "",
      telefono: "",
      direccion: ""
    };
  }

  function getComprasLocal() {
   
    try {
      const raw = localStorage.getItem("historial-compras");
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
      }
    } catch (e) { }
    return [];
  }


  function getFavoritos() {
    
    if (window.AppDB &&
      typeof window.AppDB.getCurrentUserEmail === "function" &&
      typeof window.AppDB.getFavorites === "function") {
      const email = window.AppDB.getCurrentUserEmail();
      if (email) {
        const favs = window.AppDB.getFavorites(email) || [];
        if (Array.isArray(favs)) return favs;
      }
    }
   
    return [];
  }


  function formatoARS(n) {
    return "$" + Number(n || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 });
  }

  const API_URL = "http://localhost:3008";

  function renderPerfil(perfil, compras, favoritos) {
    compras = Array.isArray(compras) ? compras : [];
    favoritos = Array.isArray(favoritos) ? favoritos : [];

    const loggedIn = !!(perfil && perfil.email);

    // Avatar e info básica
    const inicialEl = document.querySelector("#perfil-avatar-inicial");
    if (inicialEl) {
      inicialEl.textContent = loggedIn && perfil.nombre
        ? perfil.nombre.trim().charAt(0).toUpperCase()
        : "";
    }

    const nombreEls = document.querySelectorAll("#perfil-nombre, #dato-nombre");
    nombreEls.forEach(el => {
      el.textContent = loggedIn ? (perfil.nombre || "") : "";
    });

    const emailEls = document.querySelectorAll("#perfil-email, #dato-email");
    emailEls.forEach(el => {
      el.textContent = loggedIn ? (perfil.email || "") : "";
    });

    const telEl = document.querySelector("#dato-telefono");
    if (telEl) telEl.textContent = loggedIn ? (perfil.telefono || "") : "";

    const dirEl = document.querySelector("#dato-direccion");
    if (dirEl) dirEl.textContent = loggedIn ? (perfil.direccion || "") : "";

   
    const kpiPedidos = document.querySelector("#kpi-pedidos");
    const kpiFavs = document.querySelector("#kpi-favoritos");
    const kpiProm = document.querySelector("#kpi-promedio");

    if (!loggedIn) {
      if (kpiPedidos) kpiPedidos.textContent = "0";
      if (kpiFavs) kpiFavs.textContent = "0";
      if (kpiProm) kpiProm.textContent = formatoARS(0);
     
      const ulCompras = document.querySelector("#lista-compras");
      if (ulCompras) ulCompras.innerHTML = "";
      const ulFavs = document.querySelector("#lista-favoritos");
      if (ulFavs) ulFavs.innerHTML = "";
      return;
    }

    if (kpiPedidos) kpiPedidos.textContent = compras.length.toString();
    if (kpiFavs) kpiFavs.textContent = favoritos.length.toString();
    if (kpiProm) {
      if (compras.length) {
        const total = compras.reduce((acc, c) => acc + Number(c.total || 0), 0);
        kpiProm.textContent = formatoARS(total / compras.length);
      } else {
        kpiProm.textContent = formatoARS(0);
      }
    }

   
    const ulCompras = document.querySelector("#lista-compras");
    if (ulCompras) {
      ulCompras.innerHTML = "";
      if (!compras.length) {
        const li = document.createElement("li");
        li.textContent = "Todavía no registraste compras.";
        ulCompras.appendChild(li);
      } else {
        compras.forEach(c => {
          const li = document.createElement("li");
          li.innerHTML = `
            <span class="compra-id">${c.id || ""}</span>
            <span class="compra-meta">
              <span>${c.fechaHora || c.fecha || ""}</span>
              <span class="tag">${c.estado || "En proceso"}</span>
              <strong>${formatoARS(c.total)}</strong>
            </span>
          `;
          ulCompras.appendChild(li);
        });
      }
    }

 
    const ulFavs = document.querySelector("#lista-favoritos");
    if (ulFavs) {
      ulFavs.innerHTML = "";
      if (!favoritos.length) {
        const li = document.createElement("li");
        li.textContent = "Todavía no marcaste productos como favoritos.";
        ulFavs.appendChild(li);
      } else {
        favoritos.forEach((f, idx) => {
          const li = document.createElement("li");
          const detalleText = f.detalle || "";
          const tagText = f.tag || "Favorito";

          li.innerHTML = `
            <div class="fav-main">
              <strong>${f.nombre}</strong>
              <div class="secondary">${detalleText}</div>
              <span class="tag">${tagText}</span>
            </div>
            <div class="fav-actions">
              <button type="button" class="btn-fav-ver">Ver</button>
              <button type="button" class="btn-fav-quitar">Quitar</button>
            </div>
          `;

          const btnVer = li.querySelector(".btn-fav-ver");
          const btnQuitar = li.querySelector(".btn-fav-quitar");

          if (btnVer && typeof Swal !== "undefined") {
            btnVer.addEventListener("click", () => {
              Swal.fire({
                title: f.nombre,
                html: `
                  <p><strong>Categoría:</strong> ${tagText}</p>
                  ${detalleText ? `<p><strong>Detalle:</strong> ${detalleText}</p>` : ""}
                  ${f.precio ? `<p><strong>Precio estimado:</strong> ${formatoARS(f.precio)}</p>` : ""}
                `,
                imageUrl: f.imagen || undefined,
                imageAlt: f.nombre || "Producto favorito",
                showConfirmButton: true,
                confirmButtonText: "Cerrar",
                customClass: {
                  popup: "tmw-login-popup"
                }
              });
            });
          }

          if (btnQuitar && typeof Swal !== "undefined") {
            btnQuitar.addEventListener("click", () => {
              Swal.fire({
                title: "Quitar de favoritos",
                text: "¿Deseás quitar este producto de tus favoritos?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, quitar",
                cancelButtonText: "Cancelar",
                reverseButtons: true
              }).then((result) => {
                if (!result.isConfirmed) return;

                
                favoritos.splice(idx, 1);

                const email = (window.AppDB && typeof window.AppDB.getCurrentUserEmail === "function")
                  ? window.AppDB.getCurrentUserEmail()
                  : (perfil.email || "");

                if (email && window.AppDB && typeof window.AppDB.updateFavorites === "function") {
                  try {
                    window.AppDB.updateFavorites(email, favoritos);
                  } catch (e) {
                    console.warn("No se pudieron actualizar favoritos", e);
                  }
                }

                const kpiFavs = document.querySelector("#kpi-favoritos");
                if (kpiFavs) kpiFavs.textContent = favoritos.length.toString();

             
                renderPerfil(perfil, compras, favoritos);
              });
            });
          }

          ulFavs.appendChild(li);
        });
      }
    }


  
    const btnEditar = document.querySelector("#btn-editar-datos");
    if (btnEditar) {
      btnEditar.addEventListener("click", function () {
        if (!(window.AppDB && typeof window.AppDB.getCurrentUserEmail === "function")) {
          Swal.fire({
            icon: "info",
            title: "Iniciá sesión",
            text: "Para editar tus datos primero tenés que iniciar sesión."
          });
          return;
        }

        const email = window.AppDB.getCurrentUserEmail();
        if (!email) {
          Swal.fire({
            icon: "info",
            title: "Iniciá sesión",
            text: "Para editar tus datos primero tenés que iniciar sesión."
          });
          return;
        }

        const nombreSolo = perfil.nombreSolo || "";
        const apellido = perfil.apellido || "";
        const telefono = perfil.telefono || "";
        const direccion = perfil.direccion || "";

        Swal.fire({
          title: "Editar mis datos",
          html: `
            <div class="tmw-edit-wrapper">
              <div class="swal2-field">
                <label>Nombre</label>
                <input id="swal-input-nombre" class="swal2-input" value="${nombreSolo}">
              </div>
              <div class="swal2-field">
                <label>Apellido</label>
                <input id="swal-input-apellido" class="swal2-input" value="${apellido}">
              </div>
              <div class="swal2-field">
                <label>Teléfono</label>
                <input id="swal-input-telefono" class="swal2-input" value="${telefono}">
              </div>
              <div class="swal2-field">
                <label>Dirección principal</label>
                <input id="swal-input-direccion" class="swal2-input" value="${direccion}">
              </div>
            </div>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
          showClass: {
            popup: "swal2-show tmw-popup-anim-in"
          },
          hideClass: {
            popup: "swal2-hide tmw-popup-anim-out"
          },
          customClass: {
            popup: "tmw-edit-popup",
            confirmButton: "tmw-btn-confirm",
            cancelButton: "tmw-btn-cancel"
          },
          preConfirm: () => {
            const nombreVal = document.getElementById("swal-input-nombre").value.trim();
            const apellidoVal = document.getElementById("swal-input-apellido").value.trim();
            const telVal = document.getElementById("swal-input-telefono").value.trim();
            const dirVal = document.getElementById("swal-input-direccion").value.trim();

            if (!nombreVal || !apellidoVal) {
              Swal.showValidationMessage("Nombre y apellido son obligatorios.");
              return false;
            }
            return {
              nombre: nombreVal,
              apellido: apellidoVal,
              telefono: telVal,
              direccion: dirVal
            };
          }
        }).then(result => {
          if (!result.isConfirmed) return;
          const data = result.value || {};

          if (window.AppDB && typeof window.AppDB.updateUser === "function") {
            try {
              window.AppDB.updateUser(email, {
                nombre: data.nombre,
                apellido: data.apellido,
                telefono: data.telefono,
                direccion: data.direccion
              });
            } catch (e) {
              console.warn("No se pudieron actualizar los datos del usuario", e);
            }
          }

        
          const nuevoPerfil = getProfile();
          renderPerfil(nuevoPerfil, compras, favoritos);

          Swal.fire({
            icon: "success",
            title: "Datos actualizados",
            text: "Tus datos se guardaron correctamente."
          });
        });
      });
    }

  }

  document.addEventListener("DOMContentLoaded", function () {

    const logoutItem = document.querySelector("#perfil-logout");
    if (logoutItem) {
      logoutItem.addEventListener("click", () => {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: "¿Estás seguro?",
            text: "Vas a cerrar sesión en Tu Morfi Web.",
            icon: "warning",
            iconColor: "#e53935",
            showCancelButton: true,
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
            customClass: {
              popup: "tmw-login-popup"
            }
          }).then((result) => {
            if (result.isConfirmed) {
              try {
                localStorage.removeItem("tmw-current-user");
              } catch (e) { }
              try {
                localStorage.removeItem("productos-en-carrito");
              } catch (e) { }
              window.location.href = "../index.html";
            }
          });
        } else {
          const ok = window.confirm("¿Seguro que querés cerrar sesión?");
          if (ok) {
            try {
              localStorage.removeItem("tmw-current-user");
            } catch (e) { }
            try {
              localStorage.removeItem("productos-en-carrito");
            } catch (e) { }
            window.location.href = "../index.html";
          }
        }
      });
    }

    
    const secResumen = document.querySelector("#perfil-section-resumen");
    const secDatos = document.querySelector("#perfil-section-datos");
    const secCompras = document.querySelector("#perfil-section-compras");
    const secFavoritos = document.querySelector("#perfil-section-favoritos");

    function mostrar(seccion, visible) {
      if (!seccion) return;
      seccion.style.display = visible ? "flex" : "none";
    }

    function cambiarVista(vista) {
      
      mostrar(secResumen, false);
      mostrar(secDatos, false);
      mostrar(secCompras, false);
      mostrar(secFavoritos, false);

  
      if (vista === "resumen") {
        mostrar(secResumen, true);
        mostrar(secDatos, true);
      } else if (vista === "compras") {
        mostrar(secCompras, true);
      } else if (vista === "favoritos") {
        mostrar(secFavoritos, true);
      }

    
      document.querySelectorAll(".perfil-menu-item[data-view]").forEach(item => {
        const view = item.getAttribute("data-view");
        if (view === vista) {
          item.classList.add("perfil-menu-item--active");
        } else {
          item.classList.remove("perfil-menu-item--active");
        }
      });
    }

   
    document.querySelectorAll(".perfil-menu-item[data-view]").forEach(item => {
      item.addEventListener("click", () => {
        const vista = item.getAttribute("data-view") || "resumen";
        cambiarVista(vista);
      });
    });

    
    cambiarVista("resumen");

    const perfil = getProfile();
    const favoritos = getFavoritos();

    const email = (window.AppDB && typeof window.AppDB.getCurrentUserEmail === "function")
      ? window.AppDB.getCurrentUserEmail()
      : (perfil.email || "");

    function usarCompras(compras) {
      renderPerfil(perfil, compras, favoritos);
    }

    if (email) {
      fetch(API_URL + "/compras?usuarioEmail=" + encodeURIComponent(email))
        .then(r => r.ok ? r.json() : Promise.reject(new Error("Respuesta no OK")))
        .then(data => usarCompras(Array.isArray(data) ? data : []))
        .catch(err => {
          console.warn("No se pudieron cargar compras desde JSON Server", err);
          usarCompras([]);
        });
    } else {
      usarCompras([]);
    }
  });
})();
