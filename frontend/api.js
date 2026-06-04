// ── API helper ────────────────────────────────────────────────────────────────
function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

async function apiFetch(path, options = {}) {
  const res  = await fetch(`${API_URL}${path}`, {
    headers: getHeaders(),
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "index.html";
    return;
  }
  return { ok: res.ok, status: res.status, data };
}

// Espacios
const apiEspacios = {
  list:   ()          => apiFetch("/espacios/"),
  get:    (id)        => apiFetch(`/espacios/${id}`),
  create: (body)      => apiFetch("/espacios/",    { method: "POST", body: JSON.stringify(body) }),
  update: (id, body)  => apiFetch(`/espacios/${id}`, { method: "PUT",  body: JSON.stringify(body) }),
  delete: (id)        => apiFetch(`/espacios/${id}`, { method: "DELETE" }),
};

// Reservas
const apiReservas = {
  list:          ()          => apiFetch("/reservas/"),
  create:        (body)      => apiFetch("/reservas/", { method: "POST", body: JSON.stringify(body) }),
  update:        (id, body)  => apiFetch(`/reservas/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  updateEstado:  (id, estado)=> apiFetch(`/reservas/${id}/estado`, { method: "PUT", body: JSON.stringify({ estado }) }),
  delete:        (id)        => apiFetch(`/reservas/${id}`, { method: "DELETE" }),
};

// Usuarios (admin)
const apiUsuarios = {
  list:   ()         => apiFetch("/usuarios/"),
  create: (body)     => apiFetch("/usuarios/",     { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => apiFetch(`/usuarios/${id}`, { method: "PUT",  body: JSON.stringify(body) }),
  delete: (id)       => apiFetch(`/usuarios/${id}`, { method: "DELETE" }),
};
