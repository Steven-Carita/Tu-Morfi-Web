
document.addEventListener("DOMContentLoaded", () => {
  function isLoggedIn() {
    try {
      if (window.AppDB && typeof window.AppDB.getCurrentUserEmail === "function") {
        const email = window.AppDB.getCurrentUserEmail();
        if (email) return true;
      }
      const raw = localStorage.getItem("tmw-current-user");
      return !!raw;
    } catch (e) {
      return false;
    }
  }

  function showLoginAlert() {
    if (typeof Swal === "undefined") {
      const go = window.confirm(
        "Necesitás iniciar sesión para acceder al menú y al carrito.\n\n¿Querés ir a la página de inicio de sesión?"
      );
      if (go) {
        window.location.href = "pages/login.html";
      }
      return;
    }

    Swal.fire({
      title: "Iniciá sesión para continuar",
      text: "Para acceder al menú y al carrito primero tenés que iniciar sesión.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Iniciar sesión",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      backdrop: true,
      allowOutsideClick: true,
      customClass: {
        popup: "tmw-login-popup",
        confirmButton: "tmw-btn-primary",
        cancelButton: "tmw-btn-secondary"
      }
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "pages/login.html";
      }
    });
  }

  function handleProtectedClick(event) {
    if (isLoggedIn()) {
      return;
    }
    event.preventDefault();
    showLoginAlert();
  }

  
  const menuLinks = document.querySelectorAll('a[href="pages/menu.html"]');
  const carritoLinks = document.querySelectorAll('a[href="pages/carrito.html"]');

  menuLinks.forEach((a) => a.addEventListener("click", handleProtectedClick));
  carritoLinks.forEach((a) => a.addEventListener("click", handleProtectedClick));

  
  function getCartCount() {
    try {
      const raw = localStorage.getItem("productos-en-carrito");
      if (!raw) return 0;
      const items = JSON.parse(raw);
      if (!Array.isArray(items)) return 0;
      return items.reduce((acc, item) => {
        const qty = Number(item.cantidad || 0);
        return acc + (isNaN(qty) ? 0 : qty);
      }, 0);
    } catch (e) {
      return 0;
    }
  }

  function updateCartCounter() {
    const carritoLi = document.querySelector('a[href="pages/carrito.html"] li');
    if (!carritoLi) return;

    let badge = carritoLi.querySelector(".cart-count");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-count";
      carritoLi.appendChild(badge);
    }

    const count = getCartCount();
    if (count > 0) {
      badge.textContent = count > 9 ? "9+" : String(count);
      badge.style.display = "inline-flex";
    } else {
      badge.textContent = "";
      badge.style.display = "none";
    }
  }

  
  function setupUserUI() {
    if (!isLoggedIn()) return;

    const menu = document.querySelector(".menu");
    if (!menu) return;

    
    const loginLink = document.querySelector('a[href="pages/login.html"]');
    if (loginLink) {
      loginLink.style.display = "none";
    }

    
    let perfilLink = document.querySelector(".menu__perfil-link");
    if (!perfilLink) {
      perfilLink = document.createElement("a");
      perfilLink.href = "pages/perfil.html";
      perfilLink.className = "menu__perfil-link";
      const liPerfil = document.createElement("li");
      liPerfil.className = "menu__item menu__perfil-item";
      liPerfil.textContent = "Mi Perfil";
      perfilLink.appendChild(liPerfil);
      menu.appendChild(perfilLink);
    }

   
    let logoutItem = document.querySelector(".logout-item");
    if (!logoutItem) {
      logoutItem = document.createElement("li");
      logoutItem.className = "logout-item";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-logout";
      btn.textContent = "Cerrar Sesión";
      btn.addEventListener("click", () => {
        
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
              } catch (e) {}
              try {
                localStorage.removeItem("productos-en-carrito");
              } catch (e) {}
              window.location.href = "index.html";
            }
          });
        } else {
          const ok = window.confirm("¿Seguro que querés cerrar sesión?");
          if (ok) {
            try {
              localStorage.removeItem("tmw-current-user");
            } catch (e) {}
            try {
              localStorage.removeItem("productos-en-carrito");
            } catch (e) {}
            window.location.href = "index.html";
          }
        }
      });

      logoutItem.appendChild(btn);
      menu.appendChild(logoutItem);
    }
  }

 
  function updateGreeting() {
    try {
      if (!(window.AppDB && typeof window.AppDB.getCurrentUser === "function")) return;

      const user = window.AppDB.getCurrentUser();
      if (!user) return;

      let name = "";
      if (user.nombre) {
        name = user.nombre;
      } else if (user.email) {
        name = user.email;
      }

      if (!name) return;

      const logo = document.querySelector(".logo");
      if (!logo || !logo.parentElement) return;

      let greeting = document.querySelector(".user-greeting");
      if (!greeting) {
        greeting = document.createElement("span");
        greeting.className = "user-greeting";
        logo.insertAdjacentElement("afterend", greeting);
      }

      greeting.textContent = "Hola, " + name;
    } catch (e) {
      console.warn("No se pudo actualizar el saludo del usuario:", e);
    }
  }

  updateGreeting();
  setupUserUI();
  updateCartCounter();
});



document.addEventListener("DOMContentLoaded", function(){
  const animables = document.querySelectorAll("[data-animate]");

  if (!("IntersectionObserver" in window)){
    animables.forEach(el => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold:0.15 });

    animables.forEach(el => observer.observe(el));
  }

  const header = document.querySelector(".hero__header");
  if (header){
    const onScroll = () => {
      if (window.scrollY > 40){
        header.classList.add("header-scrolled");
      } else {
        header.classList.remove("header-scrolled");
      }
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
  }
});
