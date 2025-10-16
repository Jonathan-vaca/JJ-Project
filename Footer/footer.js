document.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelector(".footer");
  const inputs = footer.querySelectorAll(".input-group");
  const button = footer.querySelector(".btn-send");
  const socialLinks = footer.querySelectorAll(".social-icons a");
  const form = document.querySelector(".contact-form");

  // === Animaciones con IntersectionObserver ===
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        footer.classList.add("show");

        // Inputs
        inputs.forEach((input, i) => {
          setTimeout(() => input.classList.add("show-element"), 200 + i * 150);
        });

        // Botón
        setTimeout(() => button.classList.add("show-element"), 600);

        // Redes sociales
        socialLinks.forEach((link, i) => {
          setTimeout(() => link.classList.add("show-element"), 800 + i * 150);
        });

        observer.unobserve(footer);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(footer);

  // === Envío del formulario ===
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        name: e.target[0].value,
        email: e.target[1].value,
        subject: e.target[2].value,
        message: e.target[3].value,
      };

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (data.success) {
          alert("✅ Tu mensaje fue enviado correctamente");
          e.target.reset();
        } else {
          alert("❌ Error al enviar el mensaje: " + data.error);
        }
      } catch (err) {
        alert("⚠️ Error de conexión con el servidor");
        console.error(err);
      }
    });
  }
});
