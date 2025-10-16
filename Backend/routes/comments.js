// Backend/routes/comments.js 
const express = require("express");
const db = require("../db.js");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

/**
 * 🔹 Obtener comentarios de una publicación
 * GET /api/posts/:id/comments
 */
router.get("/:postId/comments", async (req, res) => {
  const { postId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT c.id, c.comentario, c.creado_en, u.nombre 
       FROM comentarios c
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.publicacion_id = ?
       ORDER BY c.creado_en DESC`,
      [postId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener comentarios" });
  }
});

/**
 * 🔹 Agregar comentario a una publicación
 * POST /api/posts/:id/comments
 * Requiere estar logueado (authenticate)
 */
router.post("/:postId/comments", authenticate, async (req, res) => {
  const { postId } = req.params;
  const { comentario, estrellas } = req.body;
  const usuarioId = req.user.id; // 👈 viene del token

  if (!comentario || comentario.trim() === "") {
    return res.status(400).json({ error: "El comentario no puede estar vacío" });
  }

  try {
    // Insertar comentario
    await db.query(
      "INSERT INTO comentarios (publicacion_id, usuario_id, comentario) VALUES (?, ?, ?)",
      [postId, usuarioId, comentario]
    );

    // Si viene calificación, guardarla o actualizarla
    if (estrellas && estrellas >= 1 && estrellas <= 5) {
      await db.query(
        `INSERT INTO calificaciones (publicacion_id, usuario_id, estrellas)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE estrellas = VALUES(estrellas)`,
        [postId, usuarioId, estrellas]
      );
    }

    res.json({ mensaje: "Comentario agregado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar comentario" });
  }
});

module.exports = router;
