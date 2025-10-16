const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// 📁 Carpetas necesarias
const uploadDir = path.join(__dirname, "../uploads/gallery");
const dataDir = path.join(__dirname, "../data");
const dataFile = path.join(dataDir, "gallery.json");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// 🔄 Cargar datos desde JSON
let gallery = [];
if (fs.existsSync(dataFile)) {
  try {
    const raw = fs.readFileSync(dataFile, "utf8");
    gallery = JSON.parse(raw || "[]");
  } catch (err) {
    console.error("❌ Error leyendo gallery.json:", err);
  }
}

// 💾 Guardar cambios en JSON
function saveGallery() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(gallery, null, 2));
  } catch (err) {
    console.error("❌ Error guardando gallery.json:", err);
  }
}

// ⚙️ Configuración Multer
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 📸 GET - obtener todas las imágenes (ordenadas si tienen "order")
router.get("/", (req, res) => {
  const sorted = [...gallery].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  res.json(sorted);
});

// 🆕 POST - subir una nueva imagen
router.post("/", upload.single("image"), (req, res) => {
  const { title } = req.body;
  if (!req.file) return res.status(400).json({ message: "No se subió ninguna imagen" });

  const newImage = {
    id: Date.now(),
    title: title || "Sin título",
    imageUrl: `/uploads/gallery/${req.file.filename}`,
    order: gallery.length ? Math.max(...gallery.map(i => i.order || 0)) + 1 : 1,
  };

  gallery.push(newImage);
  saveGallery();
  res.status(201).json(newImage);
});

// 🗑️ DELETE - eliminar una imagen
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = gallery.findIndex((img) => img.id === id);
  if (index === -1) return res.status(404).json({ message: "Imagen no encontrada" });

  const imagePath = path.join(__dirname, "../", gallery[index].imageUrl);
  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

  gallery.splice(index, 1);
  saveGallery();
  res.json({ message: "Imagen eliminada" });
});

// 🔄 PUT - actualizar el orden de todas las imágenes
router.put("/reorder", (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds))
    return res.status(400).json({ error: "orderedIds debe ser un array" });

  // reasigna el orden según el arreglo recibido
  orderedIds.forEach((id, index) => {
    const img = gallery.find((g) => g.id == id);
    if (img) img.order = index + 1;
  });

  saveGallery();
  res.json({ success: true, message: "Orden actualizado correctamente", gallery });
});

module.exports = router;
