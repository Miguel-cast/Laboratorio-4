// ── Helpers ──────────────────────────────────────────────────────────────────
function showMsg(id, text, type = "error") {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `msg ${type}`;
}

function hideMsg(id) {
  document.getElementById(id).className = "msg hidden";
}

// ── Redirect si ya está logueado ─────────────────────────────────────────────
if (localStorage.getItem("token")) {
  window.location.href = "dashboard.html";
}

// ── Login ─────────────────────────────────────────────────────────────────────
const formLogin = document.getElementById("form-login");
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMsg("msg-login");

    const correo    = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    try {
      const body = new URLSearchParams({ username: correo, password: contrasena });
      const res  = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = await res.json();

      if (!res.ok) {
        showMsg("msg-login", data.detail || "Error al iniciar sesión", "error");
        return;
      }

      localStorage.setItem("token", data.access_token);
      // Decodifica el payload para guardar rol e id
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      localStorage.setItem("rol",    payload.rol);
      localStorage.setItem("userId", payload.id);
      localStorage.setItem("correo", payload.sub);

      window.location.href = "dashboard.html";
    } catch {
      showMsg("msg-login", "No se pudo conectar con el servidor", "error");
    }
  });
}

// ── Register ──────────────────────────────────────────────────────────────────
const formRegister = document.getElementById("form-register");
if (formRegister) {
  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMsg("msg-register");

    const nombre    = document.getElementById("nombre").value.trim();
    const correo    = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    try {
      const res  = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, contrasena }),
      });
      const data = await res.json();

      if (!res.ok) {
        showMsg("msg-register", data.detail || "Error al registrarse", "error");
        return;
      }

      showMsg("msg-register", "Cuenta creada. Redirigiendo al login…", "success");
      setTimeout(() => { window.location.href = "index.html"; }, 1500);
    } catch {
      showMsg("msg-register", "No se pudo conectar con el servidor", "error");
    }
  });
}
