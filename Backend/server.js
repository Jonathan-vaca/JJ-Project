const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Directorio raíz del proyecto (un nivel arriba de /Backend) =====
const rootDir = path.join(__dirname, "../");

// ===== Servir archivos estáticos =====
app.use(express.static(rootDir));
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

// ===== Ruta raíz =====
app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "Paginas/Home.html"));
});

// ===== Puerto =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

// ===== Manejo global de errores =====
process.on("unhandledRejection", (reason) => {
  console.error("❌ Rechazo no manejado:", reason);
});
