// Backend/create-admin.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

(async () => {
  const nombre = 'Nuevo Admin';
  const email = 'nuevoadmin@jjr.com';
  const password = 'MiPass2025!'; // <- contraseña que usarás para loguearte
  const rol = 'admin';

  const hash = await bcrypt.hash(password, 10);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  await conn.execute(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hash, rol]
  );

  console.log('Admin creado:', email, 'contraseña (texto plano):', password);
  await conn.end();
})();
