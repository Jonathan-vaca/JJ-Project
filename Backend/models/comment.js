// Backend/models/comment.js
const db = require('../db');

// Obtener comentarios por publicacion_id
async function getCommentsByPost(postId) {
  const sql = `
    SELECT c.id, c.comentario, c.creado_en, u.nombre 
    FROM comentarios c
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.publicacion_id = ?
    ORDER BY c.creado_en DESC
  `;
  return await db.all(sql, [postId]);
}

// Crear un comentario
async function addComment(postId, userId, comentario) {
  const sql = `
    INSERT INTO comentarios (publicacion_id, usuario_id, comentario)
    VALUES (?, ?, ?)
  `;
  const result = await db.run(sql, [postId, userId, comentario]);
  return result.lastID;
}

// Crear o actualizar calificación
async function upsertRating(postId, userId, estrellas) {
  const sql = `
    INSERT INTO calificaciones (publicacion_id, usuario_id, estrellas)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE estrellas = VALUES(estrellas)
  `;
  await db.run(sql, [postId, userId, estrellas]);
}

// Obtener promedio de calificaciones
async function getAvgRating(postId) {
  const sql = `
    SELECT AVG(estrellas) as avgRating
    FROM calificaciones
    WHERE publicacion_id = ?
  `;
  const row = await db.get(sql, [postId]);
  return row?.avgRating || null;
}

module.exports = {
  getCommentsByPost,
  addComment,
  upsertRating,
  getAvgRating
};
