// ===== Backend/server.js =====
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
// Servir las carpetas del frontend (fuera de /Backend)
app.use("/Paginas", express.static(path.join(__dirname, "../Paginas")));
app.use("/Header", express.static(path.join(__dirname, "../Header")));
app.use("/Footer", express.static(path.join(__dirname, "../Footer")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Rutas API =====
const postsRoutes = require("./routes/posts");
const commentsRoutes = require("./routes/comments");
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");
const galleryRoutes = require("./routes/gallery");
app.use("/components", express.static(path.join(__dirname, "../components")));


app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/gallery", galleryRoutes);

// ===== Ruta raíz =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Paginas/Home.html"));
});

// ===== Puerto =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`🌐 Página principal: http://localhost:${PORT}/`);
});

// ===== Manejo global de errores =====
process.on("unhandledRejection", (reason) => {
  console.error("❌ Rechazo no manejado:", reason);
});
