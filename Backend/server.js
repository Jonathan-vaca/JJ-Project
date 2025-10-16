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

// ===== Servir archivos estáticos =====
app.use(express.static(path.join(__dirname, "../")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Rutas API =====
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
// Servir la carpeta Paginas completa
app.use(express.static(path.join(__dirname, "/Paginas")));

// Si además tienes assets globales:
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Servir archivos estáticos =====

// Sirve la carpeta 'Paginas'
app.use("/Paginas", express.static(path.join(__dirname, "../Paginas")));

// Sirve la carpeta 'Header'
app.use("/Header", express.static(path.join(__dirname, "../Header")));

// Sirve la carpeta 'Footer'
app.use("/Footer", express.static(path.join(__dirname, "../Footer")));

// (si tienes uploads también)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// ===== Ruta raíz =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Paginas/Home.html"));
});

// ===== Puerto =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`🌐 Página principal: http://localhost:${PORT}/Paginas/Home.html`);
  console.log(`🖼️ Galería activa en: http://localhost:${PORT}/api/gallery`);
});

// ===== Manejo global de errores =====
process.on("unhandledRejection", (reason) => {
  console.error("❌ Rechazo no manejado:", reason);
});