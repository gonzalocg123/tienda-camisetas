# Proyecto: Tienda de Camisetas - Panel de Administración

Este proyecto implementa el backend y frontend para la gestión de una tienda de camisetas, operando exclusivamente bajo el perfil de Administrador (ADMIN). Está desarrollado utilizando una arquitectura cliente-servidor basada en Spring Boot, MongoDB y una Single Page Application (SPA) ligera con HTML5, Bootstrap y jQuery.

## Modelo de Datos y Diseño Documental

Para este proyecto se ha adaptado el modelo de datos a la naturaleza de MongoDB, una base de datos orientada a documentos, alejándose del modelo relacional tradicional.

**Justificación del patrón Maestro-Detalle embebido en Pedidos:**
En lugar de crear una colección independiente para las "Líneas de Pedido" (como se haría en SQL para normalizar la base de datos), se ha optado por embeber la lista de camisetas compradas directamente dentro del documento del `Pedido`. 

* **Eficiencia en lectura:** Al embeber las líneas de pedido, podemos recuperar toda la información de una transacción (el maestro y sus detalles) mediante una única consulta a la base de datos.
* **Evitar Joins:** MongoDB no está optimizado para realizar uniones complejas entre múltiples colecciones. Embeber los datos previene la necesidad de emular estos "joins" a nivel de aplicación.
* **Aislamiento de la información (Snapshot):** Al guardar los datos esenciales de la camiseta (nombre, talla, precio en el momento de la compra) dentro del pedido, garantizamos que si el precio de la camiseta cambia en el futuro en el catálogo, el histórico del pedido se mantenga inalterado.

## Requisitos Previos

Para ejecutar este proyecto de forma reproducible, necesitarás tener instalados:
* Docker y Docker Compose.
* Visual Studio Code (VS Code).
* Extensión "Dev Containers" instalada en VS Code.

## Configuración y Arranque del Entorno (DevContainer)

El proyecto está configurado para ejecutarse dentro de un contenedor de desarrollo, lo que garantiza que todas las dependencias (incluyendo la base de datos MongoDB) se configuren automáticamente.

1. **Preparar variables de entorno:**
   Clona el repositorio y navega a la carpeta raíz. Copia el archivo de ejemplo para crear tu propio archivo de configuración local:
   `cp .env.example .env`
   *Nota: El archivo `.env` está excluido del control de versiones por seguridad.*

2. **Iniciar el DevContainer:**
   * Abre la carpeta del proyecto en VS Code.
   * VS Code detectará la carpeta `.devcontainer` y mostrará una notificación en la esquina inferior derecha. Haz clic en **"Reopen in Container"**.
   * Si no aparece la notificación, abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`) y selecciona `Dev Containers: Reopen in Container`.
   * Docker descargará las imágenes necesarias (incluyendo MongoDB) y levantará el entorno.

## Arranque del Backend (Spring Boot)

Una vez dentro del DevContainer, la base de datos MongoDB ya estará ejecutándose en segundo plano. Para iniciar el servidor de Spring Boot:

1. Abre un terminal integrado en VS Code (`Ctrl+ñ` o `Terminal -> New Terminal`).
2. Ejecuta el siguiente comando:
   `./mvnw spring-boot:run`
3. El servidor arrancará y la aplicación estará disponible en `http://localhost:8080`.

## Uso y Prueba de la Interfaz Gráfica (UI)

Para probar la interfaz web del perfil ADMIN:

1. Asegúrate de que el backend está en ejecución.
2. Abre tu navegador web y accede a `http://localhost:8080`.
3. Podrás navegar por las siguientes secciones utilizando el menú principal:
   * **Camisetas:** Visualiza el catálogo actual. Utiliza los botones de "Crear", "Editar" y "Eliminar" para probar el CRUD completo. Al crear, verifica que las validaciones de precio y stock funcionen correctamente.
   * **Usuarios:** Visualiza, crea, edita y elimina usuarios del sistema.
   * **Pedidos:** * **Crear Pedido:** Selecciona un usuario existente y añade camisetas al carrito indicando la cantidad. Al guardar, el sistema calculará los totales y descontará el stock (si la lógica de negocio extendida está implementada).
       * **Listado y Detalle:** En la lista de pedidos, haz clic en el botón de "Ver Detalle" de cualquier registro para abrir un modal o sección que muestre la información completa del pedido (patrón maestro-detalle), sin recargar la página.

## Comprobación de Endpoints REST (API)

Si deseas probar la API directamente sin usar el frontend, puedes utilizar herramientas como Postman o comandos `curl` desde un terminal externo o dentro del propio DevContainer.

A continuación, algunos ejemplos de peticiones:

**1. Listar todas las camisetas (GET):**
`curl -X GET http://localhost:8080/api/camisetas`

**2. Crear una nueva camiseta (POST):**
`curl -X POST http://localhost:8080/api/camisetas \`
`-H "Content-Type: application/json" \`
`-d '{`
`  "nombre": "Camiseta Básica",`
`  "talla": "M",`
`  "color": "Rojo",`
`  "precio": 15.99,`
`  "stock": 50`
`}'`

**3. Obtener el detalle de un pedido (GET):**
*(Sustituye `{id}` por un ID válido devuelto al listar pedidos)*
`curl -X GET http://localhost:8080/api/pedidos/{id}`

**4. Comprobar validación de errores (POST con datos inválidos):**
*(Este endpoint debería devolver un HTTP 400 Bad Request debido al precio negativo)*
`curl -X POST http://localhost:8080/api/camisetas \`
`-H "Content-Type: application/json" \`
`-d '{`
`  "nombre": "",`
`  "precio": -5.00`
`}'`