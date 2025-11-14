TU MORFI WEB - GUIA 

Objetivo
Este sitio muestra un catalogo de comidas, permite filtrar por categoria, agregar productos al carrito, ver cantidades y total, y simular la compra. El estado del carrito se guarda en localStorage para persistir entre recargas.

Se agregaran mejoras continuas en el transcurso de los dias

Estructura de carpetas
- index.html
- pages/menu.html
- pages/carrito.html
- js/main.js        logica principal de render y manejo de carrito
- js/carrito.js     logica especifica de la pagina del carrito
- js/menu.js        comportamiento del menu lateral en mobile (abrir/cerrar)
- css/style.css, css/main.css
- img/...           imagenes de productos

Puntos clave en HTML
- contenedor-productos  grid donde se inyectan las tarjetas de productos
- numerito              badge que muestra la cantidad total en el carrito
- aside                 menu lateral de categorias que se abre con clase aside-visible
- En carrito.html:
  - carrito-vacio       se muestra cuando no hay productos
  - carrito-productos   lista de items con imagen, precio, cantidad, subtotal
  - carrito-acciones    botones vaciar y comprar mas total
  - carrito-comprado    mensaje de confirmacion luego de comprar
  - total               suma final de la compra

Flujo principal
1) Cargar productos
   - main.js define un catalogo estatico en const productos.
   - cargarProductos(lista) crea las tarjetas y las inserta en contenedor-productos.

2) Filtrar por categoria
   - botones de categoria disparan el render de la lista filtrada.
   - en mobile, al elegir una categoria se cierra el aside para ver el grid.

3) Agregar al carrito
   - botones "Agregar" llaman a agregarAlCarrito(e).
   - si el producto ya estaba se incrementa cantidad, si no se agrega con cantidad 1.
   - se actualiza el numerito (total de unidades) y se guarda en localStorage.

4) Persistencia
   - al iniciar, se lee "productos-en-carrito" desde localStorage.
   - despues de cada cambio, se guarda nuevamente.

5) Pagina del carrito
   - carrito.js reconstruye la lista desde localStorage.
   - cada item muestra imagen, precio, cantidad, subtotal y control para eliminar.
   - actualizarTotal() recalcula la suma precio*cantidad.
   - Vaciar carrito borra todos los items y storage.
   - Comprar simula la compra, vacia el storage y muestra "carrito-comprado".

Donde tocar para agregar mas productos
- js/main.js en el array const productos.
  - id, titulo, imagen, categoria { nombre, id }, precio.
  - la categoria id debe coincidir con el boton de la UI (ej: "pizzas").

Notas de UX mobile
- menu.js abre y cierra el menu lateral con openMenu y closeMenu.
- al hacer click en un link del menu se cierra solo para volver al contenido.
- en main.js, al elegir una categoria tambien se remueve aside-visible.

Mantenimiento rapido
- para cambiar precios o titulos editar el array productos en main.js.
- para cambiar la imagen actualizar la ruta en la propiedad imagen.
- para agregar una categoria nueva crear boton en HTML y usar el mismo id de categoria en productos.

...

==========================================
JSON SERVER (db.json)
==========================================

Para simular una base de datos real se usa JSON Server leyendo y escribiendo sobre el archivo db.json.

1) Instalar JSON Server (una sola vez)
   npm install -g json-server

2) Levantar el servidor en la carpeta TU_MORFI_WEB (donde está db.json)
   json-server --watch db.json --port 3001

3) Endpoints principales que usa el sitio:
   - GET /users          -> sincroniza usuarios con AppDB (pago-db.js)
   - POST /users         -> alta de usuarios cuando te registrás
   - PATCH /users/:id    -> actualización de favoritos por usuario
   - GET /compras?usuarioEmail=EMAIL  -> historial de compras por usuario
   - POST /compras       -> guardar una nueva compra (retiro o pago online)

Historial de compras
--------------------
- Cuando confirmás "Retiro en el local" en datos-compra.html
  se crea un registro de compra con:
    id, fecha, total, estado "Retiro en local",
    datos de entrega, items del carrito y usuarioEmail.
  Se guarda en:
    - localStorage["historial-compras"]
    - JSON Server (db.json -> arreglo "compras")

- Cuando el pago con tarjeta en pago-end.html es exitoso,
  pago.js llama a registrarCompraPago(currentTotal):
    - genera id y fecha
    - toma datos de envio desde localStorage["datos-compra"]
    - lee items desde localStorage["productos-en-carrito"]
    - marca estado "Pagado en línea"
    - guarda en localStorage["historial-compras"]
    - y hace POST /compras contra JSON Server

Perfil de usuario
-----------------
- En pages/perfil.html el script js/perfil.js ahora:
    - Obtiene el usuario actual desde AppDB (si existe)
    - Intenta leer las compras desde JSON Server:
          GET /compras?usuarioEmail=<email_del_usuario>
    - Si el servidor no está levantado o falla,
      cae en un fallback usando localStorage["historial-compras"]
      o datos demo.


