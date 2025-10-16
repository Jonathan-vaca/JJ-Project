// Backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Directorio raíz =====
const rootDir = path.join(__dirname, "../");

// ===== Servir archivos estáticos =====
app.use(express.static(rootDir)); // ✅ Esto sirve todo lo que está fuera del backend

// ===== Rutas API (si las tienes) =====
try {
  const postsRoutes = require("./routes/posts");
  const commentsRoutes = require("./routes/comments");
  const authRoutes = require("./routes/auth");
  const contactRoutes = require("./routes/contact");
  const galleryRoutes = require("./routes/gallery");

  app.use("/api/posts", postsRoutes);
  app.use("/api/posts", commentsRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/gallery", galleryRoutes);
} catch (err) {
  console.log("⚠️ No se cargaron rutas API (probablemente no existen aún).");
}

// ===== Página principal =====
app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "Paginas", "Home.html"));
});

// ===== Puerto =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

// ===== Manejo de errores global =====
process.on("unhandledRejection", (reason) => {
  console.error("❌ Rechazo no manejado:", reason);
});
