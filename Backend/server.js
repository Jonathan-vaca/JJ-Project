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
const rootDir = path.join(__dirname);

// ===== Servir archivos estáticos =====
app.use(express.static(rootDir));
app.use("/Header", express.static(path.join(rootDir, "Header")));
app.use("/Footer", express.static(path.join(rootDir, "Footer")));
app.use("/Paginas", express.static(path.join(rootDir, "Paginas")));
app.use("/JS", express.static(path.join(rootDir, "JS")));
app.use("/CSS", express.static(path.join(rootDir, "CSS")));
app.use("/components", express.static(path.join(rootDir, "components")));
app.use("/uploads", express.static(path.join(rootDir, "uploads")));

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

// ===== Página principal =====
app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "Paginas/Home.html"));
});

// ===== Puerto =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
