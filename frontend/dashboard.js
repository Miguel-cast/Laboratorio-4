/* ═══════════════════════════════════════════════════════════════
   dashboard.js — panel interactivo (dark premium)
══════════════════════════════════════════════════════════════════ */

// ── Guard ──────────────────────────────────────────────────────
const token  = localStorage.getItem("token");
const rol    = localStorage.getItem("rol");
const correo = localStorage.getItem("correo") || "";
const userId = parseInt(localStorage.getItem("userId"), 10);
const isAdmin = rol === "admin";
if (!token) location.href = "index.html";

// ── Iconos SVG ─────────────────────────────────────────────────
const I = {
  pin:   '<svg viewBox="0 0 20 20" fill="none"><path d="M10 18s6-5.2 6-9.5A6 6 0 0 0 4 8.5C4 12.8 10 18 10 18Z" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="8.5" r="2" stroke="currentColor" stroke-width="1.5"/></svg>',
  users: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  clock: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M10 6v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  grid:  '<svg viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/></svg>',
  cal:   '<svg viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 8h14M7 2v4M13 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  x:     '<svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  edit:  '<svg viewBox="0 0 20 20" fill="none"><path d="M13.5 4.5l2 2L7 15l-3 1 1-3 8.5-8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  trash: '<svg viewBox="0 0 20 20" fill="none"><path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clock2:'<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M10 6v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 13l2-7h12l2 7M4 13v5h16v-5M4 13h5l1 2h4l1-2h5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  info:  '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M10 9v4M10 6.5v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
};

const MESES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];

// ── Estado / caché ─────────────────────────────────────────────
const state = { espacios: [], espById: new Map(), usuarios: [], usrById: new Map(), reservas: [] };

// ── Helpers ────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const statusClass = (e) => ({ "en mantenimiento":"mantenimiento", "no disponible":"no-disponible" }[e] || e);
const badge = (e) => `<span class="badge ${statusClass(e)}">${esc(e)}</span>`;
const fmtTime = (t) => (t || "").slice(0, 5);
const dateParts = (f) => { const d = new Date(f + "T00:00:00"); return { d: d.getDate(), m: MESES[d.getMonth()] }; };
const initials = (s) => { const p = s.split("@")[0].replace(/[._-]/g, " ").trim().split(" "); return ((p[0]?.[0] || "U") + (p[1]?.[0] || "")).toUpperCase(); };

// ── Toasts ─────────────────────────────────────────────────────
function toast(msg, type = "success") {
  const ico = type === "error" ? I.x : type === "info" ? I.info : I.check;
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-ico">${ico}</span><span class="toast-msg">${esc(msg)}</span><span class="toast-bar" style="color:var(--${type==='error'?'bad':type==='info'?'info':'ok'})"></span>`;
  $("toast-root").appendChild(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 400); }, 3200);
}

// ── Modal ──────────────────────────────────────────────────────
function openModal(html) {
  const root = $("modal-root");
  root.innerHTML = `<div class="modal-backdrop" data-close></div><div class="modal">
    <button class="modal-close" data-close>${I.x}</button>${html}</div>`;
  root.classList.add("open");
}
function closeModal() { const r = $("modal-root"); r.classList.remove("open"); r.innerHTML = ""; }
document.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

function confirmModal(title, msg, label = "Eliminar", danger = true) {
  return new Promise((resolve) => {
    openModal(`<h3>${esc(title)}</h3><p class="msub">${esc(msg)}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-confirm="0">Cancelar</button>
        <button class="btn ${danger ? "btn-bad" : "btn-primary"}" data-confirm="1">${esc(label)}</button>
      </div>`);
    $("modal-root").addEventListener("click", (e) => {
      const b = e.target.closest("[data-confirm]");
      if (!b) return;
      const v = b.dataset.confirm === "1";
      closeModal(); resolve(v);
    }, { once: true });
  });
}

// ── Count-up ───────────────────────────────────────────────────
function countUp(el, target, dur = 900) {
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── Skeletons ──────────────────────────────────────────────────
const skeletonList = (n = 4) => `<div class="res-list">${Array(n).fill('<div class="skel" style="height:84px"></div>').join("")}</div>`;
const emptyState = (msg, sub = "") => `<div class="empty">${I.inbox}<p>${esc(msg)}</p>${sub ? `<p class="sub">${esc(sub)}</p>` : ""}</div>`;

// ── Datos ──────────────────────────────────────────────────────
async function ensureEspacios(force = false) {
  if (state.espacios.length && !force) return state.espacios;
  const { ok, data } = await apiEspacios.list();
  if (ok) { state.espacios = data; state.espById = new Map(data.map(e => [e.id_espacio, e])); }
  return state.espacios;
}
async function ensureUsuarios(force = false) {
  if (!isAdmin) return [];
  if (state.usuarios.length && !force) return state.usuarios;
  const { ok, data } = await apiUsuarios.list();
  if (ok) { state.usuarios = data; state.usrById = new Map(data.map(u => [u.id_usuario, u])); }
  return state.usuarios;
}
async function loadReservas() {
  const { ok, data } = await apiReservas.list();
  state.reservas = ok ? data : [];
  return state.reservas;
}
const espName = (id) => state.espById.get(id)?.nombre || `Espacio #${id}`;
const usrName = (id) => state.usrById.get(id)?.nombre || `Usuario #${id}`;

// ═══════════ VISTA: INICIO ═══════════
async function renderInicio() {
  $("stats").innerHTML = Array(4).fill('<div class="skel" style="height:130px"></div>').join("");
  await Promise.all([ensureEspacios(), loadReservas(), ensureUsuarios()]);

  const r = state.reservas;
  const esperando = r.filter(x => x.estado === "esperando").length;
  const aprobadas = r.filter(x => x.estado === "aprobada").length;
  const activos = state.espacios.filter(e => e.estado === "activo").length;

  const cards = isAdmin
    ? [
        { ico: I.grid,  cls: "accent", val: state.espacios.length, label: "Espacios totales" },
        { ico: I.clock, cls: "info",   val: esperando, label: "Reservas en espera" },
        { ico: I.check, cls: "ok",     val: aprobadas, label: "Reservas aprobadas" },
        { ico: I.users, cls: "warn",   val: state.usuarios.length, label: "Usuarios" },
      ]
    : [
        { ico: I.cal,   cls: "accent", val: r.length,  label: "Mis reservas" },
        { ico: I.clock, cls: "info",   val: esperando, label: "En espera" },
        { ico: I.check, cls: "ok",     val: aprobadas, label: "Aprobadas" },
        { ico: I.grid,  cls: "warn",   val: activos,   label: "Espacios disponibles" },
      ];

  $("stats").innerHTML = cards.map((c, i) => `
    <div class="stat ${c.cls}" style="animation-delay:${i * 70}ms">
      <div class="stat-ico">${c.ico}</div>
      <div class="stat-val" data-count="${c.val}">0</div>
      <div class="stat-label">${c.label}</div>
    </div>`).join("");
  document.querySelectorAll("[data-count]").forEach(el => countUp(el, +el.dataset.count));

  // Recientes
  const recientes = [...r].sort((a, b) => b.id_reserva - a.id_reserva).slice(0, 5);
  $("recent").innerHTML = recientes.length ? renderResRows(recientes, false) : emptyState("Sin reservas aún", "Cuando crees reservas aparecerán aquí.");
}

// ═══════════ VISTA: ESPACIOS ═══════════
async function renderEspacios() {
  const wrap = $("lista-espacios");           // este contenedor YA es .grid
  wrap.innerHTML = Array(6).fill('<div class="skel"></div>').join("");

  await ensureEspacios(true);
  const list = state.espacios;
  if (!list.length) { wrap.innerHTML = emptyState("No hay espacios registrados", isAdmin ? "Crea el primero con el botón “Nuevo espacio”." : "Vuelve más tarde."); return; }

  wrap.innerHTML = list.map((e, i) => {
    const disabled = e.estado !== "activo";
    const action = isAdmin
      ? `<button class="btn btn-ghost btn-sm" data-action="edit-espacio" data-id="${e.id_espacio}">${I.edit} Editar</button>
         <button class="btn btn-bad btn-sm" data-action="del-espacio" data-id="${e.id_espacio}">${I.trash}</button>`
      : `<button class="btn ${disabled ? "btn-ghost" : "btn-primary"} btn-block" data-action="reservar" data-id="${e.id_espacio}" ${disabled ? "disabled style=opacity:.5;cursor:not-allowed" : ""}>${disabled ? "No disponible" : "Reservar"}</button>`;
    return `
      <div class="card" style="animation-delay:${i * 60}ms">
        <div class="card-top">
          <div class="card-title">${esc(e.nombre)}</div>
          ${badge(e.estado)}
        </div>
        <div class="card-meta">
          <div class="meta-row">${I.pin}<span>${esc(e.ubicacion)}</span></div>
          <div class="meta-row">${I.users}<span>Capacidad: ${e.capacidad} personas</span></div>
        </div>
        <div class="card-actions">${action}</div>
      </div>`;
  }).join("");
}

// ═══════════ VISTA: RESERVAS ═══════════
function renderResRows(list, withActions = true) {
  return `<div class="res-list">${list.map((r, i) => {
    const dp = dateParts(r.fecha);
    const who = isAdmin ? `<span>${I.users}${esc(usrName(r.id_usuario))}</span>` : "";
    let actions = "";
    if (withActions) {
      if (isAdmin && r.estado === "esperando") {
        actions = `<div class="res-actions">
          <button class="btn btn-ok btn-sm" data-action="aprobar" data-id="${r.id_reserva}">${I.check} Aprobar</button>
          <button class="btn btn-bad btn-sm" data-action="rechazar" data-id="${r.id_reserva}">${I.x} Rechazar</button></div>`;
      } else if (!isAdmin && r.estado !== "rechazada") {
        actions = `<div class="res-actions"><button class="btn btn-bad btn-sm" data-action="cancel-reserva" data-id="${r.id_reserva}">${I.trash} Cancelar</button></div>`;
      } else if (isAdmin) {
        actions = `<div class="res-actions"><button class="btn btn-ghost btn-sm" data-action="del-reserva" data-id="${r.id_reserva}">${I.trash}</button></div>`;
      }
    }
    return `
      <div class="res-row" style="animation-delay:${i * 55}ms">
        <div class="res-date"><span class="d">${dp.d}</span><span class="m">${dp.m}</span></div>
        <div class="res-info">
          <div class="rt">${esc(espName(r.id_espacio))}</div>
          <div class="rs">
            <span>${I.clock2}${fmtTime(r.hora_inicio)} – ${fmtTime(r.hora_fin)}</span>
            <span>${I.users}${r.cantidad_asistentes} asistentes</span>
            ${who}
          </div>
        </div>
        <div class="res-side">${badge(r.estado)}${actions}</div>
      </div>`;
  }).join("")}</div>`;
}

async function renderReservas() {
  const wrap = $("lista-reservas");
  wrap.innerHTML = skeletonList(4);
  await Promise.all([ensureEspacios(), ensureUsuarios(), loadReservas()]);
  const list = [...state.reservas].sort((a, b) => b.id_reserva - a.id_reserva);
  wrap.innerHTML = list.length ? renderResRows(list, true)
    : emptyState(isAdmin ? "No hay reservas en el sistema" : "No tienes reservas", isAdmin ? "" : "Reserva un espacio desde la pestaña Espacios.");
}

// ═══════════ VISTA: USUARIOS ═══════════
async function renderUsuarios() {
  const wrap = $("lista-usuarios");
  wrap.innerHTML = skeletonList(4);
  await ensureUsuarios(true);
  const list = state.usuarios;
  if (!list.length) { wrap.innerHTML = emptyState("Sin usuarios"); return; }

  wrap.innerHTML = `<div class="utable">${list.map((u, i) => `
    <div class="urow" style="animation-delay:${i * 50}ms">
      <div class="avatar">${initials(u.correo)}</div>
      <div class="uinfo"><div class="un">${esc(u.nombre)}</div><div class="ue">${esc(u.correo)}</div></div>
      <span class="badge rol-${u.rol} urole-badge">${esc(u.rol)}</span>
      ${u.id_usuario !== userId
        ? `<button class="btn btn-bad btn-sm" data-action="del-usuario" data-id="${u.id_usuario}">${I.trash}</button>`
        : `<span class="badge rol-usuario">Tú</span>`}
    </div>`).join("")}</div>`;
}

// ═══════════ MODALES: espacio / reserva ═══════════
function openEspacioModal(esp) {
  const e = esp || {};
  openModal(`
    <h3>${esp ? "Editar espacio" : "Nuevo espacio"}</h3>
    <p class="msub">${esp ? "Actualiza los datos del espacio." : "Registra un espacio institucional."}</p>
    <form id="f-espacio">
      <div class="f"><label>Nombre</label><input id="e-nombre" value="${esc(e.nombre || "")}" required placeholder="Sala de juntas A" /></div>
      <div class="f"><label>Ubicación</label><input id="e-ubicacion" value="${esc(e.ubicacion || "")}" required placeholder="Bloque 2 · Piso 3" /></div>
      <div class="f-row">
        <div class="f"><label>Capacidad</label><input id="e-capacidad" type="number" min="1" value="${e.capacidad || ""}" required placeholder="20" /></div>
        <div class="f"><label>Estado</label><select id="e-estado">
          ${["activo","inactivo","en mantenimiento","no disponible"].map(s => `<option value="${s}" ${e.estado === s ? "selected" : ""}>${s}</option>`).join("")}
        </select></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" data-close>Cancelar</button>
        <button type="submit" class="btn btn-primary">${esp ? "Guardar cambios" : "Crear espacio"}</button>
      </div>
    </form>`);

  $("f-espacio").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const body = {
      nombre: $("e-nombre").value.trim(),
      ubicacion: $("e-ubicacion").value.trim(),
      capacidad: parseInt($("e-capacidad").value, 10),
      estado: $("e-estado").value,
    };
    const res = esp ? await apiEspacios.update(esp.id_espacio, body) : await apiEspacios.create(body);
    if (!res.ok) { toast(res.data.detail || "Error al guardar", "error"); return; }
    toast(esp ? "Espacio actualizado" : "Espacio creado");
    closeModal();
    await renderEspacios();
  });
}

function openReservaModal(esp) {
  const today = new Date().toISOString().split("T")[0];
  openModal(`
    <h3>Nueva reserva</h3>
    <p class="msub">${esc(esp.nombre)} · cap. ${esp.capacidad}</p>
    <form id="f-reserva">
      <div class="f"><label>Fecha</label><input id="r-fecha" type="date" min="${today}" required /></div>
      <div class="f-row">
        <div class="f"><label>Hora inicio</label><input id="r-inicio" type="time" required /></div>
        <div class="f"><label>Hora fin</label><input id="r-fin" type="time" required /></div>
      </div>
      <div class="f"><label>Asistentes (máx. ${esp.capacidad})</label><input id="r-asist" type="number" min="1" max="${esp.capacidad}" required placeholder="5" /></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" data-close>Cancelar</button>
        <button type="submit" class="btn btn-primary">Confirmar reserva</button>
      </div>
    </form>`);

  $("f-reserva").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const body = {
      id_espacio: esp.id_espacio,
      fecha: $("r-fecha").value,
      hora_inicio: $("r-inicio").value + ":00",
      hora_fin: $("r-fin").value + ":00",
      cantidad_asistentes: parseInt($("r-asist").value, 10),
    };
    const { ok, data } = await apiReservas.create(body);
    if (!ok) { toast(data.detail || "No se pudo crear la reserva", "error"); return; }
    toast("Reserva creada · estado: esperando", "success");
    closeModal();
  });
}

// ═══════════ Delegación de acciones ═══════════
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const id = parseInt(btn.dataset.id, 10);
  const action = btn.dataset.action;

  if (action === "reservar")      return openReservaModal(state.espById.get(id));
  if (action === "edit-espacio")  return openEspacioModal(state.espById.get(id));

  if (action === "del-espacio") {
    if (await confirmModal("Eliminar espacio", "Esta acción no se puede deshacer.")) {
      const { ok, data } = await apiEspacios.delete(id);
      ok ? (toast("Espacio eliminado"), renderEspacios()) : toast(data.detail || "Error", "error");
    }
  }
  if (action === "aprobar" || action === "rechazar") {
    const estado = action === "aprobar" ? "aprobada" : "rechazada";
    const { ok, data } = await apiReservas.updateEstado(id, estado);
    ok ? (toast(`Reserva ${estado}`, action === "aprobar" ? "success" : "info"), refreshReservasViews()) : toast(data.detail || "Error", "error");
  }
  if (action === "cancel-reserva" || action === "del-reserva") {
    if (await confirmModal("Cancelar reserva", "¿Seguro que deseas cancelar esta reserva?", "Sí, cancelar")) {
      const { ok, data } = await apiReservas.delete(id);
      ok ? (toast("Reserva cancelada"), refreshReservasViews()) : toast(data.detail || "Error", "error");
    }
  }
  if (action === "del-usuario") {
    if (await confirmModal("Eliminar usuario", "Se eliminará la cuenta del sistema.")) {
      const { ok, data } = await apiUsuarios.delete(id);
      ok ? (toast("Usuario eliminado"), renderUsuarios()) : toast(data.detail || "Error", "error");
    }
  }
});

function refreshReservasViews() {
  if ($("view-reservas").classList.contains("active")) renderReservas();
  if ($("view-inicio").classList.contains("active")) renderInicio();
}

// ═══════════ Navegación ═══════════
const views = { inicio: renderInicio, espacios: renderEspacios, reservas: renderReservas, usuarios: renderUsuarios };

function moveNavPill() {
  const active = document.querySelector(".nav-item.active");
  const pill = $("nav-pill");
  if (!active) { pill.style.width = "0"; return; }
  pill.style.width = active.offsetWidth + "px";
  pill.style.transform = `translateX(${active.offsetLeft}px)`;
}

function switchView(name) {
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  moveNavPill();
  views[name]?.();
}

document.querySelectorAll(".nav-item").forEach(b =>
  b.addEventListener("click", () => switchView(b.dataset.view)));
window.addEventListener("resize", moveNavPill);

// ═══════════ Init ═══════════
$("uname").textContent = correo;
$("urole").textContent = rol;
$("avatar").textContent = initials(correo);
$("greeting").textContent = `Hola, ${correo.split("@")[0]}`;
$("btn-logout").addEventListener("click", () => { localStorage.clear(); location.href = "index.html"; });

if (isAdmin) {
  document.querySelectorAll(".admin-only").forEach(el => el.classList.remove("hidden"));
  $("reservas-tab-label").textContent = "Reservas";
  $("reservas-title").innerHTML = "Todas las <em>reservas</em>";
  $("reservas-sub").textContent = "Aprueba o rechaza solicitudes";
  $("espacios-sub").textContent = "Gestiona los espacios del sistema";
}

window.addEventListener("load", moveNavPill);
renderInicio();
moveNavPill();
