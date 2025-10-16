// ===== Dependencias =====
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Servir archivos estáticos =====
// Sirve TODO lo que está fuera de /Backend (Header, Footer, JS, Paginas, etc.)
app.use(express.static(path.join(__dirname, "..")));

// Sirve la carpeta de uploads (para imágenes u otros archivos)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Rutas de la API =====
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

// ===== Página principal =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Paginas/Home.html"));
});

// ===== Manejo de rutas no encontradas =====
app.use((req, res) => {
  res.status(404).send("404 - Página no encontrada 😢");
});

// ===== Iniciar servidor =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

// ===== Manejo global de errores =====
process.on("unhandledRejection", (reason) => {
  console.error("❌ Rechazo no manejado:", reason);
});
