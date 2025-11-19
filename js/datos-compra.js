(function () {
  
  function formatARS(n) {
    const v = Number(n || 0);
    return v.toLocaleString("es-AR", { maximumFractionDigits: 0 });
  }

  function getTipoEntrega() {
    const sel = document.querySelector("#tipo-entrega");
    if (sel) {
      return sel.value || "";
    }
    const checked = document.querySelector('input[name="entrega"]:checked');
    return (checked && checked.value) || "";
  }

  function calcEnvio(tipo, localidad, cp) {
    if (tipo !== "envio") return 0;
    const loc = String(localidad || "").toLowerCase().trim();
    const cpStr = String(cp || "").trim();
    if (loc === "mataderos") return 0;
    if (loc === "parque avellaneda" || loc === "lugano") return 3000;
    if (cpStr.startsWith && cpStr.startsWith("14")) return 2500;
    if (
      cpStr.startsWith &&
      (cpStr.startsWith("16") ||
        cpStr.startsWith("17") ||
        cpStr.startsWith("18"))
    )
      return 3500;
    if (loc.includes("caba") || loc.includes("capital")) return 2500;
    if (loc.includes("gba") || loc.includes("buenos aires")) return 3500;
    return 0;
  }

  function readJSON(store, key) {
    try {
      const raw = store.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function getCarrito() {
    const KEYS = ["productos-en-carrito", "productosEnCarrito", "carrito"];
    for (const k of KEYS) {
      const a = readJSON(localStorage, k);
      if (Array.isArray(a) && a.length) return a;
      const b = readJSON(sessionStorage, k);
      if (Array.isArray(b) && b.length) return b;
    }
    return [];
  }

  
  const API_URL = "http://localhost:3008";

  function generarIdCompra() {
    try {
      return "#C-" + Date.now().toString().slice(-6);
    } catch (e) {
      return "#C-" + Math.floor(Math.random() * 1000000);
    }
  }

  function fechaHoyStr() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return dd + "/" + mm + "/" + yy;
  }

  function fechaHoraStr(){
    const d=new Date();
    const dd=String(d.getDate()).padStart(2,"0");
    const mm=String(d.getMonth()+1).padStart(2,"0");
    const yy=d.getFullYear();
    const hh=String(d.getHours()).padStart(2,"0");
    const mi=String(d.getMinutes()).padStart(2,"0");
    return dd+"/"+mm+"/"+yy+" "+hh+":"+mi;
  }
  

  function registrarCompra(origen, datos, carrito, total) {
    try {
      carrito = Array.isArray(carrito) ? carrito : [];
      const email =
        (window.AppDB &&
          typeof window.AppDB.getCurrentUserEmail === "function" &&
          window.AppDB.getCurrentUserEmail()) ||
        datos.email ||
        "";

      const compra = {
        id: generarIdCompra(),
        fecha: fechaHoyStr(),
        fechaHora: fechaHoraStr(),
        total: Number(total || 0),
        estado: origen === "retiro" ? "Retiro en local" : "Pendiente de pago",
        entrega: datos.entrega || "",
        direccion: datos.direccion || "",
        localidad: datos.localidad || "",
        cp: datos.cp || "",
        envio_costo: Number(datos.envio_costo || 0),
        usuarioEmail: email,
        items: carrito.map((p) => ({
          id: p.id,
          nombre: p.titulo || p.nombre || "Producto",
          cantidad: Number(p.cantidad || 1),
          precio: Number(p.precio || 0),
        })),
      };

      // Guardar en localStorage
      try {
        const raw = localStorage.getItem("historial-compras");
        let lista = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(lista)) lista = [];
        lista.push(compra);
        localStorage.setItem("historial-compras", JSON.stringify(lista));
      } catch (e) {
        console.warn(
          "[Datos-compra] No se pudo guardar historial en localStorage",
          e
        );
      }

      // Guardar en JSON Server
      try {
        fetch(API_URL + "/compras", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(compra),
        }).catch((err) => {
          console.warn(
            "[Datos-compra] No se pudo enviar compra a JSON Server",
            err
          );
        });
      } catch (e) {
        console.warn(
          "[Datos-compra] Error general al enviar compra a JSON Server",
          e
        );
      }

      return compra;
    } catch (e) {
      console.warn("[Datos-compra] registrarCompra falló", e);
      return null;
    }
  }

  
  function ensureListaResumen() {
    const panel =
      document.querySelector(".resumen-compra") ||
      document.querySelector("aside") ||
      document.body;
    let wrapper = panel.querySelector(".resumen-lista");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "resumen-lista";
      const totals = panel.querySelector(".resumen-totales");
      panel.insertBefore(wrapper, totals || panel.firstChild);
    }
    let lista =
      wrapper.querySelector("#lista-resumen") ||
      panel.querySelector("#lista-resumen");
    if (!lista) {
      lista = document.createElement("ul");
      lista.id = "lista-resumen";
      wrapper.appendChild(lista);
    } else if (lista.parentElement !== wrapper) {
      wrapper.appendChild(lista);
    }
    return lista;
  }

  
  function renderResumen() {
    const lista = ensureListaResumen();
    const subElem = document.querySelector("#subtotal-resumen");
    const envioElem = document.querySelector("#envio-resumen");
    const totalElem = document.querySelector("#precio-total");
    const badge = document.querySelector("#envio-badge");
    const msg = document.querySelector("#envio-msg");

    const carrito = getCarrito();
    console.debug("[Datos de compra] Carrito leído:", carrito);
    lista.innerHTML = "";

    let subtotal = 0;
    carrito.forEach((p) => {
      const nombre = p.titulo || p.nombre || "Producto";
      const unit = Number(p.precio) || 0;
      const qty = Number(p.cantidad) || 1;
      const st = unit * qty;
      subtotal += st;
      const li = document.createElement("li");
      li.className = "resumen-item";
      li.style.cssText =
        "display:grid;grid-template-columns:56px 1fr auto;align-items:center;gap:.75rem;padding:.5rem 0;border-bottom:1px solid #eee;";
      const imgSrc = p.imagen || p.imagenUrl || p.img || "";
      const imgTag = imgSrc
        ? `<img src="${imgSrc}" alt="${nombre}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;">`
        : `<div style="width:48px;height:48px;border-radius:8px;background:#f2f2f2"></div>`;
      li.innerHTML = `${imgTag}
        <div>
          <div style="font-weight:600;line-height:1.2">${nombre}</div>
          <small style="opacity:.75">$${formatARS(unit)} × ${qty}</small>
        </div>
        <div style="font-weight:600">$${formatARS(st)}</div>`;
      lista.appendChild(li);
    });

    const locEl = document.querySelector("#localidad");
    const cpEl = document.querySelector("#cp");
    const tipo = getTipoEntrega();
    const envio = calcEnvio(
      tipo,
      locEl && locEl.value,
      cpEl && cpEl.value
    );
    const total = subtotal + envio;

    if (subElem) subElem.textContent = `$${formatARS(subtotal)}`;
    if (envioElem) envioElem.textContent = `$${formatARS(envio)}`;
    if (totalElem) totalElem.textContent = `$${formatARS(total)}`;

    if (badge) {
      badge.hidden = !(tipo === "envio" && envio === 0);
      if (!badge.hidden) badge.textContent = "GRATIS";
    }
    if (msg) {
      if (tipo === "envio" && envio === 0)
        msg.textContent = "Envío gratis a Mataderos.";
      else if (
        tipo === "envio" &&
        locEl &&
        ["parque avellaneda", "lugano"].includes(
          String(locEl.value || "").toLowerCase()
        )
      )
        msg.textContent = "Costo de envío fijo: $3.000.";
      else if (tipo === "envio")
        msg.textContent = "Costo estimado según zona.";
      else msg.textContent = "Retiro en local sin costo de envío.";
    }
  }

 
  (function wire() {
    const form = document.querySelector("#form-datos-compra");
    const selectEntrega = document.querySelector("#tipo-entrega");
    const radiosEntrega = document.querySelectorAll(
      'input[name="entrega"]'
    );
    const bloqueEnvio = document.querySelector("#bloque-envio");

    function updateEnvio() {
      const v = getTipoEntrega();
      if (bloqueEnvio)
        bloqueEnvio.style.display = v === "envio" ? "block" : "none";
      renderResumen();
    }
    if (selectEntrega)
      selectEntrega.addEventListener("change", updateEnvio);
    radiosEntrega.forEach((r) =>
      r.addEventListener("change", updateEnvio)
    );

    const locEl = document.querySelector("#localidad");
    const cpEl = document.querySelector("#cp");
    if (locEl) locEl.addEventListener("change", renderResumen);
    if (cpEl) cpEl.addEventListener("input", renderResumen);

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

     
        document
          .querySelectorAll(".campo-error")
          .forEach((el) => el.classList.remove("campo-error"));
        const erroresBox = document.querySelector("#errores-form");
        if (erroresBox) {
          erroresBox.hidden = true;
          erroresBox.textContent = "";
        }

        const datos = {
          nombre: (document.querySelector("#nombre")?.value || "").trim(),
          apellido: (document.querySelector("#apellido")?.value || "").trim(),
          telefono: (document.querySelector("#telefono")?.value || "").trim(),
          email: (document.querySelector("#email")?.value || "").trim(),
          entrega: getTipoEntrega(),
          direccion: (document.querySelector("#direccion")?.value || "").trim(),
          piso: (document.querySelector("#piso")?.value || "").trim(),
          localidad: (document.querySelector("#localidad")?.value || "").trim(),
          cp: (document.querySelector("#cp")?.value || "").trim(),
          observaciones: (document.querySelector("#observaciones")?.value || "").trim(),
        };

        const camposConError = [];

        function marcarError(selector, nombreCampo) {
          const el = document.querySelector(selector);
          if (el) {
            el.classList.add("campo-error");
          }
          camposConError.push(nombreCampo);
        }

        if (!datos.nombre) marcarError("#nombre", "Nombre");
        if (!datos.apellido) marcarError("#apellido", "Apellido");
        if (!datos.telefono) marcarError("#telefono", "Teléfono");
        if (!datos.email) marcarError("#email", "Email");
        if (!datos.entrega)
          marcarError("#tipo-entrega", "Tipo de entrega");

        if (datos.entrega === "envio") {
          if (!datos.direccion) marcarError("#direccion", "Dirección");
          if (!datos.localidad) marcarError("#localidad", "Localidad");
          if (!datos.cp) marcarError("#cp", "Código Postal");
        }

        

        const carrito = getCarrito();
        const sub = carrito.reduce(
          (a, p) =>
            a + (Number(p.precio) || 0) * (Number(p.cantidad) || 1),
          0
        );
        const env = calcEnvio(
          datos.entrega,
          datos.localidad,
          datos.cp
        );
        datos.envio_costo = env;
        datos.total_estimado = sub + env;

        localStorage.setItem("datos-compra", JSON.stringify(datos));

        if (datos.entrega === "retiro") {
          Swal.fire({
            title: "¿Estas Seguro?",
            text: "Confirme que desea retirar su pedido en nuestro local sin costo de envío.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#4cd630ff",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, retirar en el local",
            cancelButtonText: "No, cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              const carrito = getCarrito();
              const sub = carrito.reduce(
                (a, p) =>
                  a +
                  (Number(p.precio) || 0) *
                    (Number(p.cantidad) || 1),
                0
              );

              datos.envio_costo = 0;
              datos.total_estimado = sub;
              localStorage.setItem(
                "datos-compra",
                JSON.stringify(datos)
              );

             
              registrarCompra("retiro", datos, carrito, sub);

              Swal.fire({
                title: "¡Pedido confirmado!",
                text: "¡Gracias por elegirnos! Su pedido estará listo para ser retirado en nuestro local.",
                icon: "success",
                confirmButtonColor: "#4cd630ff",
              }).then(() => {
                localStorage.removeItem("productos-en-carrito");
                location.href = "../index.html";
              });
            }
          });

          return;
        }

    
        location.href = "pago-end.html";
      });
    }

    // init
    updateEnvio();
    renderResumen();
  })();
})();
