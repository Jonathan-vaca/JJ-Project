document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("footer-form");
  const statusText = document.getElementById("footer-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita recargar o redirigir

    const formData = new FormData(form);

    statusText.style.color = "#ffae00";
    statusText.textContent = "✉️ Sending message...";

    try {
      const response = await fetch("https://formspree.io/f/xanledjn", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        statusText.style.color = "#4caf50";
        statusText.textContent =
          "✅ We’ve received your message, please wait for a response in your email.";
        form.reset();
      } else {
        statusText.style.color = "#ff4d4d";
        statusText.textContent = "❌ There was an error. Please try again.";
      }
    } catch (error) {
      statusText.style.color = "#ff4d4d";
      statusText.textContent = "⚠️ Connection error. Please try later.";
      console.error(error);
    }
  });
});
