(function () {
function initHeader() {
// ==============================
// 🔹 Login / Logout dinámico con nombre
// ==============================
const loginLink = document.getElementById("login-link");
if (loginLink) {
const token = localStorage.getItem("api_token");
const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  if (token && usuario) {
    loginLink.textContent = `Logout (${usuario.nombre})`;
    loginLink.href = "#";

    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("api_token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("usuario");
      window.location.href = "/Paginas/login.html";
    });
  } else {
    loginLink.textContent = "Login";
    loginLink.href = "/Paginas/login.html";
  }
}

// ==============================
// 🔹 Redirección dinámica de Galería según ancho de pantalla (usando matchMedia)
// ==============================
const linkGaleria = document.querySelector('a[href="/Paginas/Gallery.html"]');
if (linkGaleria) {
  linkGaleria.addEventListener("click", (e) => {
    e.preventDefault();

    // Detecta tamaño con matchMedia (igual que en CSS)
    const isMobile = window.matchMedia("(max-width: 540px)").matches;

    if (isMobile) {
      window.location.href = "/Paginas/Gallery M.html";
    } else {
      window.location.href = "/Paginas/Gallery.html";
    }
  });
}

// expose for manual init if needed
window.initHeader = initHeader;


}

if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", initHeader);
} else {
initHeader();
}
})();