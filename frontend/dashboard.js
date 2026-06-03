// ── Guard ─────────────────────────────────────────────────────────────────────
const token  = localStorage.getItem("token");
const rol    = localStorage.getItem("rol");
const userId = parseInt(localStorage.getItem("userId"), 10);

if (!token) { window.location.href = "index.html"; }

// ── Init ──────────────────────────────────────────────────────────────────────
document.getElementById("user-info").textContent =
  `${localStorage.getItem("correo")} (${rol})`;

document.getElementById("btn-logout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

// Mostrar tabs de admin
if (rol === "admin") {
  document.querySelectorAll(".admin-only").forEach(el => el.classList.remove("hidden"));
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    loadTab(btn.dataset.tab);
  });
});

// ── Global message ────────────────────────────────────────────────────────────
function showGlobal(text, type = "error") {
  const el = document.getElementById("msg-global");
  el.textContent = text;
  el.className = `msg ${type}`;
  setTimeout(() => { el.className = "msg hidden"; }, 4000);
}

function showInline(id, text, type = "error") {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `msg ${type}`;
}

// ── Badge helpers ─────────────────────────────────────────────────────────────
function badgeEstado(estado) {
  const map = {
    activo:            "badge-activo",
    inactivo:          "badge-inactivo",
    "en mantenimiento":"badge-mantenimiento",
    "no disponible":   "badge-inactivo",
    esperando:         "badge-esperando",
    aprobada:          "badge-aprobada",
    rechazada:         "badge-rechazada",
  };
  return `<span class="badge ${map[estado] || ''}">${estado}</span>`;
}

// ── TAB: ESPACIOS ─────────────────────────────────────────────────────────────
async function loadEspacios() {
  const { ok, data } = await apiEspacios.list();
  const grid = document.getElementById("lista-espacios");
  if (!ok) { grid.innerHTML = "<p>Error al cargar espacios.</p>"; return; }

  if (!data.length) { grid.innerHTML = "<p>No hay espacios registrados.</p>"; return; }

  grid.innerHTML = data.map(e => `
    <div class="card">
      <h3>${e.nombre}</h3>
      <p class="meta">📍 ${e.ubicacion}</p>
      <p class="meta">👥 Capacidad: ${e.capacidad}</p>
      <p>${badgeEstado(e.estado)}</p>
      ${e.estado === "activo"
        ? `<button class="btn-outline" onclick="abrirPanelReserva(${e.id_espacio}, '${e.nombre.replace(/'/g,"\\'")}', ${e.capacidad})">Reservar</button>`
        : `<button disabled class="btn-outline" style="opacity:.5">No disponible</button>`}
    </div>
  `).join("");
}

function abrirPanelReserva(id, nombre, capacidad) {
  document.getElementById("espacio-sel-id").value = id;
  document.getElementById("nombre-espacio-sel").textContent = nombre;
  document.getElementById("res-asistentes").max = capacidad;
  document.getElementById("panel-reserva").classList.remove("hidden");
  document.getElementById("msg-reserva").className = "msg hidden";
  document.getElementById("form-reserva").reset();
  document.getElementById("espacio-sel-id").value = id;
  document.getElementById("panel-reserva").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("btn-cancelar-panel").addEventListener("click", () => {
  document.getElementById("panel-reserva").classList.add("hidden");
});

document.getElementById("form-reserva").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    id_espacio:          parseInt(document.getElementById("espacio-sel-id").value, 10),
    fecha:               document.getElementById("res-fecha").value,
    hora_inicio:         document.getElementById("res-inicio").value + ":00",
    hora_fin:            document.getElementById("res-fin").value + ":00",
    cantidad_asistentes: parseInt(document.getElementById("res-asistentes").value, 10),
  };

  const { ok, data } = await apiReservas.create(body);
  if (!ok) {
    showInline("msg-reserva", data.detail || "Error al crear reserva", "error");
    return;
  }
  showInline("msg-reserva", "Reserva creada con estado 'esperando'.", "success");
  document.getElementById("form-reserva").reset();
  setTimeout(() => document.getElementById("panel-reserva").classList.add("hidden"), 2000);
});

// ── TAB: MIS RESERVAS ─────────────────────────────────────────────────────────
async function loadMisReservas() {
  const { ok, data } = await apiReservas.list();
  const wrap = document.getElementById("lista-mis-reservas");
  if (!ok) { wrap.innerHTML = "<p>Error al cargar reservas.</p>"; return; }

  const mias = data.filter(r => r.id_usuario === userId);
  if (!mias.length) { wrap.innerHTML = "<p>No tienes reservas registradas.</p>"; return; }

  wrap.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>ID</th><th>Espacio</th><th>Fecha</th><th>Inicio</th><th>Fin</th><th>Asistentes</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          ${mias.map(r => `
            <tr>
              <td>${r.id_reserva}</td>
              <td>#${r.id_espacio}</td>
              <td>${r.fecha}</td>
              <td>${r.hora_inicio}</td>
              <td>${r.hora_fin}</td>
              <td>${r.cantidad_asistentes}</td>
              <td>${badgeEstado(r.estado)}</td>
              <td>
                ${r.estado !== "rechazada"
                  ? `<button class="btn-sm btn-danger" onclick="cancelarReserva(${r.id_reserva})">Cancelar</button>`
                  : ""}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
}

async function cancelarReserva(id) {
  if (!confirm("¿Cancelar esta reserva?")) return;
  const { ok, data } = await apiReservas.delete(id);
  if (!ok) { showGlobal(data.detail || "Error al cancelar", "error"); return; }
  showGlobal("Reserva cancelada.", "success");
  loadMisReservas();
}

// ── TAB: GESTIONAR ESPACIOS (admin) ──────────────────────────────────────────
async function loadGestionarEspacios() {
  const { ok, data } = await apiEspacios.list();
  const grid = document.getElementById("lista-admin-espacios");
  if (!ok) { grid.innerHTML = "<p>Error.</p>"; return; }

  grid.innerHTML = data.map(e => `
    <div class="card">
      <h3>${e.nombre}</h3>
      <p class="meta">📍 ${e.ubicacion}</p>
      <p class="meta">👥 ${e.capacidad}</p>
      <p>${badgeEstado(e.estado)}</p>
      <div class="action-row">
        <button class="btn-outline" onclick="editarEspacio(${e.id_espacio},'${e.nombre.replace(/'/g,"\\'")}','${e.ubicacion.replace(/'/g,"\\'")}',${e.capacidad},'${e.estado}')">Editar</button>
        <button class="btn-sm btn-danger" onclick="eliminarEspacio(${e.id_espacio})">Eliminar</button>
      </div>
    </div>
  `).join("");
}

document.getElementById("btn-nuevo-espacio").addEventListener("click", () => {
  document.getElementById("titulo-form-espacio").textContent = "Nuevo espacio";
  document.getElementById("espacio-edit-id").value = "";
  document.getElementById("form-espacio").reset();
  document.getElementById("msg-espacio").className = "msg hidden";
  document.getElementById("form-espacio-wrap").classList.remove("hidden");
});

document.getElementById("btn-cancelar-espacio").addEventListener("click", () => {
  document.getElementById("form-espacio-wrap").classList.add("hidden");
});

function editarEspacio(id, nombre, ubicacion, capacidad, estado) {
  document.getElementById("titulo-form-espacio").textContent = "Editar espacio";
  document.getElementById("espacio-edit-id").value  = id;
  document.getElementById("esp-nombre").value        = nombre;
  document.getElementById("esp-ubicacion").value     = ubicacion;
  document.getElementById("esp-capacidad").value     = capacidad;
  document.getElementById("esp-estado").value        = estado;
  document.getElementById("msg-espacio").className  = "msg hidden";
  document.getElementById("form-espacio-wrap").classList.remove("hidden");
  document.getElementById("form-espacio-wrap").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("form-espacio").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id  = document.getElementById("espacio-edit-id").value;
  const body = {
    nombre:    document.getElementById("esp-nombre").value,
    ubicacion: document.getElementById("esp-ubicacion").value,
    capacidad: parseInt(document.getElementById("esp-capacidad").value, 10),
    estado:    document.getElementById("esp-estado").value,
  };

  const result = id
    ? await apiEspacios.update(id, body)
    : await apiEspacios.create(body);

  if (!result.ok) {
    showInline("msg-espacio", result.data.detail || "Error al guardar", "error");
    return;
  }
  showInline("msg-espacio", id ? "Espacio actualizado." : "Espacio creado.", "success");
  document.getElementById("form-espacio").reset();
  document.getElementById("espacio-edit-id").value = "";
  setTimeout(() => document.getElementById("form-espacio-wrap").classList.add("hidden"), 1500);
  loadGestionarEspacios();
});

async function eliminarEspacio(id) {
  if (!confirm("¿Eliminar este espacio?")) return;
  const { ok, data } = await apiEspacios.delete(id);
  if (!ok) { showGlobal(data.detail || "Error al eliminar", "error"); return; }
  showGlobal("Espacio eliminado.", "success");
  loadGestionarEspacios();
}

// ── TAB: TODAS LAS RESERVAS (admin) ──────────────────────────────────────────
async function loadTodasReservas() {
  const { ok, data } = await apiReservas.list();
  const wrap = document.getElementById("lista-todas-reservas");
  if (!ok) { wrap.innerHTML = "<p>Error.</p>"; return; }
  if (!data.length) { wrap.innerHTML = "<p>No hay reservas.</p>"; return; }

  wrap.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>ID</th><th>Usuario</th><th>Espacio</th><th>Fecha</th><th>Inicio</th><th>Fin</th><th>Asistentes</th><th>Estado</th><th>Acción</th></tr>
        </thead>
        <tbody>
          ${data.map(r => `
            <tr>
              <td>${r.id_reserva}</td>
              <td>#${r.id_usuario}</td>
              <td>#${r.id_espacio}</td>
              <td>${r.fecha}</td>
              <td>${r.hora_inicio}</td>
              <td>${r.hora_fin}</td>
              <td>${r.cantidad_asistentes}</td>
              <td>${badgeEstado(r.estado)}</td>
              <td>
                ${r.estado === "esperando" ? `
                  <div class="action-row">
                    <button class="btn-outline" onclick="cambiarEstado(${r.id_reserva},'aprobada')">Aprobar</button>
                    <button class="btn-sm btn-danger" onclick="cambiarEstado(${r.id_reserva},'rechazada')">Rechazar</button>
                  </div>` : "—"}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
}

async function cambiarEstado(id, estado) {
  const { ok, data } = await apiReservas.updateEstado(id, estado);
  if (!ok) { showGlobal(data.detail || "Error", "error"); return; }
  showGlobal(`Reserva ${estado}.`, "success");
  loadTodasReservas();
}

// ── TAB: USUARIOS (admin) ─────────────────────────────────────────────────────
async function loadUsuarios() {
  const { ok, data } = await apiUsuarios.list();
  const wrap = document.getElementById("lista-usuarios");
  if (!ok) { wrap.innerHTML = "<p>Error.</p>"; return; }

  wrap.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th></th></tr></thead>
        <tbody>
          ${data.map(u => `
            <tr>
              <td>${u.id_usuario}</td>
              <td>${u.nombre}</td>
              <td>${u.correo}</td>
              <td>${badgeEstado(u.rol === "admin" ? "aprobada" : "esperando").replace(u.rol === "admin" ? "aprobada" : "esperando", u.rol)}</td>
              <td>
                ${u.id_usuario !== userId
                  ? `<button class="btn-sm btn-danger" onclick="eliminarUsuario(${u.id_usuario})">Eliminar</button>`
                  : ""}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
}

async function eliminarUsuario(id) {
  if (!confirm("¿Eliminar este usuario?")) return;
  const { ok, data } = await apiUsuarios.delete(id);
  if (!ok) { showGlobal(data.detail || "Error", "error"); return; }
  showGlobal("Usuario eliminado.", "success");
  loadUsuarios();
}

// ── Router de tabs ────────────────────────────────────────────────────────────
function loadTab(name) {
  if (name === "espacios")           loadEspacios();
  if (name === "reservas")           loadMisReservas();
  if (name === "gestionar-espacios") loadGestionarEspacios();
  if (name === "todas-reservas")     loadTodasReservas();
  if (name === "usuarios")           loadUsuarios();
}

// Carga inicial
loadEspacios();
