Descripción del Proyecto

Tu Morfi Web es un proyecto de sitio gastronómico que incluye:

	-Página principal con animaciones.

	-Sistema de Login y Registro.

	-Panel de Usuario (Resumen, Compras, Favoritos).
	
	-Carrito de compras dinámico.

	-Datos de compra con validación.

	-Panel Administrador:
	
		-CRUD de Productos

		-CRUD de Categorías

		-CRUD de Usuarios

		-Visualización de Pedidos

	-Sistema de almacenamiento con json-server


REQUISITOS

1.  Python 3.10 o superior instalado
2.  Node.js instalado
3.  npm instalado
4.  json-server instalado globalmente:
    npm install -g json-server

CÓMO FUNCIONA EL SERVIDOR

El archivo server.py inicia AUTOMÁTICAMENTE ambos servidores:

1.  Servidor Frontend (Python SimpleHTTPServer): http://localhost:5508
    → Sirve los archivos HTML, CSS y JS.

2.  Servidor JSON (json-server): http://localhost:3008
    → Maneja los endpoints para productos, categorías, usuarios,
    compras, favoritos, etc.

El servidor Python ejecuta json-server internamente,
así que NO necesitás abrir dos consolas.

CÓMO EJECUTAR EL PROYECTO

1.  Abrí una terminal en la carpeta raíz del proyecto.
2.  Ejecutá: python server.py
3.  Automáticamente se levantarán:
    -   FRONTEND en localhost:5508
    -   BACKEND en localhost:3008

NOTAS IMPORTANTES

-   Si agregás nuevas imágenes, asegurate de referenciarlas con rutas
    relativas correctas.
-   db.json debe permanecer en la carpeta raíz.
-   Si json-server ya estaba corriendo, server.py puede fallar; cerrá
    instancias previas.
-   Para detener el servidor, presioná CTRL + C.

CONTACTO

Proyecto desarrollado por Steven - FANTASTICOS

email: stevencarita9818@gmail.com 
