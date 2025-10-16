// Backend/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db.js");

const router = express.Router();

// 🔹 Registro de usuario (texto plano)
router.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // Guardar contraseña directamente en texto plano
    const [result] = await db.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, 'usuario')",
      [nombre, email, password]
    );

    res.json({ mensaje: "Usuario registrado con éxito", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el registro" });
  }
});

// 🔹 Login de usuario (texto plano)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const usuario = rows[0];

    // Comparación en texto plano
    if (usuario.password !== password) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Crear token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      "secreto_jwt",
      { expiresIn: "7d" }
    );

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el login" });
  }
});

// 🔹 Logout
router.post("/logout", (req, res) => {
  res.json({ mensaje: "Sesión cerrada en el cliente" });
});

module.exports = router;
