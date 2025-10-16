// Backend/hash-admin.js
require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcrypt');

async function run() {
  try {
    const newPass = 'TuNuevaPassAdmin'; // cambia aquí
    const hash = await bcrypt.hash(newPass, 10);
    // ajusta el WHERE para identificar al admin: email o nombre
    await pool.query('UPDATE usuarios SET password = ? WHERE email = ?', [hash, 'admin@jjr.com']);
    console.log('Contraseña del admin actualizada. Usa:', newPass);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
