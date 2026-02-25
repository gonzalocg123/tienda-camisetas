const API = {
  camisetas: "/api/camisetas",
  usuarios: "/api/usuarios",
  pedidos: "/api/pedidos"
};

// Estado local
let pedidoActual = {
  items: []
};
let listaCamisetasGlobal = []; // Para lookup
let listaUsuariosGlobal = []; // Para lookup de usuarios

$(document).ready(function () {
  // Carga inicial
  cargarCamisetas();
  cargarUsuarios();
  cargarPedidos();

  // Event Listeners Forms
  $("#formCamiseta").on("submit", function (e) {
    e.preventDefault();
    crearCamiseta();
  });

  $("#btnCancelarEdicion").on("click", function () {
    cancelarEdicion();
  });

  $("#formUsuario").on("submit", function (e) {
    e.preventDefault();
    crearUsuario();
  });

  $("#btnCancelarEdicionUsuario").on("click", function () {
    cancelarEdicionUsuario();
  });

  // Event Listeners Pedidos
  $("#btnAddLinea").click(agregarLineaPedido);
  $("#formPedido").on("submit", function (e) {
    e.preventDefault();
    confirmarPedido();
  });

  // Recargar datos al cambiar de pestaña
  $("#menu_camisetas").click(cargarCamisetas);
  $("#menu_usuarios").click(cargarUsuarios);
  $("#menu_pedidos").click(function () {
    cargarPedidos();
    cargarUsuarios(); // Para el select
    cargarCamisetas(); // Para el select (y actualizar stock)
  });
});

/* =========================
   UTILIDADES
   ========================= */
function showAlert(type, msg) {
  $("#alerta")
    .removeClass("d-none alert-success alert-danger alert-warning alert-info")
    .addClass("alert-" + type)
    .text(msg);
  setTimeout(() => $("#alerta").addClass("d-none"), 3000);
}

function parseApiError(xhr, fallbackMsg) {
  const r = xhr.responseJSON;
  if (!r) return fallbackMsg;
  if (r.details && r.details.length > 0) {
    return `${r.message}: ${r.details.join(" | ")}`;
  }
  return r.message || fallbackMsg;
}

/* =========================
   CAMISETAS
   ========================= */
function cargarCamisetas() {
  $.getJSON(API.camisetas)
    .done(function (data) {
      listaCamisetasGlobal = data || [];
      renderCamisetasTable(data);
      renderCamisetasSelect(data);
    })
    .fail(xhr => showAlert("danger", "Error cargando camisetas"));
}

function renderCamisetasTable(data) {
  const html = data.map(c => `
        <tr>
            <td>${c.nombre}</td>
            <td>${c.talla}</td>
            <td>
                <span style="display:inline-block;width:20px;height:20px;background-color:${c.color};border:1px solid #ccc;border-radius:50%;vertical-align:middle;"></span>
                ${c.color}
            </td>
            <td>${c.precio} €</td>
            <td>${c.stock}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" onclick="editarCamiseta('${c.id}')">Editar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarCamiseta('${c.id}')">Eliminar</button>
            </td>
        </tr>
    `).join("");
  $("#tablaCamisetas").html(html || '<tr><td colspan="6" class="text-center">Sin camisetas</td></tr>');
}

function renderCamisetasSelect(data) {
  let opts = '<option value="">Seleccione camiseta...</option>';
  data.forEach(c => {
    opts += `<option value="${c.id}">${c.nombre} (${c.talla}) - ${c.precio}€ - Stock: ${c.stock}</option>`;
  });
  $("#pedCamisetaSelect").html(opts);
}

function crearCamiseta() {
  const id = $("#camId").val();
  const payload = {
    nombre: $("#camNombre").val(),
    talla: $("#camTalla").val(),
    color: $("#camColor").val(),
    precio: parseFloat($("#camPrecio").val()),
    stock: parseInt($("#camStock").val())
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `${API.camisetas}/${id}` : API.camisetas;

  $.ajax({
    url: url,
    method: method,
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(() => {
      showAlert("success", id ? "Camiseta actualizada" : "Camiseta creada");
      cancelarEdicion(); // Limpia y resetea estado
      cargarCamisetas();
    })
    .fail(xhr => showAlert("danger", parseApiError(xhr, "Error guardando camiseta")));
}

function editarCamiseta(id) {
  const c = listaCamisetasGlobal.find(x => x.id === id);
  if (!c) return;

  $("#camId").val(c.id);
  $("#camNombre").val(c.nombre);
  $("#camTalla").val(c.talla);
  $("#camColor").val(c.color);
  $("#camPrecio").val(c.precio);
  $("#camStock").val(c.stock);

  $("#btnGuardarCamiseta").text("Actualizar Camiseta");
  $("#btnCancelarEdicion").removeClass("d-none");

  window.scrollTo(0, 0);
}

function cancelarEdicion() {
  $("#formCamiseta")[0].reset();
  $("#camId").val("");
  $("#btnGuardarCamiseta").text("Guardar Camiseta");
  $("#btnCancelarEdicion").addClass("d-none");
}

function eliminarCamiseta(id) {
  if (!confirm("¿Borrar camiseta?")) return;
  $.ajax({ url: `${API.camisetas}/${id}`, method: "DELETE" })
    .done(() => {
      showAlert("success", "Eliminada");
      cargarCamisetas();
      // Si estábamos editando esta misma, cancelamos
      if ($("#camId").val() === id) {
        cancelarEdicion();
      }
    })
    .fail(xhr => showAlert("danger", "No se puede eliminar (posiblemente tenga pedidos asociados)"));
}

/* =========================
   USUARIOS
   ========================= */
function cargarUsuarios() {
  $.getJSON(API.usuarios)
    .done(function (data) {
      listaUsuariosGlobal = data || []; // Guardar en global
      renderUsuariosTable(data);
      renderUsuariosSelect(data);
    })
    .fail(xhr => showAlert("danger", "Error cargando usuarios"));
}

function renderUsuariosTable(data) {
  const html = data.map(u => `
        <tr>
            <td>${u.nombre}</td>
            <td>${u.email}</td>
            <td>${u.rol || "N/A"}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" onclick="editarUsuario('${u.id}')">Editar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario('${u.id}')">Eliminar</button>
            </td>
        </tr>
    `).join("");
  $("#tablaUsuarios").html(html || '<tr><td colspan="4" class="text-center">Sin usuarios</td></tr>');
}

function renderUsuariosSelect(data) {
  let opts = '<option value="">Seleccione usuario...</option>';
  data.forEach(u => {
    opts += `<option value="${u.id}">${u.nombre} (${u.email})</option>`;
  });
  $("#pedUsuario").html(opts);
}

function crearUsuario() {
  const id = $("#userId").val();
  const payload = {
    nombre: $("#userNombre").val(),
    email: $("#userEmail").val(),
    password: $("#userPassword").val(),
    rol: $("#userRol").val()
  };

  // Si editamos y password está vacío, podemos omitirlo o mandarlo vacío (el back debe manejarlo)
  // En este caso el back ignora si está vacío en user.update, pero es mejor mandarlo null o vacío
  if (!payload.password) delete payload.password;

  const method = id ? "PUT" : "POST";
  const url = id ? `${API.usuarios}/${id}` : API.usuarios;

  $.ajax({
    url: url,
    method: method,
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(() => {
      showAlert("success", id ? "Usuario actualizado" : "Usuario creado");
      cancelarEdicionUsuario();
      cargarUsuarios();
    })
    .fail(xhr => showAlert("danger", parseApiError(xhr, "Error guardando usuario")));
}

function editarUsuario(id) {
  const u = listaUsuariosGlobal.find(x => x.id === id);
  if (!u) return;

  $("#userId").val(u.id);
  $("#userNombre").val(u.nombre);
  $("#userEmail").val(u.email);
  $("#userRol").val(u.rol);
  $("#userPassword").val(""); // Password no se recupera por seguridad

  $("#btnGuardarUsuario").text("Actualizar Usuario");
  $("#btnCancelarEdicionUsuario").removeClass("d-none");

  // Scroll al formulario
  document.getElementById("panel_usuarios").scrollIntoView();
}

function cancelarEdicionUsuario() {
  $("#formUsuario")[0].reset();
  $("#userId").val("");
  $("#btnGuardarUsuario").text("Guardar Usuario");
  $("#btnCancelarEdicionUsuario").addClass("d-none");
}

function eliminarUsuario(id) {
  if (!confirm("¿Borrar usuario?")) return;
  $.ajax({ url: `${API.usuarios}/${id}`, method: "DELETE" })
    .done(() => {
      showAlert("success", "Eliminado");
      cargarUsuarios();
      if ($("#userId").val() === id) {
        cancelarEdicionUsuario();
      }
    })
    .fail(xhr => showAlert("danger", "Error eliminando usuario"));
}

/* =========================
   PEDIDOS
   ========================= */
function cargarPedidos() {
  $.getJSON(API.pedidos)
    .done(renderPedidosTable)
    .fail(xhr => showAlert("danger", "Error cargando pedidos"));
}

function renderPedidosTable(data) {
  const html = data.map(p => `
        <tr>
            <td>${new Date(p.fechaPedido).toLocaleString()}</td>
            <td>${p.id}</td>
            <td>${p.usuario ? p.usuario.nombre : 'Desc.'}</td>
            <td>${p.camisetas ? p.camisetas.length : 0} items</td>
            <td class="text-end">
                <button class="btn btn-sm btn-info" onclick="verDetallePedido('${p.id}')">Ver Detalle</button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarPedido('${p.id}')">Eliminar</button>
            </td>
        </tr>
    `).join("");
  $("#tablaPedidos").html(html || '<tr><td colspan="5" class="text-center">Sin pedidos</td></tr>');
}

function agregarLineaPedido() {
  const camisetaId = $("#pedCamisetaSelect").val();
  const cantidad = parseInt($("#pedCantidadInput").val());

  if (!camisetaId || !cantidad || cantidad < 1) {
    showAlert("warning", "Seleccione camiseta y cantidad válida");
    return;
  }

  // Buscar en lista global en lugar de data-obj
  const camisetaObj = listaCamisetasGlobal.find(c => c.id === camisetaId);

  if (!camisetaObj) {
    showAlert("danger", "Error interno: camiseta no encontrada en lista");
    return;
  }

  if (cantidad > camisetaObj.stock) {
    showAlert("warning", "Stock insuficiente (Disponible: " + camisetaObj.stock + ")");
    return;
  }

  // Añadir a lista local
  pedidoActual.items.push({
    camisetaId: camisetaId,
    cantidad: cantidad,
    // Datos extra para visualización
    nombre: camisetaObj.nombre,
    precio: camisetaObj.precio
  });

  renderLineasPedido();
  $("#pedCantidadInput").val(1);
  $("#pedCamisetaSelect").val("");
}

function renderLineasPedido() {
  const html = pedidoActual.items.map((item, idx) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${item.nombre} x ${item.cantidad} (${(item.precio * item.cantidad).toFixed(2)} €)
            <button type="button" class="btn btn-sm btn-danger py-0" onclick="quitarLinea(${idx})">X</button>
        </li>
    `).join("");

  $("#listaLineasPedido").html(html);
  $("#btnCrearPedido").prop("disabled", pedidoActual.items.length === 0);
}

function quitarLinea(index) {
  pedidoActual.items.splice(index, 1);
  renderLineasPedido();
}

function confirmarPedido() {
  const usuarioId = $("#pedUsuario").val();
  if (!usuarioId) {
    showAlert("warning", "Seleccione un usuario");
    return;
  }

  const payload = {
    usuarioId: usuarioId,
    items: pedidoActual.items.map(i => ({
      camisetaId: i.camisetaId,
      cantidad: i.cantidad
    }))
  };

  $.ajax({
    url: API.pedidos,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(() => {
      showAlert("success", "Pedido realizado con éxito");
      pedidoActual.items = [];
      renderLineasPedido();
      $("#pedUsuario").val("");

      // Recargar datos y stock visualmente
      cargarPedidos();
      cargarCamisetas();
    })
    .fail(xhr => showAlert("danger", parseApiError(xhr, "Error realizando pedido")));
}

function eliminarPedido(id) {
  if (!confirm("¿Eliminar pedido?")) return;
  $.ajax({ url: `${API.pedidos}/${id}`, method: "DELETE" })
    .done(() => { showAlert("success", "Eliminado"); cargarPedidos(); })
    .fail(xhr => showAlert("danger", "Error eliminando pedido"));
}

function verDetallePedido(id) {
  $.getJSON(`${API.pedidos}/${id}`)
    .done(p => {
      const lineasHtml = p.camisetas.map(c => `
                <tr>
                    <td>${c.nombre}</td>
                    <td>${c.talla}</td>
                    <td>${c.cantidad}</td>
                    <td>${c.precio} €</td>
                    <td>${(c.precio * c.cantidad).toFixed(2)} €</td>
                </tr>
            `).join("");

      const total = p.camisetas.reduce((sum, c) => sum + (c.precio * c.cantidad), 0);

      const html = `
                <h6><strong>ID Pedido:</strong> ${p.id}</h6>
                <p><strong>Fecha:</strong> ${new Date(p.fechaPedido).toLocaleString()}</p>
                <p><strong>Usuario:</strong> ${p.usuario.nombre} (${p.usuario.email})</p>
                <hr>
                <h6>Detalle de Artículos:</h6>
                <table class="table table-sm">
                    <thead><tr><th>Articulo</th><th>Talla</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead>
                    <tbody>
                        ${lineasHtml}
                        <tr>
                            <td colspan="4" class="text-end fw-bold">TOTAL:</td>
                            <td class="fw-bold">${total.toFixed(2)} €</td>
                        </tr>
                    </tbody>
                </table>
            `;

      $("#modalBodyDetalle").html(html);
      new bootstrap.Modal(document.getElementById('modalDetalle')).show();
    })
    .fail(() => showAlert("danger", "Error cargando detalle"));
}

// Exponer funciones globales
window.eliminarCamiseta = eliminarCamiseta;
window.eliminarUsuario = eliminarUsuario;
window.eliminarPedido = eliminarPedido;
window.verDetallePedido = verDetallePedido;
window.quitarLinea = quitarLinea;
window.editarCamiseta = editarCamiseta;
window.editarUsuario = editarUsuario;