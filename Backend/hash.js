const bcrypt = require("bcrypt");

(async () => {
  const password = "MiPass2025!"; // <--- ESTA es la contraseña que vas a usar para iniciar sesión
  const hash = await bcrypt.hash(password, 10);
  console.log("Contraseña (texto plano):", password);
  console.log("Hash generado (copia esto en la BD):", hash);
})();
