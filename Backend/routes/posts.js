// Backend/routes/posts.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage (igual que tienes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * Helper: convierte ruta física a url pública (web)
 * por ejemplo: uploads/123.jpg -> /uploads/123.jpg
 */
function toPublicPath(p) {
  if (!p) return null;
  if (p.startsWith('/')) return p;
  return '/' + p.replace(/\\/g, '/');
}

/**
 * Helper: intenta parsear JSON, si falla devuelve null
 */
function safeParseJson(str) {
  try {
    return str ? JSON.parse(str) : null;
  } catch (e) {
    return null;
  }
}

/* ---------------------------
   LIST posts (con avg rating)
   --------------------------- */
router.get('/', async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT p.*, 
        (SELECT AVG(estrellas) FROM calificaciones c WHERE c.publicacion_id = p.id) AS avgRating 
      FROM publicaciones p 
      ORDER BY p.creado_en DESC
    `);

    // Para cada post convertimos imagenes JSON a array y arreglamos rutas
    const result = posts.map(p => {
      // Si existe columna 'imagenes' como JSON string -> parsear
      const imgs = safeParseJson(p.imagenes);
      if (Array.isArray(imgs) && imgs.length) {
        p.imagenes = imgs.map(toPublicPath);
      } else if (p.imagen) {
        // legacy: si solo existe 'imagen' (singular), devolvemos como array con 1 item
        p.imagenes = [ toPublicPath(p.imagen) ];
      } else {
        p.imagenes = [];
      }

      // opcional: eliminar campo imagen para evitar duplicidad en la respuesta
      // delete p.imagen;
      return p;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'error interno' });
  }
});

/* ---------------------------
   GET single post
   --------------------------- */
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM publicaciones WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'no encontrado' });

    const post = rows[0];

    const imgs = safeParseJson(post.imagenes);
    if (Array.isArray(imgs) && imgs.length) {
      post.imagenes = imgs.map(toPublicPath);
    } else if (post.imagen) {
      post.imagenes = [ toPublicPath(post.imagen) ];
    } else {
      post.imagenes = [];
    }

    const [[avgRow]] = await pool.query(
      'SELECT AVG(estrellas) as avgRating FROM calificaciones WHERE publicacion_id = ?',
      [id]
    );
    post.avgRating = avgRow ? avgRow.avgRating : null;

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'error interno' });
  }
});

/* ---------------------------
   CREATE post (admin) - acepta varias imágenes
   --------------------------- */
router.post('/', authenticate, authorizeAdmin, upload.array('imagenes', 10), async (req, res) => {
  try {
    const { titulo, contenido } = req.body;

    // req.files es array si usamos upload.array
    const files = Array.isArray(req.files) ? req.files : [];
    // Construir rutas públicas
    const urls = files.map(f => path.join('uploads', f.filename).replace(/\\/g, '/'));

    // Insert dependiendo si tienes columna 'imagenes' o solo 'imagen'
    // Intentaremos insertar en 'imagenes' (JSON) si columna existe en DB.
    // Para compatibilidad, también insertamos la primera imagen en 'imagen' (legacy).
    const imagenesJson = urls.length ? JSON.stringify(urls) : null;
    const imagenSolo = urls.length ? urls[0] : null;

    // Comprobación simple: intentar insertar con campo imagenes
    // Si tu tabla no tiene la columna 'imagenes', esta consulta fallará; en ese caso
    // podemos hacer fallback a la consulta legacy.
    try {
      const [result] = await pool.query(
        'INSERT INTO publicaciones (titulo, contenido, imagenes, imagen) VALUES (?, ?, ?, ?)',
        [titulo, contenido, imagenesJson, imagenSolo]
      );
      return res.json({ ok: true, id: result.insertId });
    } catch (errInsert) {
      // Si falla (p. ej. columna imagenes no existe), hacemos fallback legacy:
      console.warn('insert with imagenes failed, falling back to legacy column:', errInsert.message);
      const [result2] = await pool.query(
        'INSERT INTO publicaciones (titulo, contenido, imagen) VALUES (?, ?, ?)',
        [titulo, contenido, imagenSolo]
      );
      return res.json({ ok: true, id: result2.insertId });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'error interno' });
  }
});

/* ---------------------------
   UPDATE post (admin) - acepta varias imágenes
   - Si se suben nuevas imágenes, borramos las antiguas (si existe esa lógica en tu app)
   - Si no subes nuevas imágenes, dejamos las existentes (backend deja esa lógica)
   --------------------------- */
router.put('/:id', authenticate, authorizeAdmin, upload.array('imagenes', 10), async (req, res) => {
  try {
    const id = req.params.id;
    const { titulo, contenido } = req.body;
    const files = Array.isArray(req.files) ? req.files : [];
    const newUrls = files.map(f => path.join('uploads', f.filename).replace(/\\/g, '/'));

    // Obtener post actual para borrar imágenes si es necesario
    const [rows] = await pool.query('SELECT imagenes, imagen FROM publicaciones WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'no encontrado' });
    const post = rows[0];

    // Si se subieron nuevas imágenes -> por simplicidad aquí reemplazamos el array completo
    // Si quieres lógica de "añadir sin eliminar" o "eliminar ciertas", implementamos controles adicionales.
    if (newUrls.length > 0) {
      // Borrar archivos anteriores (si existían)
      const oldImgs = safeParseJson(post.imagenes);
      if (Array.isArray(oldImgs)) {
        oldImgs.forEach(p => {
          try {
            const full = path.join(__dirname, '..', p);
            if (fs.existsSync(full)) fs.unlinkSync(full);
          } catch (e) { /* ignore */ }
        });
      } else if (post.imagen) {
        try {
          const full = path.join(__dirname, '..', post.imagen);
          if (fs.existsSync(full)) fs.unlinkSync(full);
        } catch (e) { /* ignore */ }
      }

      const imagenesJson = JSON.stringify(newUrls);
      const imagenSolo = newUrls[0] || null;

      try {
        await pool.query(
          'UPDATE publicaciones SET titulo = ?, contenido = ?, imagenes = ?, imagen = ? WHERE id = ?',
          [titulo, contenido, imagenesJson, imagenSolo, id]
        );
      } catch (errUpdate) {
        // Fallback si no existe columna imagenes
        console.warn('update with imagenes failed, falling back to legacy column:', errUpdate.message);
        await pool.query(
          'UPDATE publicaciones SET titulo = ?, contenido = ?, imagen = ? WHERE id = ?',
          [titulo, contenido, imagenSolo, id]
        );
      }
    } else {
      // No se subieron nuevas imágenes -> actualizamos solo titulo y contenido
      await pool.query('UPDATE publicaciones SET titulo = ?, contenido = ? WHERE id = ?', [titulo, contenido, id]);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'error interno' });
  }
});

/* ---------------------------
   DELETE post (admin)
   - Borramos todas las imágenes relacionadas (si existen)
   --------------------------- */
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT imagenes, imagen FROM publicaciones WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'no encontrado' });

    const post = rows[0];
    const imgs = safeParseJson(post.imagenes);

    if (Array.isArray(imgs) && imgs.length) {
      imgs.forEach(p => {
        try { fs.unlinkSync(path.join(__dirname, '..', p)); } catch (e) { /* ignore */ }
      });
    } else if (post.imagen) {
      try { fs.unlinkSync(path.join(__dirname, '..', post.imagen)); } catch (e) { /* ignore */ }
    }

    await pool.query('DELETE FROM publicaciones WHERE id = ?', [id]);
    await pool.query('DELETE FROM comentarios WHERE publicacion_id = ?', [id]);
    await pool.query('DELETE FROM calificaciones WHERE publicacion_id = ?', [id]);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'error interno' });
  }
});

/* ---------------------------
   COMMENTS & RATINGS (sin cambios)
   --------------------------- */

// LIST comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      `SELECT c.id, c.publicacion_id, c.usuario_id, c.comentario, c.creado_en, u.nombre 
       FROM comentarios c
       LEFT JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.publicacion_id = ? 
       ORDER BY c.creado_en DESC`, 
       [id]
    );

    res.json(rows);
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: 'error interno' }); 
  }
});

// POST comment (and optionally rating)
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const publicacion_id = req.params.id;
    const { comentario, estrellas } = req.body;
    const usuario_id = req.user.id;

    if (!comentario || comentario.trim() === "") {
      return res.status(400).json({ error: "El comentario no puede estar vacío" });
    }

    const [r] = await pool.query(
      'INSERT INTO comentarios (publicacion_id, usuario_id, comentario) VALUES (?, ?, ?)', 
      [publicacion_id, usuario_id, comentario]
    );

    if (estrellas && estrellas >= 1 && estrellas <= 5) {
      await pool.query(`
        INSERT INTO calificaciones (publicacion_id, usuario_id, estrellas)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE estrellas = VALUES(estrellas)
      `, [publicacion_id, usuario_id, estrellas]);
    }

    res.json({ ok: true, id: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar comentario' });
  }
});

// UPDATE comment (only owner)
router.put('/:postId/comments/:commentId', authenticate, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { comentario } = req.body;
    const userId = req.user.id;

    if (!comentario || comentario.trim() === "") {
      return res.status(400).json({ error: "El comentario no puede estar vacío" });
    }

    const [rows] = await pool.query(
      'SELECT usuario_id FROM comentarios WHERE id=? AND publicacion_id=?',
      [commentId, postId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Comentario no encontrado" });

    if (rows[0].usuario_id !== userId) {
      return res.status(403).json({ error: "No autorizado para editar este comentario" });
    }

    await pool.query('UPDATE comentarios SET comentario=? WHERE id=?', [comentario, commentId]);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al editar comentario" });
  }
});

// DELETE comment (owner or admin)
router.delete('/:postId/comments/:commentId', authenticate, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.rol === "admin";

    const [rows] = await pool.query(
      'SELECT usuario_id FROM comentarios WHERE id=? AND publicacion_id=?',
      [commentId, postId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Comentario no encontrado" });

    if (rows[0].usuario_id !== userId && !isAdmin) {
      return res.status(403).json({ error: "No autorizado para eliminar este comentario" });
    }

    await pool.query('DELETE FROM comentarios WHERE id=?', [commentId]);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar comentario" });
  }
});

module.exports = router;
