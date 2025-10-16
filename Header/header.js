// header.js - sin menú hamburguesa
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

    // expose for manual init if needed
    window.initHeader = initHeader;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeader);
  } else {
    initHeader();
  }
})();
