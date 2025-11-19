
function startAdminClock() {
  const el = document.getElementById("admin-clock");
  if (!el) return;
  function pad(n) { return n.toString().padStart(2, "0"); }
  function tick() {
    const d = new Date();
    el.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  tick(); setInterval(tick, 1000);
}

const API_URL = "http://localhost:3008";

const ADMIN_SWAL_BASE = {
  background: "#0f172a",
  color: "#e2e8f0",
  confirmButtonColor: "#ef4444",
  cancelButtonColor: "#6b7280"
};

function adminAlert(title, text, icon) {
  if (!window.Swal) return;
  return Swal.fire({
    title: title || "",
    text: text || "",
    icon: icon || undefined,
    ...ADMIN_SWAL_BASE
  });
}

function adminConfirm(options) {
  if (!window.Swal) return Promise.resolve({ isConfirmed: false });
  return Swal.fire({
    ...ADMIN_SWAL_BASE,
    ...(options || {})
  });
}


const state = {
  productos: [],
  categorias: [],
  pedidos: [],
  usuarios: []
};

function requireAdmin() {
  const flag = localStorage.getItem("tmw-admin");
  if (flag !== "1") {
    window.location.href = "./login.html";
  }
}

async function fetchJson(path) {
  const res = await fetch(API_URL + path);
  if (!res.ok) throw new Error("Error al cargar " + path);
  return await res.json();
}

async function loadAllData() {
  try {
    const [productos, categorias, pedidos, usuarios] = await Promise.all([
      fetchJson("/productos"),
      fetchJson("/categorias"),
      fetchJson("/compras"),
      fetchJson("/users")
    ]);
    state.productos = Array.isArray(productos) ? productos : [];
    state.categorias = Array.isArray(categorias) ? categorias : [];
    state.pedidos = Array.isArray(pedidos) ? pedidos : [];
    state.usuarios = Array.isArray(usuarios) ? usuarios : [];
    renderAll();
  } catch (e) {
    console.error(e);
    if (window.Swal) {
      adminAlert("Error", "No se pudieron cargar los datos del servidor.", "error");
    }
  }
}

function renderAll() {
  renderKpis();
  renderResumenAnalytics();
  renderCategoriasSelects();
  renderImagenesSelect();
  renderTablaProductos();
  renderTablaCategorias();
  renderTablaPedidos();
  renderTablaUsuarios();
}

function renderKpis() {
  document.getElementById("kpi-productos").textContent = state.productos.length;
  document.getElementById("kpi-pedidos").textContent = state.pedidos.length;
  document.getElementById("kpi-usuarios").textContent = state.usuarios.length;
}

function renderResumenAnalytics() {
  const ulProd = document.getElementById("top-productos");
  const ulUsers = document.getElementById("top-usuarios");
  const chart = document.getElementById("chart-entrega");
  const pedidos = Array.isArray(state.pedidos) ? state.pedidos : [];

  
  if (ulProd) {
    const productosMap = new Map();
    pedidos.forEach(p => {
      (p.items || []).forEach(item => {
        const id = item.id || item.nombre || "";
        if (!id) return;
        const nombre = item.nombre || "Producto";
        const key = id;
        const prev = productosMap.get(key) || { id, nombre, cantidad: 0, total: 0 };
        const qty = Number(item.cantidad || 1);
        const precio = Number(item.precio || 0);
        prev.cantidad += qty;
        prev.total += precio * qty;
        productosMap.set(key, prev);
      });
    });
    const listaProd = Array.from(productosMap.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 3);

    if (!listaProd.length) {
      ulProd.innerHTML = '<li class="empty">Todavía no hay pedidos.</li>';
    } else {
      const maxCant = Math.max(...listaProd.map(p => p.cantidad));
      ulProd.innerHTML = listaProd.map(p => {
        const pct = maxCant > 0 ? (p.cantidad / maxCant) * 100 : 0;
        return `
          <li>
            <span class="name">${p.nombre}</span>
            <div class="bar"><span style="width:${pct.toFixed(0)}%"></span></div>
            <span class="badge">x${p.cantidad}</span>
          </li>
        `;
      }).join("");
    }
  }

  
  if (ulUsers) {
    const usuariosMap = new Map();
    pedidos.forEach(p => {
      const email = p.usuarioEmail || "Sin email";
      const prev = usuariosMap.get(email) || { email, pedidos: 0, total: 0 };
      prev.pedidos += 1;
      prev.total += Number(p.total || 0);
      usuariosMap.set(email, prev);
    });

    const listaUsers = Array.from(usuariosMap.values())
      .sort((a, b) => b.pedidos - a.pedidos)
      .slice(0, 3);

    if (!listaUsers.length) {
      ulUsers.innerHTML = '<li class="empty">Todavía no hay pedidos.</li>';
    } else {
      const maxPedidos = Math.max(...listaUsers.map(u => u.pedidos));
      ulUsers.innerHTML = listaUsers.map(u => {
        const pct = maxPedidos > 0 ? (u.pedidos / maxPedidos) * 100 : 0;
        return `
          <li>
            <span class="name">${u.email}</span>
            <div class="bar"><span style="width:${pct.toFixed(0)}%"></span></div>
            <span class="badge">${u.pedidos} pedido${u.pedidos !== 1 ? "s" : ""}</span>
          </li>
        `;
      }).join("");
    }
  }

  
  if (chart) {
    let envio = 0;
    let retiro = 0;
    let otros = 0;
    pedidos.forEach(p => {
      const tipo = String(p.entrega || "").toLowerCase();
      if (tipo === "envio") envio++;
      else if (tipo === "retiro" || tipo === "retiro en local") retiro++;
      else otros++;
    });
    const maxVal = Math.max(envio, retiro, otros, 1);
    function row(label, value) {
      const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
      return `
        <div class="row">
          <label>${label}</label>
          <div class="bar"><span style="width:${pct.toFixed(0)}%"></span></div>
          <span class="value">${value}</span>
        </div>
      `;
    }
    chart.innerHTML = row("Envío", envio) + row("Retiro", retiro) + (otros ? row("Otros", otros) : "");
  }
}

function renderCategoriasSelects() {
  const filtro = document.getElementById("filtro-categoria");
  const selForm = document.getElementById("select-categoria-form");
  if (!filtro || !selForm) return;
  const opts = state.categorias
    .map(c => `<option value="${c.id}">${c.nombre}</option>`)
    .join("");
  filtro.innerHTML = '<option value="">Todas las categorías</option>' + opts;
  selForm.innerHTML = '<option value="">Elegí una categoría</option>' + opts;
}


const IMAGENES_FIJAS = [
  
  "../img/bebidas/1prueba.jpg", 
  "../img/bebidas/2prueba.jpg",
  "../img/bebidas/3prueba.jpg",
];




function renderImagenesSelect() {
  const sel = document.getElementById("select-imagen-form");
  if (!sel) return;

  
  const rutas = Array.from(new Set([
    ...IMAGENES_FIJAS,
    ...state.productos.map(p => p.imagen).filter(Boolean)
  ]));

  const opts = rutas
    .map((r) => `<option value="${r}">${r}</option>`)
    .join("");

  sel.innerHTML = '<option value="">Elegí una imagen</option>' + opts;
}


function renderTablaProductos() {
  const tbody = document.getElementById("tabla-productos");
  if (!tbody) return;
  const busq = document.getElementById("busqueda-productos")?.value.toLowerCase() || "";
  const cat = document.getElementById("filtro-categoria")?.value || "";
  tbody.innerHTML = "";

  state.productos
    .filter(p => {
      const txt = (p.titulo + " " + p.id).toLowerCase();
      const matchTexto = !busq || txt.includes(busq);
      const matchCat = !cat || (p.categoria && p.categoria.id === cat);
      return matchTexto && matchCat;
    })
    .forEach(p => {
      const tr = document.createElement("tr");
      const catNombre = p.categoria && p.categoria.nombre ? p.categoria.nombre : "";
      tr.innerHTML = `
        <td><img src="${p.imagen || ""}" alt="${p.titulo}" class="img-thumb"></td>
        <td>${p.id}</td>
        <td>${p.titulo}</td>
        <td><span class="badge">${catNombre}</span></td>
        <td>$ ${p.precio?.toLocaleString("es-AR")}</td>
        <td>
          <button class="btn-table edit" data-id="${p.id}">Editar</button>
          <button class="btn-table delete" data-id="${p.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

function renderTablaCategorias() {
  const tbody = document.getElementById("tabla-categorias");
  if (!tbody) return;
  tbody.innerHTML = "";
  state.categorias.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.nombre}</td>
      <td>
        <button class="btn-table delete" data-id="${c.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderTablaPedidos() {
  const tbody = document.getElementById("tabla-pedidos");
  if (!tbody) return;
  tbody.innerHTML = "";
  state.pedidos.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.fechaHora || p.fecha || ""}</td>
      <td>${p.usuarioEmail || ""}</td>
      <td>$ ${p.total?.toLocaleString("es-AR")}</td>
      <td>${p.estado || ""}</td>
      <td>${p.entrega || ""}</td>
      <td>
        <button class="btn-table edit" data-id="${p.id}">Ver</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderTablaUsuarios() {
  const tbody = document.getElementById("tabla-usuarios");
  if (!tbody) return;
  tbody.innerHTML = "";
  state.usuarios.forEach(u => {
    const nombre = [u.nombre, u.apellido].filter(Boolean).join(" ");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nombre || "-"}</td>
      <td>${u.email}</td>
      <td>${u.telefono || "-"}</td>
      <td>${u.direccion || "-"}</td>
      <td>
        <button class="btn-table delete" data-id="${u.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}


function setupNav() {
  const buttons = document.querySelectorAll(".nav-item");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const panel = btn.dataset.panel;
      document.querySelectorAll(".admin-panel").forEach(sec => {
        sec.classList.toggle("visible", sec.id === "panel-" + panel);
      });
    });
  });
}

function setupProductos() {
  const form = document.getElementById("form-producto");
  const btnLimpiar = document.getElementById("btn-limpiar-form");
  const busq = document.getElementById("busqueda-productos");
  const filtro = document.getElementById("filtro-categoria");
  const tbody = document.getElementById("tabla-productos");

  if (busq) busq.addEventListener("input", renderTablaProductos);
  if (filtro) filtro.addEventListener("change", renderTablaProductos);

  if (btnLimpiar && form) {
    btnLimpiar.addEventListener("click", () => {
      form.reset();
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const id = (data.get("id") || "").toString().trim();
      const titulo = (data.get("titulo") || "").toString().trim();
      const precio = Number(data.get("precio") || 0);
      const catId = (data.get("categoria") || "").toString();
      const imagen = (data.get("imagen") || "").toString();

      if (!id || !titulo || !catId || !imagen || !precio) {
        adminAlert("Atención", "Completá todos los campos del producto.", "warning");
        return;
      }

      const cat = state.categorias.find(c => c.id === catId) || { id: catId, nombre: catId };
      const body = {
        id,
        titulo,
        precio,
        imagen,
        categoria: {
          id: cat.id,
          nombre: cat.nombre
        }
      };

      const existente = state.productos.find(p => p.id === id);
      try {
        if (existente) {
          await fetch(API_URL + "/productos/" + existente.id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          Object.assign(existente, body);
        } else {
          await fetch(API_URL + "/productos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          state.productos.push(body);
        }
        adminAlert("Listo", "Producto guardado correctamente.", "success");
        renderTablaProductos();
        renderImagenesSelect();
      } catch (e) {
        console.error(e);
        adminAlert("Error", "No se pudo guardar el producto.", "error");
      }
    });
  }

  if (tbody) {
    tbody.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = btn.dataset.id;
      const prod = state.productos.find(p => p.id === id);
      if (!prod) return;

      if (btn.classList.contains("edit")) {
        const form = document.getElementById("form-producto");
        if (!form) return;
        form.elements["id"].value = prod.id;
        form.elements["titulo"].value = prod.titulo;
        form.elements["precio"].value = prod.precio;
        form.elements["categoria"].value = prod.categoria?.id || "";
        form.elements["imagen"].value = prod.imagen || "";
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (btn.classList.contains("delete")) {
        const ok = await adminConfirm({
          title: "¿Eliminar producto?",
          text: "Esta acción no se puede deshacer.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar"
        });
        if (ok.isConfirmed) {
          try {
            await fetch(API_URL + "/productos/" + id, { method: "DELETE" });
            state.productos = state.productos.filter(p => p.id !== id);
            renderTablaProductos();
            adminAlert("Eliminado", "Producto eliminado correctamente.", "success");
          } catch (e) {
            console.error(e);
            adminAlert("Error", "No se pudo eliminar el producto.", "error");
          }
        }
      }
    });
  }
}

function setupCategorias() {
  const form = document.getElementById("form-categoria");
  const tbody = document.getElementById("tabla-categorias");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const id = (data.get("id") || "").toString().trim();
      const nombre = (data.get("nombre") || "").toString().trim();
      if (!id || !nombre) {
        adminAlert("Atención", "Completá ID y nombre de la categoría.", "warning");
        return;
      }
      const existente = state.categorias.find(c => c.id === id);
      try {
        if (existente) {
          await fetch(API_URL + "/categorias/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, nombre })
          });
          existente.nombre = nombre;
        } else {
          await fetch(API_URL + "/categorias", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, nombre })
          });
          state.categorias.push({ id, nombre });
        }
        adminAlert("Listo", "Categoría guardada correctamente.", "success");
        renderCategoriasSelects();
        renderTablaCategorias();
      } catch (e) {
        console.error(e);
        adminAlert("Error", "No se pudo guardar la categoría.", "error");
      }
    });
  }

  if (tbody) {
    tbody.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = btn.dataset.id;
      const usada = state.productos.some(p => p.categoria && p.categoria.id === id);
      if (usada) {
        adminAlert("Atención", "No podés eliminar una categoría que tiene productos asignados.", "info");
        return;
      }
      const ok = await adminConfirm({
        title: "¿Eliminar categoría?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });
      if (ok.isConfirmed) {
        try {
          await fetch(API_URL + "/categorias/" + id, { method: "DELETE" });
          state.categorias = state.categorias.filter(c => c.id !== id);
          renderCategoriasSelects();
          renderTablaCategorias();
          Swal.fire("Eliminada", "Categoría eliminada correctamente.", "success");
        } catch (e) {
          console.error(e);
          Swal.fire("Error", "No se pudo eliminar la categoría.", "error");
        }
      }
    });
  }
}

function setupPedidos() {
  const tbody = document.getElementById("tabla-pedidos");
  if (!tbody) return;
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    const pedido = state.pedidos.find(p => p.id === id);
    if (!pedido) return;

    const itemsHtml = (pedido.items || [])
      .map(it => `<li>${it.cantidad} x ${it.nombre} - $ ${it.precio?.toLocaleString("es-AR")}</li>`)
      .join("");

    adminConfirm({
      title: "Detalle del pedido",
      showCancelButton: false,
      confirmButtonText: "Cerrar",
      html: `
        <p><strong>ID:</strong> ${pedido.id}</p>
        <p><strong>Fecha:</strong> ${pedido.fechaHora || pedido.fecha || ""}</p>
        <p><strong>Usuario:</strong> ${pedido.usuarioEmail || ""}</p>
        <p><strong>Entrega:</strong> ${pedido.entrega || ""}</p>
        <p><strong>Estado:</strong> ${pedido.estado || ""}</p>
        <p><strong>Total:</strong> $ ${pedido.total?.toLocaleString("es-AR")}</p>
        <hr>
        <p><strong>Productos:</strong></p>
        <ul style="text-align:left">${itemsHtml}</ul>
      `,
      icon: "info"
    });
  });
}

function setupUsuarios() {
  const tbody = document.getElementById("tabla-usuarios");
  if (!tbody) return;
  tbody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    const usuario = state.usuarios.find(u => u.id === id);
    if (!usuario) return;

    const ok = await adminConfirm({
      title: "¿Eliminar usuario?",
      text: "Se eliminará el usuario y sus datos asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (ok.isConfirmed) {
      try {
        await fetch(API_URL + "/users/" + id, { method: "DELETE" });
        state.usuarios = state.usuarios.filter(u => u.id !== id);
        renderTablaUsuarios();
        Swal.fire("Eliminado", "Usuario eliminado correctamente.", "success");
      } catch (e) {
        console.error(e);
        Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
      }
    }
  });
}

function setupLogout() {
  const btn = document.getElementById("btn-admin-logout");
  if (!btn) return;

  btn.addEventListener("click", () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión de administrador.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cerrar sesión",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      background: "#0f172a",
      color: "#e2e8f0"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("tmw-admin");
       
        window.location.href = "../index.html";
      }
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
  requireAdmin();
  startAdminClock();
  setupNav();
  setupProductos();
  setupCategorias();
  setupPedidos();
  setupUsuarios();
  setupLogout();
  loadAllData();
});
