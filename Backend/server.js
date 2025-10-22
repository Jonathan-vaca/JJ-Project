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

// ===== Servir archivos estáticos (frontend) =====
app.use("/Paginas", express.static(path.join(__dirname, "../Paginas")));
app.use("/Header", express.static(path.join(__dirname, "../Header")));
app.use("/Footer", express.static(path.join(__dirname, "../Footer")));
app.use("/components", express.static(path.join(__dirname, "../components")));

// ✅ Asegura servir todas las imágenes subidas del gallery
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Rutas API =====
const postsRoutes = require("./routes/posts");
const commentsRoutes = require("./routes/comments");
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");
const galleryRoutes = require("./routes/gallery");

// ✅ Montar APIs
app.use("/api/posts", postsRoutes);
app.use("/api/posts", commentsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/gallery", galleryRoutes);

// ===== Ruta raíz =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Paginas/Home.html"));
});
// ===== Verificación Google Search Console =====
app.get("/google91c027a97011579b.html", (req, res) => {
  res.send("google-site-verification: google91c027a97011579b.html");
});


// ===== Verificar conexión a DB =====
const pool = require("./db");
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS time;");
    res.json({ ok: true, time: rows[0].time });
  } catch (err) {
    console.error("❌ Error conectando a la DB:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
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
