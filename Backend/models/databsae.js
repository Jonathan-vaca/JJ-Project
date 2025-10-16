// Backend/models/database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Ruta de la base de datos (archivo .sqlite dentro del proyecto)
const dbPath = path.resolve(__dirname, "../database.sqlite");

// Conexión a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al conectar con SQLite:", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite ✅");
  }
});

// Crear tabla de publicaciones si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS publicaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      contenido TEXT NOT NULL,
      imagen TEXT
    )
  `);
});

module.exports = db;
