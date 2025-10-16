// ========================
// CONFIGURACIÓN
// ========================
const AUTH_BASE = "/api/auth";
const tokenKey = "api_token";
const roleKey = "userRole";
const userKey = "usuario"; 

function setToken(t) {
  if (t) localStorage.setItem(tokenKey, t);
  else localStorage.removeItem(tokenKey);
}

function setRole(r) {
  if (r) localStorage.setItem(roleKey, r);
  else localStorage.removeItem(roleKey);
}

function setUser(u) {
  if (u) localStorage.setItem(userKey, JSON.stringify(u));
  else localStorage.removeItem(userKey);
}

// ========================
// CAMBIO LOGIN / REGISTRO
// ========================
const authWrapper = document.getElementById("authWrapper");
const switchBtn = document.getElementById("switchBtn");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");

let isLogin = true;

switchBtn.addEventListener("click", () => {
  authWrapper.classList.toggle("active");
  isLogin = !isLogin;
  if (isLogin) {
    overlayTitle.textContent = "¿Eres nuevo?";
    overlayText.textContent = "Regístrate para acceder a tu cuenta";
    switchBtn.textContent = "Registrarse";
  } else {
    overlayTitle.textContent = "¿Ya tienes cuenta?";
    overlayText.textContent = "Inicia sesión con tus credenciales";
    switchBtn.textContent = "Iniciar Sesión";
  }
});

// ========================
// LOGIN
// ========================
document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;

  if (!email || !pass) return alert("Completa todos los campos");

  try {
    const res = await fetch(AUTH_BASE + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Error al iniciar sesión");

    // ✅ Guardar token, rol y usuario completo
    setToken(data.token);
    setRole(data.usuario.rol);
    setUser(data.usuario);

    // Redirigir según el rol
    setTimeout(() => {
      if (data.usuario.rol === "admin") {
        window.location.replace("/Paginas/Admin2.html");
      } else {
        window.location.replace("/Paginas/Gallery.html");
      }
    }, 200);
  } catch (err) {
    console.error(err);
    alert("Error en el servidor");
  }
});

// ========================
// REGISTRO
// ========================
document.getElementById("btnRegister").addEventListener("click", async () => {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPass").value;

  if (!name || !email || !pass) return alert("Completa todos los campos");

  try {
    const res = await fetch(AUTH_BASE + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: name, email, password: pass }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Error al registrarse");

    alert("Registro exitoso, ahora inicia sesión");
    switchBtn.click(); // Cambia automáticamente a login
  } catch (err) {
    console.error(err);
    alert("Error en el servidor");
  }
});
